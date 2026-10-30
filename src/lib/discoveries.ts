import type { PortalRecord } from "./portal-types";
import {
  importSources,
  type ImportCandidate,
  type Discovery,
} from "./import-types";
import { daysUntil } from "./data";
import { normalize } from "./search";

export function publicDiscoveries(
  records: PortalRecord[],
  now = new Date(),
): Discovery[] {
  return records
    .filter((r) => r.kind === "import" && r.status === "draft" && !r.sample)
    .flatMap((r) => {
      const c = r.payload as ImportCandidate;
      const source = importSources.find((s) => s.id === c.sourceId);
      const age = now.getTime() - Date.parse(c.lastCheckedAt);
      let safeSource = false;
      try {
        const url = new URL(c.sourceUrl);
        safeSource =
          !!source &&
          url.protocol === "https:" &&
          url.origin === new URL(source.url).origin &&
          url.pathname.startsWith(new URL(source.url).pathname) &&
          !url.username &&
          !url.password;
      } catch {}
      if (
        !safeSource ||
        c.noLongerListedAt ||
        !Number.isFinite(age) ||
        age < -60000 ||
        age > 48 * 3600000 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(c.endsAt) ||
        !Number.isFinite(daysUntil(c.endsAt, now)) ||
        daysUntil(c.endsAt, now) < 0
      )
        return [];
      return [
        {
          sourceId: c.sourceId,
          reference: c.reference,
          title: c.title,
          organization: c.organization,
          sourceUrl: c.sourceUrl,
          startsAt: c.startsAt,
          endsAt: c.endsAt,
          lastCheckedAt: c.lastCheckedAt,
          type: c.type || "CAS",
          location: c.location,
        },
      ];
    })
    .sort(
      (a, b) =>
        a.endsAt.localeCompare(b.endsAt) ||
        a.title.localeCompare(b.title, "es"),
    );
}
export function filterDiscoveries(
  discoveries: Discovery[],
  q: string,
  source: string,
) {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  return discoveries.filter(
    (c) =>
      (!source || c.sourceId === source) &&
      words.every((word) =>
        normalize(
          c.title +
            " " +
            c.organization +
            " " +
            c.reference +
            " " +
            (c.location || ""),
        ).includes(word),
      ),
  );
}
