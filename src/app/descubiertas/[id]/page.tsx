import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiscovery } from "@/lib/portal-store";
import { discoveryView } from "@/lib/job-view";
import { JobDetail } from "@/components/JobDetail";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getDiscovery((await params).id);
  return c
    ? {
        title: c.title + " · " + c.organization,
        description:
          c.details?.summary ||
          "Fechas, requisitos y bases oficiales de la convocatoria.",
        robots: { index: false, follow: true },
        alternates: { canonical: "/descubiertas/" + c.id },
      }
    : { title: "Convocatoria no disponible" };
}
export default async function DiscoveryDetail({ params }: Props) {
  const c = await getDiscovery((await params).id);
  if (!c) notFound();
  return <JobDetail job={discoveryView(c)} />;
}
