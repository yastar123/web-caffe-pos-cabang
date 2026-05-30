import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

// Lazy load pages for better performance
const Login = React.lazy(() => import("@/pages/login"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Pos = React.lazy(() => import("@/pages/pos"));
const Tables = React.lazy(() => import("@/pages/tables"));
const Kitchen = React.lazy(() => import("@/pages/kitchen"));
const Reservations = React.lazy(() => import("@/pages/reservations"));
const Menu = React.lazy(() => import("@/pages/menu"));
const Stock = React.lazy(() => import("@/pages/stock"));
const Reports = React.lazy(() => import("@/pages/reports"));
const Customers = React.lazy(() => import("@/pages/customers"));
const Branches = React.lazy(() => import("@/pages/branches"));
const Users = React.lazy(() => import("@/pages/users"));
const Settings = React.lazy(() => import("@/pages/settings"));
const OrderHistory = React.lazy(() => import("@/pages/order-history"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in h-full min-h-0">
      {children}
    </div>
  );
}

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Spinner className="size-8" /></div>;
  }

  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Layout>
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Spinner className="size-8" /></div>}>
        <PageWrapper>
          <Component />
        </PageWrapper>
      </Suspense>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Spinner className="size-8" /></div>}>
          <Login />
        </Suspense>
      </Route>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/pos">
        <ProtectedRoute component={Pos} />
      </Route>
      <Route path="/tables"><ProtectedRoute component={Tables} /></Route>
      <Route path="/kitchen"><ProtectedRoute component={Kitchen} /></Route>
      <Route path="/reservations"><ProtectedRoute component={Reservations} /></Route>
      <Route path="/menu"><ProtectedRoute component={Menu} /></Route>
      <Route path="/stock"><ProtectedRoute component={Stock} /></Route>
      <Route path="/reports"><ProtectedRoute component={Reports} /></Route>
      <Route path="/customers"><ProtectedRoute component={Customers} /></Route>
      <Route path="/branches"><ProtectedRoute component={Branches} /></Route>
      <Route path="/users"><ProtectedRoute component={Users} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      <Route path="/order-history"><ProtectedRoute component={OrderHistory} roles={["owner", "manager"]} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
