import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Calculator, Check } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader, ProtectedNotice, StudioShell } from "@/components/StudioShell";

const datePlus = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

export default function WallBooking() {
  const meta = trpc.catalog.meta.useQuery();
  const me = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const [bookingDate, setBookingDate] = useState(datePlus(7));
  const [wallSize, setWallSize] = useState(100);
  const [address, setAddress] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const create = trpc.customer.createBooking.useMutation({ onSuccess: result => { setDone(result.price); setAddress(""); utils.customer.dashboard.invalidate(); toast.success("Your wall-painting request is on the calendar."); }, onError: error => toast.error(error.message) });
  const rate = meta.data?.muralRatePerSqFt ?? 150;
  const price = useMemo(() => wallSize * rate, [wallSize, rate]);
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ bookingDate, wallSize, address }); };
  if (me.isLoading || meta.isLoading) return <StudioShell><div className="container page-wrap"><LoadingState /></div></StudioShell>;
  if (!me.data) return <StudioShell><div className="container page-wrap"><ProtectedNotice /></div></StudioShell>;
  if (meta.error) return <StudioShell><div className="container page-wrap"><ErrorState message={meta.error.message} retry={() => meta.refetch()} /></div></StudioShell>;
  if (!meta.data) return <StudioShell><div className="container page-wrap"><EmptyState title="The studio rate is unavailable." body="Please return when the mural register has been opened." /></div></StudioShell>;
  return <StudioShell><div className="container page-wrap narrow-page"><PageHeader kicker="A measured mural service" title="Reserve a date for the wall." intro="Tell us the size of the wall and where it lives. The studio rate is simple: ₹{rate} per square foot." />{done !== null && <Notice>Request received. Your estimated studio price is ₹{done.toLocaleString("en-IN")}. <Link href="/dashboard" className="notice-link">See your register <ArrowRight size={14} /></Link></Notice>}<form className="studio-form" onSubmit={submit}><div className="form-section"><span className="eyebrow">01 · The calendar</span><div className="form-grid"><label>Preferred date<input type="date" min={datePlus(7)} max={datePlus(90)} value={bookingDate} onChange={event => setBookingDate(event.target.value)} required /><small>Choose between 7 and 90 days from today.</small></label></div></div><div className="form-section"><span className="eyebrow">02 · The wall</span><div className="form-grid"><label>Wall size · sq ft<input type="number" min="10" max="500" value={wallSize} onChange={event => setWallSize(Number(event.target.value))} required /><small>Between 10 and 500 square feet.</small></label><label>Wall-painting address<textarea value={address} onChange={event => setAddress(event.target.value)} minLength={8} maxLength={1000} placeholder="House name, street, city, pin code" required /></label></div></div><div className="price-card"><Calculator size={20} strokeWidth={1.4} /><div><span className="eyebrow">Estimated studio price</span><strong>₹{price.toLocaleString("en-IN")}</strong><small>{wallSize} sq ft × ₹{rate} / sq ft</small></div></div><button className="button button-dark" disabled={create.isPending}>{create.isPending ? "Holding the date…" : "Submit booking request"} <Check size={15} /></button></form></div></StudioShell>;
}
