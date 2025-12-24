import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/resetar-senha" element={<ResetarSenha />} />
          <Route path="/confirmar-email" element={<ConfirmarEmail />} />
          
          {/* App Routes */}
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;