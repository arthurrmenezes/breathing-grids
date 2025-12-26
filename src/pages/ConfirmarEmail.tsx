import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const ConfirmarEmail = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  const token = searchParams.get('token');
  const email = searchParams.get('email') || sessionStorage.getItem('pendingConfirmationEmail') || '';

  // If there's a token and email in URL, try to confirm automatically
  useEffect(() => {
    const confirmEmail = async () => {
      if (token && email) {
        setIsLoading(true);
        const result = await authService.confirmEmail(email, token);
        setIsLoading(false);
        
        if (result.error) {
          setConfirmationStatus('error');
          toast({
            title: "Erro na confirmação",
            description: result.error,
            variant: "destructive",
          });
        } else {
          setConfirmationStatus('success');
          sessionStorage.removeItem('pendingConfirmationEmail');
          toast({
            title: "Email confirmado!",
            description: "Sua conta foi ativada com sucesso",
          });
        }
      }
    };

    confirmEmail();
  }, [token, email, toast]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    const result = await authService.resendConfirmationEmail({ email });
    setIsResending(false);

    if (result.error) {
      toast({
        title: "Erro ao reenviar",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada",
      });
    }
  };

  // Loading state when confirming
  if (isLoading) {
    return (
      <AuthLayout
        title="Confirmando email..."
        subtitle="Aguarde enquanto confirmamos seu email."
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
          <p className="text-muted-foreground">Processando confirmação...</p>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (confirmationStatus === 'success') {
    return (
      <AuthLayout
        title="Email confirmado!"
        subtitle="Sua conta foi ativada com sucesso."
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          
          <p className="text-muted-foreground mb-8">
            Agora você pode acessar todas as funcionalidades do tMoney.
          </p>
          
          <Link to="/login">
            <Button variant="accent" size="lg" className="w-full">
              Fazer login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  if (confirmationStatus === 'error' && token) {
    return (
      <AuthLayout
        title="Erro na confirmação"
        subtitle="Não foi possível confirmar seu email."
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <p className="text-muted-foreground mb-6">
            O link de confirmação pode ter expirado ou já foi utilizado.
          </p>
          
          {email && (
            <Button 
              variant="accent" 
              size="lg" 
              className="w-full mb-4"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? 'Reenviando...' : 'Reenviar email de confirmação'}
            </Button>
          )}
          
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

  // Default pending state (waiting for user to check email)
  return (
    <AuthLayout
      title="Confirme seu email"
      subtitle="Enviamos um link de confirmação para seu email."
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-accent" />
        </div>
        
        <p className="text-muted-foreground mb-6">
          {email ? (
            <>
              Enviamos um email para <strong className="text-foreground">{email}</strong>.{' '}
              Clique no link de confirmação para ativar sua conta.
            </>
          ) : (
            'Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.'
          )}
        </p>
        
        <p className="text-sm text-muted-foreground mb-8">
          Não recebeu o email? Verifique sua pasta de spam ou{' '}
          <button 
            onClick={handleResendEmail}
            disabled={isResending || !email}
            className="text-accent hover:underline font-medium disabled:opacity-50"
          >
            {isResending ? 'reenviando...' : 'reenviar email'}
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
};

export default ConfirmarEmail;
