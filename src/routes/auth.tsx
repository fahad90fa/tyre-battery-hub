import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wrench, Mail, Lock, User, Sparkles, ShieldCheck, Truck, Zap } from "lucide-react";


export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — MT&B HOUSE" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  const signUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email, full_name: name });
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "customer" });
    }
    if (data.session) {
      toast.success("Account created!");
      navigate({ to: "/" });
    } else {
      toast.success("Check your email to confirm.");
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("Google sign-in failed");
    else if (!res.redirected) navigate({ to: "/" });
  };

  const features = [
    { icon: ShieldCheck, text: "Genuine warranty on every product" },
    { icon: Truck, text: "Fast delivery & fitting service" },
    { icon: Zap, text: "Instant invoices & order tracking" },
  ];

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2 overflow-hidden">
      {/* LEFT — animated brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground overflow-hidden">
        {/* Glow orbs */}
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.25 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-blue) 0%, transparent 70%)", opacity: 0.3 }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Grid pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-gold"
            style={{ left: `${15 + i * 13}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ opacity: [0, 1, 0], y: [0, -14, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.span>
        ))}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gold/15 grid place-items-center text-gold ring-1 ring-gold/30">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight">
                MT&B <span className="text-gold">HOUSE</span>
              </div>
              <div className="text-[11px] text-gold/90">Muzaffar Tyre And Battery House</div>
            </div>
          </Link>
        </motion.div>

        {/* Copy */}
        <div className="relative z-10">


          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-black leading-tight"
          >
            Reliable power<br />
            for <span className="text-gold">every vehicle</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-4 text-white/70 max-w-sm"
          >
            Sign in to track your orders, view invoices and manage your account.
          </motion.p>

          <div className="mt-8 space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 text-sm text-white/80"
              >
                <div className="h-8 w-8 rounded-lg bg-gold/15 grid place-items-center text-gold">
                  <f.icon className="h-4 w-4" />
                </div>
                {f.text}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">© MT&B HOUSE</div>
      </div>

      {/* RIGHT — form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <motion.div
          aria-hidden
          className="absolute top-10 right-10 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-blue) 0%, transparent 70%)", opacity: 0.12 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 9, repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 flex items-center gap-3 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gold/15 grid place-items-center text-gold">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="font-extrabold">MT&B <span className="text-gold">HOUSE</span></div>
          </div>

          <div className="bg-card border rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <motion.h2
                key={tab}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold tracking-tight"
              >
                {tab === "signin" ? "Welcome back 👋" : "Join MT&B HOUSE"}
              </motion.h2>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "signin" ? "Sign in to continue to your dashboard" : "Create your account in seconds"}
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="signin" className="mt-6" forceMount>
                  {tab === "signin" && (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <IconField label="Email" icon={Mail}>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="pl-10 h-11" />
                      </IconField>
                      <IconField label="Password" icon={Lock}>
                        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="pl-10 h-11" />
                      </IconField>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full h-11 font-semibold" onClick={signIn} disabled={loading}>
                          {loading ? "Signing in..." : "Sign in"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="signup" className="mt-6" forceMount>
                  {tab === "signup" && (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <IconField label="Full name" icon={User}>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="pl-10 h-11" />
                      </IconField>
                      <IconField label="Email" icon={Mail}>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="pl-10 h-11" />
                      </IconField>
                      <IconField label="Password" icon={Lock}>
                        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Create a strong password" className="pl-10 h-11" />
                      </IconField>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full h-11 font-semibold" onClick={signUp} disabled={loading}>
                          {loading ? "Creating..." : "Create account"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="w-full h-11" onClick={google}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"/></svg>
                Continue with Google
              </Button>
            </motion.div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our terms & privacy policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function IconField({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <Icon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        {children}
      </div>
    </div>
  );
}
