import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { StudioShell } from "@/components/StudioShell";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("customer@artstudio.in");
  const [password, setPassword] = useState("Customer@123");
  const [show, setShow] = useState(false);
  const login = trpc.auth.login.useMutation({ onSuccess: user => { utils.auth.me.setData(undefined, user); const next = new URLSearchParams(window.location.search).get("next"); setLocation(next || (user?.role === "studio" ? "/admin" : "/dashboard")); }, onError: error => toast.error(error.message) });
  const submit = (event: FormEvent) => { event.preventDefault(); login.mutate({ email, password }); };
  return <StudioShell><div className="login-wrap container"><div className="login-intro"><span className="eyebrow">The studio register</span><h1>A quiet place<br />to begin.</h1><p>Sign in to reserve a work, choose a wall-painting date, or leave a request for the pottery bench.</p><Link href="/paintings" className="text-button">Browse without signing in <ArrowRight size={15} /></Link></div><form className="login-card" onSubmit={submit}><span className="eyebrow">Welcome back</span><h2>Sign in</h2><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<div className="password-field"><input type={show ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(value => !value)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label><button className="button button-dark wide-button" disabled={login.isPending}>{login.isPending ? "Opening…" : "Enter the studio"} <ArrowRight size={16} /></button><div className="demo-credentials"><span className="eyebrow">Demo access</span><p><strong>Customer</strong><br />customer@artstudio.in · Customer@123</p><p><strong>Studio Admin</strong><br />studio@artstudio.in · Studio@123</p></div></form></div></StudioShell>;
}
