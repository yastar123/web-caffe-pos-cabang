import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("owner@kopiflow.com");
  const [password, setPassword] = useState("password123");
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
      toast({
        title: "Welcome back",
        description: "Successfully logged in to KopiFlow POS",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center text-primary-foreground max-w-lg text-center">
          <div className="w-24 h-24 bg-primary-foreground/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-primary-foreground/20 shadow-2xl">
            <Coffee className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">KopiFlow POS</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed font-medium">
            The precision instrument for modern cafe operations. Fast, dense, and built for the rush.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground">Sign in to your shift</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access the system</p>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email or Staff ID</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-background text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">PIN / Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background text-lg font-mono tracking-widest"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold shadow-md active:translate-y-1 transition-transform" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Open Register"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground">
            Having trouble? Ask your manager to reset your PIN.
          </p>
        </div>
      </div>
    </div>
  );
}
