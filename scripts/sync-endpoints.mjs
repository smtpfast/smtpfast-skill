#!/usr/bin/env node
// Keeps the skill in step with the SMTPfast API.
//
//   node scripts/sync-endpoints.mjs                  print what would change
//   node scripts/sync-endpoints.mjs --write          rewrite references/endpoints.md
//   node scripts/sync-endpoints.mjs --write --bump   also bump the patch version when it changed
//   --spec <file|url>   spec to read (default: the live spec)
//   --report <file>     write the operations api-reference.md does not mention, as Markdown
//
// endpoints.md is generated and complete. api-reference.md is written by hand
// and explains how to use the API; the report lists what it does not cover yet.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(ROOT, "plugins", "smtpfast", "skills", "smtpfast");
const ENDPOINTS = join(SKILL, "references", "endpoints.md");
const REFERENCE = join(SKILL, "references", "api-reference.md");
const VERSION_FILES = ["plugin.json", "plugins/smtpfast/.claude-plugin/plugin.json", ".claude-plugin/marketplace.json"];
const METHODS = ["get", "post", "put", "patch", "delete"];

/** Every operation in the spec, in spec order: { method, path, tag, summary }. */
export function operations(spec) {
  const out = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      const op = item?.[method];
      if (!op) continue;
      out.push({ method: method.toUpperCase(), path, tag: op.tags?.[0] ?? "Other", summary: oneLine(op.summary ?? "") });
    }
  }
  return out;
}

function oneLine(s) {
  return s.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
}

/** The generated endpoint index, grouped by tag in the order the tags first appear in the paths. */
export function renderEndpoints(spec) {
  const ops = operations(spec);
  const tags = [...new Set(ops.map((o) => o.tag))];
  const descriptions = new Map((spec.tags ?? []).map((t) => [t.name, t.description]));
  const lines = [
    "# SMTPfast endpoint index",
    "",
    "Every operation in the SMTPfast API, generated from the live OpenAPI spec (`https://smtpfa.st/api/v1/openapi.json`) by `scripts/sync-endpoints.mjs`. Do not edit by hand.",
    "",
    "Base URL `https://smtpfa.st/api`, auth `Authorization: Bearer <API_KEY>`. For fields, examples and gotchas, read `api-reference.md`; for anything it does not cover, fetch the spec.",
    "",
    `${ops.length} operations.`,
    "",
  ];
  for (const tag of tags) {
    lines.push(`## ${tag}`, "");
    if (descriptions.get(tag)) lines.push(oneLine(descriptions.get(tag)), "");
    lines.push("| Method | Path | Summary |", "| --- | --- | --- |");
    for (const o of ops.filter((x) => x.tag === tag)) lines.push(`| ${o.method} | \`${o.path}\` | ${o.summary} |`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * The method and path pairs the hand-written reference documents in its
 * tables. A row may list several methods (`GET/PATCH/DELETE`), several paths
 * with their own methods (`.../labels`, PATCH/DELETE `.../labels/{label_id}`),
 * and paths shortened with `...` to their tail.
 */
export function documented(reference) {
  const pairs = [];
  for (const row of reference.matchAll(/^\|\s*([A-Z]+(?:\/[A-Z]+)*)\s*\|([^|\n]*)\|/gm)) {
    const rowMethods = row[1].split("/");
    for (const m of row[2].matchAll(/(?:\b([A-Z]+(?:\/[A-Z]+)*)\s+)?`([^`]+)`/g)) {
      for (const method of m[1] ? m[1].split("/") : rowMethods) pairs.push({ method, path: m[2] });
    }
  }
  return pairs;
}

/** Path parameter names differ between pages ({pending_id} vs {pendingId}); compare paths without them. */
const shape = (path) => path.replace(/\{[^}]+\}/g, "{}");

function covers(o, p) {
  if (p.method !== o.method) return false;
  return p.path.startsWith("...") ? shape(o.path).endsWith(shape(p.path.slice(3))) : shape(p.path) === shape(o.path);
}

/** Operations the hand-written reference does not document in any table row. */
export function uncovered(spec, reference) {
  const pairs = documented(reference);
  return operations(spec).filter((o) => !pairs.some((p) => covers(o, p)));
}

/** Rows in the hand-written reference that match no operation in the spec: removed or mistyped endpoints. */
export function stale(spec, reference) {
  const ops = operations(spec);
  return documented(reference).filter((p) => p.path.includes("/v1/") || p.path.startsWith("...")).filter((p) => !ops.some((o) => covers(o, p)));
}

export function renderReport(missing, extra = []) {
  if (missing.length === 0 && extra.length === 0) return "";
  const lines = [];
  if (missing.length > 0) {
    lines.push(
      "These API operations are in the generated `references/endpoints.md` but not in the hand-written `references/api-reference.md`. Add a row (and notes where they help) under the right section.",
      "",
      "| Method | Path | Summary |",
      "| --- | --- | --- |",
      ...missing.map((o) => `| ${o.method} | \`${o.path}\` | ${o.summary} |`),
      "",
    );
  }
  if (extra.length > 0) {
    lines.push(
      "These rows in `references/api-reference.md` match no operation in the API spec. The endpoint was removed or renamed, or the row has a typo.",
      "",
      ...extra.map((p) => `- ${p.method} \`${p.path}\``),
      "",
    );
  }
  lines.push("This issue is updated by the Spec sync workflow.");
  return lines.join("\n") + "\n";
}

export function bumpPatch(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!m) throw new Error(`not a version: ${version}`);
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}

