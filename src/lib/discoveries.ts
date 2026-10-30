import type { PortalRecord } from "./portal-types";
import {
  importSources,
  type ImportCandidate,
  type Discovery,
} from "./import-types";
import { daysUntil, type Opportunity } from "./data";
import { normalize, type Filters } from "./search";

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
          id: r.id,
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

export function discoveryKey(discovery: Pick<Discovery, "id">) {
  return "hallazgo-" + discovery.id;
}

export function excludeReviewedDiscoveries(
  discoveries: Discovery[],
  opportunities: Opportunity[],
) {
  return discoveries.filter(
    (c) =>
      !opportunities.some(
        (o) =>
          o.importProvenance?.candidateId === c.id &&
          o.endsAt === c.endsAt &&
          normalize(o.title) === normalize(c.title),
      ),
  );
}

export function filterDiscoveryOpportunities(
  discoveries: Discovery[],
  filters: Filters,
) {
  // The sources do not provide modality, careers or vacancy counts.
  // Unknown fields must never be presented as a match for those filters.
  if (
    filters.modalidad ||
    filters.estado === "finalizadas" ||
    (filters.sector && filters.sector !== "Publico")
  )
    return [];
  return filterDiscoveries(discoveries, filters.q || "", "").filter(
    (c) =>
      (!filters.tipo || c.type === filters.tipo) &&
      (!filters.departamento ||
        (!!c.location &&
          normalize(c.location)
            .split(/\s*[,;/–—-]\s*/)
            .includes(normalize(filters.departamento)))),
  );
}
