import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, ClipboardList, Compass, LogOut, Menu, Pencil, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || typeof IntersectionObserver === "undefined") return;
    const selector = "h1,h2,h3,p,img,.service-card,.featured-card,.painting-card,.journal-card,.genre-card,.choice-card,.record-card,.manage-row,.quote-band";
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    }), { threshold: 0.12, rootMargin: "0px 0px -24px" });
    const prepare = () => main.querySelectorAll(selector).forEach(element => {
      if (!element.classList.contains("scroll-reveal")) {
        element.classList.add("scroll-reveal");
        observer.observe(element);
      }
    });
    prepare();
    const changes = new MutationObserver(prepare);
    changes.observe(main, { childList: true, subtree: true });
    return () => { observer.disconnect(); changes.disconnect(); };
  }, [location]);
  return <div className="site-shell">
    <header className="topbar">
      <Link href="/" className="brand" onClick={close}>
        <img className="brand-logo" src="/manus-storage/ananta-logo_85396e38.jpg" alt="Ananta infinity logo" />
        <span><strong>Ananta</strong><small>Private art studio · India</small></span>
      </Link>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`main-nav ${open ? "nav-open" : ""}`}>
        <Link href="/browse" className={location === "/browse" ? "active" : ""} onClick={close}>Browse</Link>
        <Link href="/paintings" className={location.startsWith("/paintings") ? "active" : ""} onClick={close}>Paintings</Link>
        <Link href="/book-wall" className={location === "/book-wall" ? "active" : ""} onClick={close}>Wall painting</Link>
        <Link href="/pottery" className={location === "/pottery" ? "active" : ""} onClick={close}>Custom pottery</Link>
        <Link href="/about" className={location === "/about" ? "active" : ""} onClick={close}>About the house</Link>
        <Link href="/genres" className={location === "/genres" ? "active" : ""} onClick={close}>Genres</Link>
        {me.data?.role === "studio" && <Link href="/admin" className={location === "/admin" ? "active" : ""} onClick={close}>Studio desk</Link>}
        {loggedIn ? <>
          <Link href="/dashboard" className={location === "/dashboard" ? "active" : ""} onClick={close}>My studio</Link>
          <button className="nav-logout" onClick={() => { close(); logout.mutate(); }}><LogOut size={14} /> Sign out</button>
        </> : <Link href={`/login?next=${encodeURIComponent(location)}`} className="nav-login" onClick={close}>Sign in</Link>}
      </nav>
    </header>
    <main key={location} className="page-transition">{children}</main>
    <footer className="footer"><div><span className="footer-rule" /><strong>Ananta</strong><p>A considered Indian art studio for singular paintings, hand-finished walls, and objects made to be kept.</p><div className="footer-links"><Link href="/about">About Ananta</Link><Link href="/genres">Genres</Link><Link href="/journal">Journal</Link></div></div><div className="footer-meta"><span>INR · by appointment</span><span>© 2026 Ananta</span></div></footer>
    <nav className="floating-dock" aria-label="Ananta page dock"><Link href="/about" className={location === "/about" ? "dock-active" : ""}><span className="dock-letter">A</span><span>About</span></Link><Link href="/browse" className={location === "/browse" ? "dock-active" : ""}><Compass size={15} /><span>Browse</span></Link><Link href="/manage" className={location === "/manage" ? "dock-active" : ""}><Pencil size={15} /><span>Manage</span></Link><Link href="/purchase" className={location === "/purchase" ? "dock-active" : ""}><ShoppingBag size={15} /><span>Purchase</span></Link><Link href="/records" className={location === "/records" ? "dock-active" : ""}><ClipboardList size={15} /><span>Orders & requests</span></Link><Link href="/genres" className={location === "/genres" ? "dock-active" : ""}><BookOpen size={15} /><span>Genres</span></Link></nav>
  </div>;
}

export function ProtectedNotice({ role }: { role?: "customer" | "studio" }) {
  const me = trpc.auth.me.useQuery();
  if (me.isLoading) return <LoadingState />;
  if (!me.data) return <div className="auth-panel"><span className="eyebrow">A private room</span><h2>Please sign in to continue.</h2><p>Your studio register is available after a short sign-in.</p><Link href="/login" className="button button-dark">Go to sign in <ArrowRight size={16} /></Link></div>;
  if (role && me.data.role !== role) return <div className="auth-panel"><span className="eyebrow">403 · Not your room</span><h2>This space is reserved for the studio desk.</h2><p>Your account does not have the required role for this view.</p><Link href="/" className="button button-outline">Return home</Link></div>;
  return null;
}
