import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/portal-store";
import { editorialView } from "@/lib/job-view";
import { JobDetail } from "@/components/JobDetail";
import { Advertisement } from "@/components/Advertisement";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const { opportunities } = await getCatalog();
  const o = opportunities.find((o) => o.slug === slug);
  return o
    ? {
        title: o.title + " · " + o.organization,
        description: o.summary,
        robots: o.isSample ? { index: false, follow: true } : undefined,
        alternates: { canonical: "/convocatorias/" + o.slug },
      }
    : { title: "Convocatoria no encontrada" };
}
export default async function Detail({ params }: Props) {
  const slug = (await params).slug;
  const { opportunities } = await getCatalog();
  const o = opportunities.find((o) => o.slug === slug);
  if (!o) notFound();
  return (
    <>
      <JobDetail job={editorialView(o)} />
      <div className="container">
        <Advertisement placement="opportunity" eligible={!o.isSample} />
      </div>
    </>
  );
}
