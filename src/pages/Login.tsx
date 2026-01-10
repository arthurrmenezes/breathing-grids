import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleIdentityButton } from "@/components/auth/GoogleIdentityButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithGoogleCredential } = useAuth();

  const hasUnsavedChanges = useMemo(() => {
    return email.length > 0 || password.length > 0;
  }, [email, password]);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao tMoney",
      });
      navigate("/app");
    } else {
      toast({
        title: "Erro ao fazer login",
        description: result.error || "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogleCredential(credential);

      if (result.success) {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao tMoney",
        });
        navigate("/app");
      } else {
        toast({
          title: "Erro ao fazer login com Google",
          description: result.error || "Tente novamente",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro ao fazer login com Google",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginWithGoogleCredential, navigate, toast]);

  const handleGoogleError = useCallback((message: string) => {
    toast({
      title: "Erro ao iniciar Google",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre com seu email e senha para acessar suas finanças.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-muted-foreground">Lembrar de mim</span>
          </label>
          <Link to="/esqueci-senha" className="text-sm text-accent hover:underline font-medium">
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <GoogleIdentityButton
          mode="login"
          disabled={isGoogleLoading}
          onCredential={handleGoogleCredential}
          onError={handleGoogleError}
        />

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link to="/signup" className="text-accent hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
