import { daysUntil } from "./data";
import type { Discovery } from "./import-types";

export type SavedSummary = {
  key: string;
  title: string;
  organization: string;
  endsAt: string;
};

export type SavedJob = SavedSummary & {
  href: string;
  startsAt?: string;
  availability?: Discovery["availability"];
  sample?: boolean;
};

export function readApplications(raw: string) {
  const applications = new Map<string, SavedSummary>();
  try {
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) return applications;
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      const { key, title, organization, endsAt } = entry;
      if (
        typeof key !== "string" ||
        !/^[a-z0-9-]{1,160}$/.test(key) ||
        typeof title !== "string" ||
        !title.trim() ||
        typeof organization !== "string" ||
        !organization.trim() ||
        typeof endsAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endsAt) ||
        !Number.isFinite(Date.parse(endsAt)) ||
        new Date(endsAt).toISOString().slice(0, 10) !== endsAt
      )
        continue;
      applications.set(key, {
        key,
        title: title.slice(0, 300),
        organization: organization.slice(0, 220),
        endsAt,
      });
    }
  } catch {
    // An invalid local value does not prevent the saved list from loading.
  }
  return applications;
}

export function savedApplications(
  keys: string[],
  catalog: SavedJob[],
  sent: ReadonlyMap<string, SavedSummary>,
  now = new Date(),
) {
  const jobs = new Map(catalog.map((job) => [job.key, job]));
  const unavailable: string[] = [];
  const rows = [...new Set(keys)].flatMap((key) => {
    const current = jobs.get(key);
    const summary = current ?? sent.get(key);
    if (!summary) {
      unavailable.push(key);
      return [];
    }
    const rank = !current ? 2 : daysUntil(current.endsAt, now) < 0 ? 1 : 0;
    return [{ summary, current, sent: sent.has(key), rank }];
  });
  rows.sort(
    (a, b) =>
      a.rank - b.rank ||
      (a.rank === 0
        ? a.summary.endsAt.localeCompare(b.summary.endsAt)
        : b.summary.endsAt.localeCompare(a.summary.endsAt)),
  );
  return { rows, unavailable };
}
