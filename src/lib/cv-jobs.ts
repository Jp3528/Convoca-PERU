import "server-only";
import { getCatalog, getDiscoveries, getDiscovery } from "./portal-store";
import { discoveryView, editorialView } from "./job-view";
import type { CvJob } from "./cv-analysis";
import type { JobView } from "./job-view";
const option = (j: JobView): CvJob => ({
  key: j.key,
  title: j.title,
  organization: j.organization,
  type: j.type,
  requirements: j.requirements,
  summary: j.summary,
  href: j.href,
  sample: j.sample,
});
export async function cvJobOptions() {
  const [catalog, discoveries] = await Promise.all([
    getCatalog(),
    getDiscoveries(),
  ]);
  return [
    ...discoveries.map(discoveryView),
    ...catalog.opportunities.map(editorialView),
  ].map(option);
}
export async function resolveCvJob(key: string) {
  if (key.startsWith("hallazgo-")) {
    const discovery = await getDiscovery(key.slice(9));
    return discovery ? option(discoveryView(discovery)) : null;
  }
  const catalog = await getCatalog();
  const o = catalog.opportunities.find((o) => o.slug === key);
  return o ? option(editorialView(o)) : null;
}
