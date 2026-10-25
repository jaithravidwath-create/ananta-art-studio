import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { EmptyState, ErrorState, LoadingState, PageHeader, StudioShell } from "@/components/StudioShell";

export default function Paintings() {
  const query = trpc.catalog.listAvailable.useQuery();
  return <StudioShell><div className="container page-wrap"><PageHeader kicker="The collection · 10 works available" title="Paintings with a life of their own." intro="A considered selection of original works from artists working across India’s living traditions. Each work is singular; once it leaves the studio, it will not return." />{query.isLoading ? <LoadingState label="Opening the gallery…" /> : query.error ? <ErrorState message={query.error.message} retry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="The walls are quiet." body="There are no available works at this moment. Please check again soon." /> : <div className="painting-grid">{query.data.map((painting, index) => <Link href={`/paintings/${painting.id}`} className="painting-card" key={painting.id}><div className="painting-image"><img src={`/${painting.imageUrl}`} alt={painting.title} /><span className="image-index">{String(index + 1).padStart(2, "0")}</span><span className="view-work">View work <ArrowRight size={14} /></span></div><div className="catalog-meta"><span>{painting.artist}</span><span>₹{painting.price.toLocaleString("en-IN")}</span></div><h2>{painting.title}</h2><p>{painting.description}</p></Link>)}</div>}</div></StudioShell>;
}
