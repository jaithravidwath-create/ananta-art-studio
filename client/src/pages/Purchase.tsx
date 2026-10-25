import { ArrowRight, CircleAlert, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, StudioShell } from "@/components/StudioShell";

export default function Purchase() {
  return <StudioShell><div className="container page-wrap"><PageHeader kicker="Purchase" title="A clear next step for each kind of work." intro="Paintings can be reserved as orders. Pottery is a custom request, not an online checkout. There are no real payments in this assignment app." />
    <div className="choice-grid"><article className="choice-card"><ShoppingBag size={28} /><span className="eyebrow">One of a kind</span><h2>Purchase a painting</h2><p>Open an available work, review its artist and price, and create an order. The database protects the work from double-selling.</p><Link className="button button-dark" href="/paintings">Choose a painting <ArrowRight size={15} /></Link></article><article className="choice-card"><CircleAlert size={28} /><span className="eyebrow">No checkout</span><h2>Request pottery</h2><p>Select a form, glaze, quantity and needed-by date. The studio accepts or declines the request from its desk.</p><Link className="button button-outline" href="/pottery">Start a pottery request <ArrowRight size={15} /></Link></article></div>
    <div className="scope-note"><strong>Scope note.</strong> Buying a painting creates an order only. No card details, payment provider, delivery tracking or customer messaging is collected.</div>
  </div></StudioShell>;
}
