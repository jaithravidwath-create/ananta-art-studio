import { ArrowRight, Hand, Palette } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, StudioShell } from "@/components/StudioShell";

export default function Browse() {
  return <StudioShell><div className="container page-wrap"><PageHeader kicker="Browse" title="Begin with the form that suits your room." intro="Browse singular paintings and the pottery forms available for a custom request. The catalogue is intentionally small, so every choice remains clear." />
    <div className="choice-grid"><article className="choice-card"><Palette size={28} /><span className="eyebrow">The collection</span><h2>Paintings</h2><p>Original works across Madhubani, Warli, Tanjore, Gond, Pichwai, miniature and other Indian traditions.</p><Link className="button button-dark" href="/paintings">Browse paintings <ArrowRight size={15} /></Link></article><article className="choice-card choice-card-dark"><Hand size={28} /><span className="eyebrow">Made to request</span><h2>Pottery</h2><p>Choose a seeded form and glaze, then tell the studio how many you need and by when.</p><Link className="button button-outline" href="/pottery">Browse pottery forms <ArrowRight size={15} /></Link></article></div>
    <section className="fact-band"><span className="quote-mark">“</span><blockquote>One good object can change the temperature of a room.</blockquote><p>— A note from the Ananta register</p></section>
  </div></StudioShell>;
}
