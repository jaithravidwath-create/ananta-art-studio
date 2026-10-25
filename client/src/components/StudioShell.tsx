import { Link, useLocation } from "wouter";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function LoadingState({ label = "Opening the studio register…" }: { label?: string }) {
  return <div className="state-card"><span className="spinner" aria-hidden="true" /> <span>{label}</span></div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="state-card empty-state"><span className="eyebrow">Nothing here yet</span><h3>{title}</h3><p>{body}</p></div>;
}

export function ErrorState({ message = "We could not load this section.", retry }: { message?: string; retry?: () => void }) {
  return <div className="state-card error-state"><span className="eyebrow">A quiet interruption</span><h3>Something went wrong</h3><p>{message}</p>{retry && <button className="text-button" onClick={retry}>Try again <ArrowRight size={15} /></button>}</div>;
}

export function Notice({ kind = "success", children }: { kind?: "success" | "error" | "info"; children: React.ReactNode }) {
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</div>;
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-${status}`}>{status.replace("_", " ")}</span>;
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return <header className="page-header"><span className="eyebrow">{kicker}</span><h1>{title}</h1>{intro && <p>{intro}</p>}</header>;
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const me = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => { me.refetch(); setLocation("/"); } });
  const close = () => setOpen(false);
  const loggedIn = Boolean(me.data);
  return <div className="site-shell">
    <header className="topbar">
      <Link href="/" className="brand" onClick={close}>
        <span className="brand-mark" aria-hidden="true"><span>A</span><span>S</span></span>
        <span><strong>Art Studio</strong><small>Private salon · India</small></span>
      </Link>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`main-nav ${open ? "nav-open" : ""}`}>
        <Link href="/paintings" className={location.startsWith("/paintings") ? "active" : ""} onClick={close}>The collection</Link>
        <Link href="/book-wall" className={location === "/book-wall" ? "active" : ""} onClick={close}>Wall painting</Link>
        <Link href="/pottery" className={location === "/pottery" ? "active" : ""} onClick={close}>Custom pottery</Link>
        {me.data?.role === "studio" && <Link href="/admin" className={location === "/admin" ? "active" : ""} onClick={close}>Studio desk</Link>}
        {loggedIn ? <>
          <Link href="/dashboard" className={location === "/dashboard" ? "active" : ""} onClick={close}>My studio</Link>
          <button className="nav-logout" onClick={() => { close(); logout.mutate(); }}><LogOut size={14} /> Sign out</button>
        </> : <Link href={`/login?next=${encodeURIComponent(location)}`} className="nav-login" onClick={close}>Sign in</Link>}
      </nav>
    </header>
    <main>{children}</main>
    <footer className="footer"><div><span className="footer-rule" /><strong>Art Studio</strong><p>A considered place for singular works, hand-finished walls, and objects made to be kept.</p></div><div className="footer-meta"><span>INR · by appointment</span><span>© 2026 Art Studio</span></div></footer>
  </div>;
}

export function ProtectedNotice({ role }: { role?: "customer" | "studio" }) {
  const me = trpc.auth.me.useQuery();
  if (me.isLoading) return <LoadingState />;
  if (!me.data) return <div className="auth-panel"><span className="eyebrow">A private room</span><h2>Please sign in to continue.</h2><p>Your studio register is available after a short sign-in.</p><Link href="/login" className="button button-dark">Go to sign in <ArrowRight size={16} /></Link></div>;
  if (role && me.data.role !== role) return <div className="auth-panel"><span className="eyebrow">403 · Not your room</span><h2>This space is reserved for the studio desk.</h2><p>Your account does not have the required role for this view.</p><Link href="/" className="button button-outline">Return home</Link></div>;
  return null;
}
