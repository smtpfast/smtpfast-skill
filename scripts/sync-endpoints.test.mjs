import { test } from "node:test";
import assert from "node:assert/strict";
import { operations, renderEndpoints, uncovered, stale, renderReport, bumpPatch } from "./sync-endpoints.mjs";

const spec = {
  tags: [{ name: "Emails", description: "Send and read email" }, { name: "Domains" }],
  paths: {
    "/v1/domains": { get: { tags: ["Domains"], summary: "List domains" } },
    "/v1/emails": {
      post: { tags: ["Emails"], summary: "Send an email" },
      get: { tags: ["Emails"], summary: "List | emails\n sent" },
    },
    "/v1/me": { get: { summary: "Who am I" } },
  },
};

test("lists every operation with its tag", () => {
  assert.deepEqual(
    operations(spec).map((o) => `${o.method} ${o.path} ${o.tag}`),
    ["GET /v1/domains Domains", "GET /v1/emails Emails", "POST /v1/emails Emails", "GET /v1/me Other"],
  );
});

test("groups by tag in path order and escapes table text", () => {
  const md = renderEndpoints(spec);
  assert.ok(md.indexOf("## Domains") < md.indexOf("## Emails"));
  assert.ok(md.includes("Send and read email"));
  assert.ok(md.includes("## Other"));
  assert.ok(md.includes("| GET | `/v1/emails` | List \\| emails sent |"));
  assert.ok(md.includes("4 operations."));
});

test("an operation counts as covered only with its method in a table row", () => {
  const reference = "| POST | `/v1/emails` | Send |\n| GET | `/v1/domains` | List |\nSee GET /v1/me in prose.\n";
  assert.deepEqual(uncovered(spec, reference).map((o) => `${o.method} ${o.path}`), ["GET /v1/emails", "GET /v1/me"]);
  assert.equal(renderReport([]), "");
  assert.ok(renderReport(uncovered(spec, reference)).includes("| GET | `/v1/me` | Who am I |"));
});

test("reads rows with several methods, inline methods and shortened paths", () => {
  const big = {
    paths: {
      "/v1/inboxes/{inbox_id}": { get: {}, patch: {}, delete: {} },
      "/v1/inboxes/{inbox_id}/labels": { get: {}, post: {} },
      "/v1/inboxes/{inbox_id}/labels/{label_id}": { patch: {}, delete: {} },
      "/v1/inboxes/{inbox_id}/drafts": { get: {} },
    },
  };
  const reference = [
    "## Inboxes",
    "All paths are under `/v1/inboxes/{inbox_id}`.",
    "| GET/PATCH/DELETE | `/v1/inboxes/{inbox_id}` | Manage an inbox. |",
    "| GET/POST | `.../labels`, PATCH/DELETE `.../labels/{label_id}` | Manage labels. |",
  ].join("\n");
  assert.deepEqual(uncovered(big, reference).map((o) => `${o.method} ${o.path}`), ["GET /v1/inboxes/{inbox_id}/drafts"]);
});

test("a shortened path covers only its own base, never a same-named path elsewhere", () => {
  const s3 = { paths: { "/v1/inboxes/{inbox_id}/drafts": { get: {} }, "/v1/drafts": { get: {} } } };
  const reference = "## Inboxes\nAll paths are under `/v1/inboxes/{inbox_id}`.\n| GET | `.../drafts` | Drafts. |\n## Other\n| GET | `.../drafts` | No base here. |\n";
  assert.deepEqual(uncovered(s3, reference).map((o) => o.path), ["/v1/drafts"]);
});

test("path parameter names do not matter, and rows that match nothing are reported", () => {
  const s2 = { paths: { "/v1/forms/{id}/pending/{pendingId}/approve": { post: { summary: "Approve" } }, "/v1/api-keys/{id}": { delete: {} } } };
  const reference = "| POST | `/v1/forms/{id}/pending/{pending_id}/approve` | Approve. |\n| GET/DELETE | `/v1/api-keys/{id}` | Get or revoke. |\n";
  assert.deepEqual(uncovered(s2, reference), []);
  assert.deepEqual(stale(s2, reference), [{ method: "GET", path: "/v1/api-keys/{id}" }]);
  assert.ok(renderReport([], stale(s2, reference)).includes("- GET `/v1/api-keys/{id}`"));
});

test("bumps the patch number", () => {
  assert.equal(bumpPatch("0.4.0"), "0.4.1");
  assert.equal(bumpPatch("1.2.9"), "1.2.10");
  assert.throws(() => bumpPatch("v1"));
});
