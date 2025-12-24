import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetarSenha = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
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
    
    // Simulating password reset - replace with actual auth later
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso",
      });
      navigate('/login');
    }, 1000);
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
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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
          {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetarSenha;