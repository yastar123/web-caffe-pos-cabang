import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/role-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Loader2, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEMO_ROLES = [
  {
    label: "Pemilik",
    email: "owner@kopiflow.id",
    color:
      "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300",
  },
  {
    label: "Manajer",
    email: "manager@kopiflow.id",
    color:
      "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300",
  },
  {
    label: "Kasir",
    email: "cashier@kopiflow.id",
    color:
      "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-300",
  },
  {
    label: "Pelayan",
    email: "waiter@kopiflow.id",
    color:
      "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300",
  },
  {
    label: "Koki",
    email: "chef@kopiflow.id",
    color:
      "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300",
  },
  {
    label: "Gudang",
    email: "warehouse@kopiflow.id",
    color:
      "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-950/30 dark:border-slate-700 dark:text-slate-300",
  },
];

const FEATURES = [
  "Manajemen meja & reservasi",
  "Sistem tampilan dapur real-time",
  "Analitik & laporan multi-cabang",
  "Kontrol inventaris & stok",
  "Program loyalitas pelanggan",
  "Akses staf berbasis peran",
];

const STATS = [
  { value: "6", label: "Jenis peran" },
  { value: "99%", label: "Uptime" },
  { value: "< 1 dtk", label: "Respons" },
];

export default function Login() {
  const [email, setEmail] = useState("owner@kopiflow.id");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState("owner@kopiflow.id");

  if (isAuthLoading) return null;

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login({ email, password });
      toast({
        title: "Selamat datang kembali",
        description: "Berhasil masuk ke KopiFlow POS",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Masuk Gagal",
        description: error.message || "Kredensial tidak valid",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setActiveRole(roleEmail);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] xl:w-[52%] bg-primary items-center justify-center p-12 relative overflow-hidden shrink-0">
        {/* Layered background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/88 to-[hsl(186,76%,15%)]" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 border border-white/10 blur-sm" />
        <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-12 w-24 h-24 rounded-full bg-white/8" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/60 to-transparent" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col items-start text-primary-foreground max-w-md w-full animate-fade-in">
          {/* Logo mark */}
          <div className="w-14 h-14 bg-white/12 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <Coffee className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-4xl xl:text-[2.75rem] font-black tracking-tight mb-3 leading-[1.1]">
            KopiFlow
            <br />
            <span className="font-light opacity-80">Sistem POS</span>
          </h1>
          <p className="text-base text-white/65 leading-relaxed mb-10 max-w-sm">
            Instrumen presisi untuk operasional kafe modern. Cepat, andal, dan
            dirancang untuk jam sibuk.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/15 w-full">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/45 font-medium uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features list */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-4">
            Yang Tersedia
          </p>
          <div className="space-y-2.5 w-full">
            {FEATURES.map((feature, i) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm text-white/75 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-5 h-5 rounded-full bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/12 w-full">
            <p className="text-xs text-white/35">
              Dipercaya oleh kafe modern di seluruh Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">
              KopiFlow POS
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Masuk ke giliran Anda
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Masukkan kredensial Anda untuk mengakses sistem
            </p>
          </div>

          {/* Demo role picker */}
          <div className="mb-7">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Akses cepat — akun demo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.email}
                  type="button"
                  onClick={() => handleRoleSelect(role.email)}
                  className={cn(
                    "relative text-xs px-2.5 py-2 rounded-lg border font-semibold transition-all min-h-[36px]",
                    role.color,
                    activeRole === role.email &&
                      "ring-2 ring-offset-1 ring-primary/50 font-bold",
                  )}
                >
                  {activeRole === role.email && (
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email atau ID Staf
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="staf@kopiflow.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 sm:h-12 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                PIN / Kata Sandi
              </Label>
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
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-bold shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98] gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  Buka Kasir
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ada masalah? Minta manajer Anda untuk mereset PIN Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