/** Bump every manifest to one version: the highest of them, plus a patch. */
function bumpVersions() {
  const read = (f) => JSON.parse(readFileSync(join(ROOT, f), "utf8"));
  const versionOf = (f, j) => (f.endsWith("marketplace.json") ? j.plugins.find((p) => p.name === "smtpfast").version : j.version);
  const current = VERSION_FILES.map((f) => versionOf(f, read(f)));
  const highest = current.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).at(-1);
  const next = bumpPatch(highest);
  for (const f of VERSION_FILES) {
    const j = read(f);
    if (f.endsWith("marketplace.json")) j.plugins.find((p) => p.name === "smtpfast").version = next;
    else j.version = next;
    writeFileSync(join(ROOT, f), JSON.stringify(j, null, 2) + "\n");
  }
  return next;
}

async function loadSpec(source) {
  if (!/^https?:\/\//.test(source)) return JSON.parse(readFileSync(source, "utf8"));
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(source, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= 3) throw new Error(`could not fetch ${source}: ${err.message}`);
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name) => {
    const i = process.argv.indexOf(name);
    return i === -1 ? undefined : process.argv[i + 1];
  };
  const spec = await loadSpec(arg("--spec") ?? "https://smtpfa.st/api/v1/openapi.json");
  if (!spec?.paths || Object.keys(spec.paths).length === 0) throw new Error("the spec has no paths");
  const next = renderEndpoints(spec);
  const before = existsSync(ENDPOINTS) ? readFileSync(ENDPOINTS, "utf8") : "";
  const changed = before !== next;
  if (process.argv.includes("--write") && changed) {
    writeFileSync(ENDPOINTS, next);
    if (process.argv.includes("--bump")) console.log(`version ${bumpVersions()}`);
  }
  const reference = readFileSync(REFERENCE, "utf8");
  const missing = uncovered(spec, reference);
  const extra = stale(spec, reference);
  if (arg("--report")) writeFileSync(arg("--report"), renderReport(missing, extra));
  console.log(
    `${operations(spec).length} operations; endpoints.md ${changed ? "changed" : "unchanged"}; ${missing.length} not in api-reference.md; ${extra.length} rows match nothing`,
  );
}
