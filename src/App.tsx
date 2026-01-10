import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetarSenha from "./pages/ResetarSenha";
import ConfirmarEmail from "./pages/ConfirmarEmail";
import Dashboard from "./pages/app/Dashboard";
import Transacoes from "./pages/app/Transacoes";
import Categorias from "./pages/app/Categorias";
import Lembretes from "./pages/app/Lembretes";
import Recorrentes from "./pages/app/Recorrentes";
import Cartoes from "./pages/app/Cartoes";
import Configuracoes from "./pages/app/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Cadastro />} />
            <Route path="/cadastro" element={<Navigate to="/signup" replace />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/reset-password" element={<ResetarSenha />} />
            <Route path="/resetar-senha" element={<Navigate to="/reset-password" replace />} />
            <Route path="/confirm-email" element={<ConfirmarEmail />} />
            <Route path="/confirmar-email" element={<Navigate to="/confirm-email" replace />} />
            
            {/* App Routes (No Protection) */}
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/transacoes" element={<Transacoes />} />
            <Route path="/app/categorias" element={<Categorias />} />
            <Route path="/app/lembretes" element={<Lembretes />} />
            <Route path="/app/recorrentes" element={<Recorrentes />} />
            <Route path="/app/cartoes" element={<Cartoes />} />
            <Route path="/app/configuracoes" element={<Configuracoes />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
