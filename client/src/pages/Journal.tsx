import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { Link } from "wouter";
import { PageHeader, StudioShell } from "@/components/StudioShell";

const notes = [
  { no: "01", topic: "On looking", title: "Let a room keep one secret.", body: "The best work does not announce itself from the doorway. It rewards the second look, the changing light, the person who pauses beside it.", image: "/manus-storage/async-images/scnpU95IBXALwvGdaNOynh/image-1.webp" },
  { no: "02", topic: "On walls", title: "Paint the light you already have.", body: "A mural should belong to a room before it belongs to a photograph. We begin with the windows, the thresholds and the quiet corners.", image: "/manus-storage/async-images/scnpU95IBXALwvGdaNOynh/image-4.webp" },
  { no: "03", topic: "On objects", title: "The everyday deserves a good silhouette.", body: "A cup, a planter, a small bowl: useful things can still carry the trace of the maker and bring a little ceremony to a Tuesday morning.", image: "/manus-storage/async-images/scnpU95IBXALwvGdaNOynh/image-3.webp" },
];

export default function Journal() {
  return <StudioShell>
    <div className="container page-wrap journal-page">
      <PageHeader kicker="The studio journal" title="Notes on rooms, light and the things we keep." intro="A small record of artists, materials, and the unhurried rituals around a work of art." />
      <div className="journal-list">{notes.map(note => <article className="journal-card" key={note.no}><div className="journal-image"><img src={note.image} alt="" /><span>{note.no}</span></div><div className="journal-copy"><span className="eyebrow">{note.topic} · 4 min read</span><h2>{note.title}</h2><p>{note.body}</p><div className="journal-meta"><span><BookOpen size={14} /> Studio note</span><span><Clock3 size={14} /> October 2026</span></div></div></article>)}</div>
      <section className="journal-close"><span className="eyebrow">A final note</span><h2>There is no hurry in a good room.</h2><Link href="/paintings" className="text-button">See what is on the walls <ArrowRight size={15} /></Link></section>
    </div>
  </StudioShell>;
}
