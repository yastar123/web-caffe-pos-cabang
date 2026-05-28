import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Coffee className="w-10 h-10 text-primary opacity-60" />
          </div>
        </div>
        <p className="text-7xl font-black text-primary/20 mb-2 tracking-tight select-none">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Head back to the dashboard to continue.
        </p>
        <Button asChild className="gap-2 shadow-sm">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
