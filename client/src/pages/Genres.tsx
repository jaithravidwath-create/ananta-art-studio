import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, StudioShell } from "@/components/StudioShell";

const genres = [
  { name: "Madhubani", region: "Bihar", fact: "Traditionally built from fine lines, flat colour and densely filled motifs inspired by nature, ritual and everyday life." },
  { name: "Warli", region: "Maharashtra", fact: "A spare visual language of white rice-paste figures, circles and triangles that turns community life into rhythm." },
  { name: "Tanjore", region: "Tamil Nadu", fact: "Known for raised detail, luminous gold foil and devotional subjects mounted on a firm wooden board." },
  { name: "Gond", region: "Central India", fact: "Fine dots, dashes and patterned lines animate animals, trees and forest stories with a distinctive pulse." },
  { name: "Pattachitra", region: "Odisha", fact: "A narrative cloth tradition with a disciplined border, mineral colour and stories carried across long panels." },
  { name: "Miniature & Pichwai", region: "Rajasthan · Gujarat", fact: "Detailed courts, gardens, deities and lotus ponds composed for close looking rather than a quick glance." },
];

export default function Genres() {
  return <StudioShell><div className="container page-wrap"><PageHeader kicker="Genres & subgenres" title="A small map of the traditions in the collection." intro="These labels are invitations to look more closely, not boxes. Each artist brings a personal vocabulary to a living tradition." /><div className="genre-grid">{genres.map(genre => <article className="genre-card" key={genre.name}><BookOpen size={20} /><span className="eyebrow">{genre.region}</span><h2>{genre.name}</h2><p>{genre.fact}</p></article>)}</div><section className="genre-close"><h2>Look first. Name later.</h2><p>Start with the colour, the line and the feeling of the work. Then visit the collection to read the artist’s own details.</p><Link href="/paintings" className="button button-dark">Visit the collection <ArrowRight size={15} /></Link></section></div></StudioShell>;
}
