import { ArrowRight, Feather, Flame, Ruler } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, StudioShell } from "@/components/StudioShell";

export default function About() {
  return <StudioShell>
    <div className="container page-wrap about-page">
      <PageHeader kicker="About Ananta" title="An art studio for rooms with a point of view." intro="Ananta is a small Indian art studio selling original paintings, considered wall-painting services, and custom pottery made slowly enough to keep." />
      <section className="about-hero editorial-split">
        <div className="about-image framed-image"><img src="/manus-storage/async-images/scnpU95IBXALwvGdaNOynh/image-2.webp" alt="The Reading Room at Dusk" /></div>
        <div className="about-copy"><span className="eyebrow">The register · 2026</span><h2>Collected, not crowded.</h2><p>We look for work with a distinct hand: the tiny irregularity, the particular blue, the mark that could not have come from anywhere else.</p><p>The collection moves across Madhubani, Warli, Tanjore, Gond, Pattachitra, miniature and Pichwai traditions. Alongside paintings, Ananta offers hand-finished walls and custom pottery in seeded forms and glazes.</p><p className="small-fact"><strong>Fact:</strong> one-of-a-kind means the painting is protected by a server-side transaction, not just a disabled button.</p><Link href="/paintings" className="text-button">Visit the collection <ArrowRight size={15} /></Link></div>
      </section>
      <section className="principles-band"><div className="eyebrow">The way we work</div><div className="principles-grid"><article><Feather size={22} /><h3>Follow the hand</h3><p>We name the artist, the material and the tradition. Provenance is part of the pleasure.</p></article><article><Ruler size={22} /><h3>Make room</h3><p>Our wall-painting service begins with proportion, light and the life already happening in a room.</p></article><article><Flame size={22} /><h3>Keep the warmth</h3><p>From brass lamps to kiln-fired clay, we choose objects that gather patina instead of asking for attention.</p></article></div></section>
      <section className="about-visit"><div><span className="eyebrow">By appointment</span><h2>Come slowly.</h2></div><div><p>The studio is open by appointment in Bengaluru. Write to the register for a quiet viewing, a wall consultation or a conversation about a custom piece.</p><Link href="/book-wall" className="button button-dark">Begin with a wall <ArrowRight size={15} /></Link></div></section>
    </div>
  </StudioShell>;
}
