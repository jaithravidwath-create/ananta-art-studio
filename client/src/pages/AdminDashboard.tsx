import { FormEvent, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { EmptyState, ErrorState, LoadingState, PageHeader, ProtectedNotice, StatusPill, StudioShell } from "@/components/StudioShell";

const blank = { title: "", artist: "", description: "", price: 5000, imageUrl: "images/p-001.jpg" };

export default function AdminDashboard() {
  const me = trpc.auth.me.useQuery();
  const query = trpc.admin.dashboard.useQuery(undefined, { enabled: me.data?.role === "studio" });
  const utils = trpc.useUtils();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const add = trpc.admin.addPainting.useMutation({ onSuccess: () => { toast.success("Painting added to the collection."); setForm(blank); utils.admin.dashboard.invalidate(); }, onError: error => toast.error(error.message) });
  const update = trpc.admin.updatePainting.useMutation({ onSuccess: () => { toast.success("Painting details updated."); setEditing(null); setForm(blank); utils.admin.dashboard.invalidate(); }, onError: error => toast.error(error.message) });
  const booking = trpc.admin.updateBooking.useMutation({ onSuccess: () => { toast.success("Booking status updated."); utils.admin.dashboard.invalidate(); }, onError: error => toast.error(error.message) });
  const pottery = trpc.admin.updatePottery.useMutation({ onSuccess: () => { toast.success("Pottery request status updated."); utils.admin.dashboard.invalidate(); }, onError: error => toast.error(error.message) });
  const submit = (event: FormEvent) => { event.preventDefault(); editing ? update.mutate({ id: editing, ...form }) : add.mutate(form); };

  if (me.isLoading) return <StudioShell><div className="container page-wrap"><LoadingState /></div></StudioShell>;
  if (!me.data || me.data.role !== "studio") return <StudioShell><div className="container page-wrap"><ProtectedNotice role="studio" /></div></StudioShell>;
  if (query.isLoading) return <StudioShell><div className="container page-wrap"><LoadingState label="Opening the studio desk…" /></div></StudioShell>;
  if (query.error) return <StudioShell><div className="container page-wrap"><ErrorState message={query.error.message} retry={() => query.refetch()} /></div></StudioShell>;

  const data = query.data!;
  const resetForm = () => { setEditing(null); setForm(blank); };
  return <StudioShell>
    <div className="container page-wrap">
      <PageHeader kicker="Studio administration" title="The desk, before the doors open." intro="Inventory, reservations, and requests in one quiet register. Decisions made here are enforced by the server." />
      <div className="stat-strip"><div><span className="eyebrow">Available works</span><strong>{data.paintings.filter(p => p.status === "available").length}</strong></div><div><span className="eyebrow">Open wall requests</span><strong>{data.bookings.filter(b => b.status === "requested").length}</strong></div><div><span className="eyebrow">Pottery to review</span><strong>{data.pottery.filter(p => p.status === "requested").length}</strong></div></div>

      <section className="admin-section">
        <div className="section-heading"><div><span className="eyebrow">01 · Collection</span><h2>Painting inventory</h2></div><button className="button button-outline" onClick={resetForm}><Plus size={15} /> Add painting</button></div>
        {data.paintings.length ? <div className="admin-table">{data.paintings.map(painting => <div className="admin-row" key={painting.id}><img src={`/${painting.imageUrl}`} alt="" /><div><span className="eyebrow">{painting.id} · {painting.artist}</span><h3>{painting.title}</h3></div><strong>₹{painting.price.toLocaleString("en-IN")}</strong><StatusPill status={painting.status} />{painting.status === "available" && <button className="icon-button" aria-label={`Edit ${painting.title}`} onClick={() => { setEditing(painting.id); setForm({ title: painting.title, artist: painting.artist, description: painting.description, price: painting.price, imageUrl: painting.imageUrl }); }}><Pencil size={15} /></button>}</div>)}</div> : <EmptyState title="The inventory is empty." body="Add the first work to open the collection." />}
        <form className="admin-form" onSubmit={submit}><div className="section-heading"><div><span className="eyebrow">{editing ? "Edit available work" : "Add a new work"}</span><h3>{editing ? "Refine the catalogue entry." : "Give the next work its catalogue card."}</h3></div>{editing && <button type="button" className="icon-button" onClick={resetForm}><X size={16} /></button>}</div><div className="form-grid"><label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label><label>Artist<input value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} required /></label><label>Price in INR<input type="number" min="1" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required /></label><label>Image path<input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required /></label><label className="span-2">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} minLength={10} required /></label></div><button className="button button-dark" disabled={add.isPending || update.isPending}>{editing ? "Save catalogue entry" : "Add painting"} <Check size={15} /></button></form>
      </section>

      <section className="admin-section"><div className="section-heading"><div><span className="eyebrow">02 · Walls</span><h2>Wall-painting requests</h2></div></div>{!data.bookings.length ? <EmptyState title="No requests in the calendar." body="New customer requests will appear here." /> : <div className="admin-table">{data.bookings.map(row => <div className="admin-row detail-row" key={row.id}><div className="date-tile"><strong>{new Date(`${row.bookingDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><span>{new Date(`${row.bookingDate}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</span></div><div><span className="eyebrow">{row.customerName} · {row.customerEmail}</span><h3>{row.bookingDate} · {row.wallSize} sq ft</h3><p>{row.address}</p></div><strong>₹{row.price.toLocaleString("en-IN")}</strong><StatusPill status={row.status} />{row.status === "requested" && <span className="row-actions"><button className="icon-text-button" onClick={() => booking.mutate({ id: row.id, status: "confirmed" })}><Check size={14} /> Confirm</button><button className="icon-text-button" onClick={() => booking.mutate({ id: row.id, status: "declined" })}><X size={14} /> Decline</button></span>}</div>)}</div>}</section>

      <section className="admin-section"><div className="section-heading"><div><span className="eyebrow">03 · Pottery bench</span><h2>Custom requests</h2></div></div>{!data.pottery.length ? <EmptyState title="No pottery requests yet." body="The bench is waiting for its next shape." /> : <div className="admin-table">{data.pottery.map(row => <div className="admin-row detail-row" key={row.id}><div className="pottery-symbol">◒</div><div><span className="eyebrow">{row.customerName} · {row.customerEmail}</span><h3>{row.itemName} · {row.glazeName}</h3><p>Qty {row.quantity} · needed by {row.neededBy}</p></div><StatusPill status={row.status} />{row.status === "requested" && <span className="row-actions"><button className="icon-text-button" onClick={() => pottery.mutate({ id: row.id, status: "accepted" })}><Check size={14} /> Accept</button><button className="icon-text-button" onClick={() => pottery.mutate({ id: row.id, status: "declined" })}><X size={14} /> Decline</button></span>}</div>)}</div>}</section>
    </div>
  </StudioShell>;
}
