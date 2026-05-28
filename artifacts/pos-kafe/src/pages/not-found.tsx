import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="text-center max-w-md animate-slide-up relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-primary/8 flex items-center justify-center border border-primary/15 shadow-inner">
              <Coffee className="w-12 h-12 text-primary/40" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <span className="text-destructive text-xs font-black">!</span>
            </div>
          </div>
        </div>

        {/* 404 number */}
        <p className="text-8xl font-black leading-none mb-3 select-none" style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--secondary)/0.15) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          404
        </p>

        <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Kembali ke dasbor untuk melanjutkan giliran Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 shadow-sm min-w-[160px]">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Kembali ke Dasbor
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 min-w-[140px]">
            <Link href="/pos">
              <ArrowLeft className="w-4 h-4" />
              Buka POS
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
