import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';

const ConfirmarEmail = () => {
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
          Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
        </p>
        
        <p className="text-sm text-muted-foreground mb-8">
          Não recebeu o email? Verifique sua pasta de spam ou{' '}
          <button className="text-accent hover:underline font-medium">
            reenviar email
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