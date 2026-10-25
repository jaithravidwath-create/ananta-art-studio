import { FormEvent, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader, ProtectedNotice, StudioShell } from "@/components/StudioShell";

const datePlus = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

export default function Pottery() {
  const meta = trpc.catalog.meta.useQuery();
  const me = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const [itemId, setItemId] = useState("i-01");
  const [glazeId, setGlazeId] = useState("g-01");
  const [quantity, setQuantity] = useState(1);
  const [neededBy, setNeededBy] = useState(datePlus(14));
  const [done, setDone] = useState(false);
  const create = trpc.customer.createPottery.useMutation({ onSuccess: () => { setDone(true); utils.customer.dashboard.invalidate(); toast.success("Your pottery request is with the bench."); }, onError: error => toast.error(error.message) });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ itemId, glazeId, quantity, neededBy }); };
  if (me.isLoading || meta.isLoading) return <StudioShell><div className="container page-wrap"><LoadingState /></div></StudioShell>;
  if (!me.data) return <StudioShell><div className="container page-wrap"><ProtectedNotice /></div></StudioShell>;
  if (meta.error) return <StudioShell><div className="container page-wrap"><ErrorState message={meta.error.message} retry={() => meta.refetch()} /></div></StudioShell>;
  if (!meta.data?.potteryItems.length || !meta.data.glazes.length) return <StudioShell><div className="container page-wrap"><EmptyState title="The pottery shelves are quiet." body="The studio catalogue has no forms or glazes available yet." /></div></StudioShell>;
  return <StudioShell><div className="container page-wrap narrow-page"><PageHeader kicker="The pottery bench" title="An object made to be kept." intro="Choose one of the studio forms, a glaze from the shelf, and the date by which you need it." />{done && <Notice>Request received. You can edit or cancel it while it remains requested. <Link href="/dashboard" className="notice-link">View your register <ArrowRight size={14} /></Link></Notice>}<form className="studio-form" onSubmit={submit}><div className="form-section"><span className="eyebrow">01 · The form</span><div className="form-grid"><label>Pottery item<select value={itemId} onChange={event => setItemId(event.target.value)}>{meta.data!.potteryItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Glaze<select value={glazeId} onChange={event => setGlazeId(event.target.value)}>{meta.data!.glazes.map(glaze => <option key={glaze.id} value={glaze.id}>{glaze.name}</option>)}</select></label></div></div><div className="form-section"><span className="eyebrow">02 · The measure</span><div className="form-grid"><label>Quantity<input type="number" min="1" max="12" value={quantity} onChange={event => setQuantity(Number(event.target.value))} required /><small>Between 1 and 12 pieces.</small></label><label>Needed by<input type="date" min={datePlus(14)} value={neededBy} onChange={event => setNeededBy(event.target.value)} required /><small>At least 14 days from today.</small></label></div></div><button className="button button-dark" disabled={create.isPending}>{create.isPending ? "Sending to the bench…" : "Submit pottery request"} <Check size={15} /></button></form></div></StudioShell>;
}
