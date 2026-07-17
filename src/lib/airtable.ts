import "server-only";

/*
 * Airtable access via the Airtable REST API directly, authenticated with a
 * personal access token. (high-seas fronts Airtable with the middleman proxy
 * for caching, but that proxy 403/406'd our base; the PAT works against the
 * REST API directly, so we use that and keep the token server-side.)
 *
 * Env:
 *   AIRTABLE_API_KEY  — Airtable personal access token (pat...)
 *   AIRTABLE_BASE_ID  — the Boba Bash base id (app...)
 */

const PROXY = "https://api.airtable.com/v0";
const UA = "bash.hackclub.com";

export type TableName =
  | "people"
  | "meetups"
  | "signups"
  | "submissions"
  | "payouts"
  | "magic_links";

export interface AirtableRecord<F> {
  id: string;
  createdTime: string;
  fields: F;
}

function baseUrl(table: TableName): string {
  const base = process.env.AIRTABLE_BASE_ID;
  if (!base) throw new Error("Env AIRTABLE_BASE_ID is not set");
  return `${PROXY}/${base}/${table}`;
}

function authHeaders(action: string): HeadersInit {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error("Env AIRTABLE_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "User-Agent": `${UA} (${action})`,
  };
}

async function readJson(res: Response, action: string) {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${action} failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Find records with an optional Airtable formula. Returns up to `maxRecords`. */
export async function selectRecords<F>(
  table: TableName,
  opts: { filterByFormula?: string; maxRecords?: number } = {},
): Promise<AirtableRecord<F>[]> {
  const params = new URLSearchParams();
  if (opts.filterByFormula)
    params.set("filterByFormula", opts.filterByFormula);
  if (opts.maxRecords) params.set("maxRecords", String(opts.maxRecords));

  const url = `${baseUrl(table)}?${params.toString()}`;
  const res = await fetch(url, { headers: authHeaders(`select:${table}`) });
  const data = await readJson(res, `select ${table}`);
  return data.records ?? [];
}

/** Convenience: the first record matching a formula, or null. */
export async function findOne<F>(
  table: TableName,
  filterByFormula: string,
): Promise<AirtableRecord<F> | null> {
  const records = await selectRecords<F>(table, {
    filterByFormula,
    maxRecords: 1,
  });
  return records[0] ?? null;
}

/** Fetch a single record by its Airtable record id. */
export async function getRecord<F>(
  table: TableName,
  id: string,
): Promise<AirtableRecord<F>> {
  const res = await fetch(`${baseUrl(table)}/${id}`, {
    headers: authHeaders(`get:${table}`),
  });
  const data = await readJson(res, `get ${table}`);
  return data as AirtableRecord<F>;
}

/** Create one record; returns the created record. */
export async function createRecord<F>(
  table: TableName,
  fields: Partial<F>,
): Promise<AirtableRecord<F>> {
  const res = await fetch(baseUrl(table), {
    method: "POST",
    headers: authHeaders(`create:${table}`),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const data = await readJson(res, `create ${table}`);
  return data as AirtableRecord<F>;
}

/** Patch one record by id; returns the updated record. */
export async function updateRecord<F>(
  table: TableName,
  id: string,
  fields: Partial<F>,
): Promise<AirtableRecord<F>> {
  const res = await fetch(`${baseUrl(table)}/${id}`, {
    method: "PATCH",
    headers: authHeaders(`update:${table}`),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const data = await readJson(res, `update ${table}`);
  return data as AirtableRecord<F>;
}

/** Escape a value for safe interpolation into an Airtable formula string. */
export function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
