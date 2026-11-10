import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AddSite } from "./components/AddSite";
import AuthPage from "./components/Register";
import { authAPI, getToken, clearToken } from "./services/api";

const queryClient = new QueryClient();

const AddSiteWrapper = ({ addSite }: { addSite: (site: any) => void }) => {
  const navigate = useNavigate();
  return (
    <AddSite
      onBack={() => navigate(-1)}
      onSave={(site) => {
        addSite(site);
        navigate("/");
      }}
    />
  );
};

const App = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const userData = await authAPI.me();
        setUser(userData);
      } catch (err) {
        clearToken();
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    restoreSession();
  }, []);

  const addSite = (site: any) => setSites((prev) => [...prev, site]);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to AuthPage
  if (!user) {
    return <AuthPage onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  sites={sites}
                  setSites={setSites}
                  user={user}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/add-site" element={<AddSiteWrapper addSite={addSite} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
