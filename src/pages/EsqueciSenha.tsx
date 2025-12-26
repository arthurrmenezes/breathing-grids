import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite seu email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await authService.forgotPassword({ email });
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Verifique seu email"
        subtitle="Enviamos um link para redefinir sua senha."
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          
          <p className="text-muted-foreground mb-6">
            Enviamos um email para <strong className="text-foreground">{email}</strong> com 
            instruções para redefinir sua senha.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8">
            Não recebeu o email? Verifique sua pasta de spam ou{' '}
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-accent hover:underline font-medium"
            >
              tente novamente
            </button>
          </p>
          
          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Digite seu email e enviaremos um link para redefinir sua senha."
    >
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
        
        <Button 
          type="submit" 
          variant="accent" 
          size="lg" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
        </Button>
        
        <Link to="/login" className="block">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
};

export default EsqueciSenha;
