import { ArrowRight, LockKeyhole, Pencil, Plus } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, ProtectedNotice, StudioShell } from "@/components/StudioShell";
import { trpc } from "@/lib/trpc";

export default function Manage() {
  const me = trpc.auth.me.useQuery();
  return <StudioShell><div className="container page-wrap narrow-page"><PageHeader kicker="Studio desk · manage" title="Keep the catalogue intentional." intro="This page is for the Studio Admin. Painting records can be added or edited only while available. Pottery forms and glazes are seeded catalogue choices; customer requests are managed separately." />{me.isLoading ? null : !me.data || me.data.role !== "studio" ? <ProtectedNotice role="studio" /> : <>
    <div className="manage-list"><article className="manage-row"><div className="manage-icon"><Plus size={20} /></div><div><span className="eyebrow">Painting inventory</span><h3>Add a painting</h3><p>Create an available painting record with title, artist, description, price and an existing image path.</p></div><Link href="/admin" className="text-button">Open studio desk <ArrowRight size={15} /></Link></article><article className="manage-row"><div className="manage-icon"><Pencil size={20} /></div><div><span className="eyebrow">Available only</span><h3>Edit a painting</h3><p>Sold works remain historical records and cannot be edited. Available works can be updated from the admin desk.</p></div><Link href="/admin" className="text-button">Edit available works <ArrowRight size={15} /></Link></article><article className="manage-row"><div className="manage-icon"><LockKeyhole size={20} /></div><div><span className="eyebrow">Seeded pottery catalogue</span><h3>Pottery forms and glazes</h3><p>These are intentionally read-only in the MVP. Customers can request them; the admin accepts or declines the request.</p></div><Link href="/pottery" className="text-button">View request form <ArrowRight size={15} /></Link></article></div>
    <div className="scope-note"><strong>Why pottery is not editable here.</strong> The supplied assignment asks for seeded pottery choices and custom requests, not a pottery inventory-management system. Keeping it read-only makes the workflow smaller and safer.</div>
  </>}</div></StudioShell>;
}
