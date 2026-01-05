import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleIdentityButton } from '@/components/auth/GoogleIdentityButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { useAuth } from '@/contexts/AuthContext';

const Cadastro = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, loginWithGoogleCredential } = useAuth();

  const hasUnsavedChanges = useMemo(() => {
    return firstName.length > 0 || lastName.length > 0 || email.length > 0 || password.length > 0 || confirmPassword.length > 0;
  }, [firstName, lastName, email, password, confirmPassword]);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (!isPasswordStrong) {
      toast({
        title: "Erro",
        description: "A senha não atende aos requisitos mínimos",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await register(firstName, lastName, email, password, confirmPassword);
    
    setIsLoading(false);
    
    if (result.success) {
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar sua conta",
      });
      // Store email for confirmation page
      sessionStorage.setItem('pendingConfirmationEmail', email);
      navigate('/confirmar-email');
    } else {
      toast({
        title: "Erro ao criar conta",
        description: result.error || "Tente novamente mais tarde",
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
          title: "Conta criada!",
          description: "Bem-vindo ao tMoney",
        });
        navigate("/app");
      } else {
        toast({
          title: "Erro ao cadastrar com Google",
          description: result.error || "Tente novamente",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro ao cadastrar com Google",
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
    <AuthLayout
      title="Crie sua conta"
      subtitle="Junte-se ao tMoney e comece a controlar suas finanças."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Seu nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Seu sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12"
            />
          </div>
        </div>
        
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
              type={showPassword ? 'text' : 'password'}
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
          
          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2 mt-3">
              <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasMinLength ? 'bg-success' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasUppercase ? 'bg-success' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasNumber ? 'bg-success' : 'bg-border'}`} />
              </div>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center gap-2 ${passwordStrength.hasMinLength ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Mínimo 8 caracteres
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Uma letra maiúscula
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Um número
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12"
          />
        </div>
        
        <Button 
          type="submit" 
          variant="accent" 
          size="lg" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
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
          mode="signup"
          disabled={isGoogleLoading}
          onCredential={handleGoogleCredential}
          onError={handleGoogleError}
        />
        
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Cadastro;
