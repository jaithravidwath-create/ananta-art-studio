import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { StudioShell } from "@/components/StudioShell";

export default function NotFound() {
  return <StudioShell><div className="container not-found"><span className="eyebrow">404 · Empty frame</span><h1>This room is not in the house.</h1><p>The page you were looking for may have moved, or it may never have been part of the register.</p><Link href="/" className="button button-dark"><ArrowLeft size={15} /> Return home</Link></div></StudioShell>;
}
