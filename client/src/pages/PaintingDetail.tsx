import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ErrorState, LoadingState, ProtectedNotice, StudioShell } from "@/components/StudioShell";

export default function PaintingDetail() {
  const [, params] = useRoute("/paintings/:id");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery();
  const painting = trpc.catalog.get.useQuery({ id: params?.id ?? "" }, { enabled: Boolean(params?.id) });
  const buy = trpc.paintings.buy.useMutation({ onSuccess: () => { toast.success("The work is reserved in your studio register."); utils.catalog.get.invalidate({ id: params?.id ?? "" }); utils.catalog.listAvailable.invalidate(); setLocation("/dashboard"); }, onError: error => toast.error(error.message) });
  if (painting.isLoading) return <StudioShell><div className="container page-wrap"><LoadingState label="Bringing the work into view…" /></div></StudioShell>;
  if (painting.error || !painting.data) return <StudioShell><div className="container page-wrap"><ErrorState message={painting.error?.message ?? "Painting not found."} /></div></StudioShell>;
  const work = painting.data;
  return <StudioShell><div className="container detail-wrap"><Link href="/paintings" className="back-link"><ArrowLeft size={15} /> Back to the collection</Link><div className="detail-grid"><div className="detail-image"><img src={`/${work.imageUrl}`} alt={work.title} /></div><article className="detail-copy"><span className="eyebrow">{work.artist} · Original work</span><h1>{work.title}</h1><p className="detail-description">{work.description}</p><div className="detail-rule" /><div className="price-line"><span>Price</span><strong>₹{work.price.toLocaleString("en-IN")}</strong></div>{work.status === "available" ? me.data ? <button className="button button-dark wide-button" disabled={buy.isPending} onClick={() => buy.mutate({ paintingId: work.id })}>{buy.isPending ? "Reserving…" : "Reserve this work"} <ArrowRight size={16} /></button> : <Link className="button button-dark wide-button" href={`/login?next=/paintings/${work.id}`}>Sign in to reserve <ArrowRight size={16} /></Link> : <div className="sold-note"><LockKeyhole size={16} /><div><strong>This work has found its home.</strong><span>It is no longer available to reserve.</span></div></div>}<p className="detail-footnote">Buying creates a studio order only. No payment is taken here; the studio will follow up with the next steps.</p></article></div></div></StudioShell>;
}
