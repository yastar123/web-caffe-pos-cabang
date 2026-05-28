import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEMO_ROLES = [
  { label: "Owner", email: "owner@kopiflow.id" },
  { label: "Manager", email: "manager@kopiflow.id" },
  { label: "Cashier", email: "cashier@kopiflow.id" },
  { label: "Waiter", email: "waiter@kopiflow.id" },
  { label: "Chef", email: "chef@kopiflow.id" },
];

export default function Login() {
  const [email, setEmail] = useState("owner@kopiflow.id");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthLoading) return null;

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login({ email, password });
      toast({ title: "Welcome back", description: "Successfully logged in to KopiFlow POS" });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] xl:w-[55%] bg-primary items-center justify-center p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary to-transparent" />

        <div className="relative z-10 flex flex-col items-start text-primary-foreground max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-tight">
            KopiFlow POS
          </h1>
          <p className="text-lg text-white/75 leading-relaxed mb-12">
            The precision instrument for modern cafe operations. Fast, powerful, and built for the rush.
          </p>
          <div className="space-y-4 w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">What's included</p>
            {[
              "Table & reservation management",
              "Real-time kitchen display",
              "Multi-branch analytics",
              "Inventory & stock control",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">KopiFlow POS</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Sign in to your shift</h2>
            <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email or Staff ID</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@kopiflow.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 sm:h-12 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">PIN / Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 sm:h-12 bg-background pr-11 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Open Register"
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick access — demo accounts</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.email}
                  type="button"
                  onClick={() => { setEmail(role.email); setPassword("password123"); }}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors min-h-[36px] font-medium"
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Having trouble? Ask your manager to reset your PIN.
          </p>
        </div>
      </div>
    </div>
  );
}
