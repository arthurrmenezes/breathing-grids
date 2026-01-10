import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const ResetarSenha = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!token || !email) {
      toast({
        title: "Link inválido",
        description: "O link de redefinição de senha é inválido ou expirou",
        variant: "destructive",
      });
    }
  }, [token, email, toast]);

  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
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
    
    const result = await authService.resetPassword(email, token, {
      newPassword: password,
      confirmNewPassword: confirmPassword,
    });
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Erro ao redefinir senha",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso",
      });
      navigate('/login');
    }
  };

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Digite sua nova senha abaixo."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
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
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasLowercase ? 'bg-success' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasNumber ? 'bg-success' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.hasSpecialChar ? 'bg-success' : 'bg-border'}`} />
              </div>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center gap-2 ${passwordStrength.hasMinLength ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Mínimo 6 caracteres
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Uma letra maiúscula
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasLowercase ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Uma letra minúscula
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Um número
                </li>
                <li className={`flex items-center gap-2 ${passwordStrength.hasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" /> Um caractere especial (!@#$%...)
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          variant="accent" 
          size="lg" 
          className="w-full"
          disabled={isLoading || !token || !email}
        >
          {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetarSenha;
