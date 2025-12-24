import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-green-dark opacity-90" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern" style={{ backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-accent-foreground">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-bold text-lg">t</span>
            </div>
            <span className="font-semibold text-xl">tMoney</span>
          </Link>
          
          {/* Testimonial */}
          <div className="max-w-md">
            <blockquote className="text-2xl font-medium leading-relaxed mb-6">
              "Simplesmente todas as ferramentas que eu e minha equipe precisávamos."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-medium">
                KY
              </div>
              <div>
                <p className="font-medium">Karen Yue</p>
                <p className="text-sm opacity-80">Diretora de Marketing Digital</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-12">
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm opacity-80">Usuários ativos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">R$ 2B+</p>
              <p className="text-sm opacity-80">Transações gerenciadas</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-semibold text-sm">t</span>
            </div>
            <span className="font-semibold text-lg">tMoney</span>
          </Link>
          
          <div className="mb-8">
            <h1 className="text-h2 mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};