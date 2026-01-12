import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Bell, BarChart3, Tags } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  {
    icon: Eye,
    title: 'Visão completa',
    description: 'Saiba quanto você pode gastar hoje.',
  },
  {
    icon: Bell,
    title: 'Nunca mais esqueça',
    description: 'Receba lembretes personalizados e nunca mais pague juros por esquecer uma conta.',
  },
  {
    icon: BarChart3,
    title: 'Planeje seu futuro',
    description: 'Veja todos seus gastos e receitas em um só lugar, com dashboards que você realmente entende.',
  },
  {
    icon: Tags,
    title: 'Categorias Personalizadas',
    description: 'Organize seus gastos por categorias que fazem sentido para você.',
  },
];

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-green-dark to-accent opacity-90" />
        
        {/* Animated circles background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid-pattern" style={{ backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-accent-foreground h-full w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="font-bold text-lg">t</span>
            </div>
            <span className="font-semibold text-xl">tMoney</span>
          </Link>
          
          {/* Main Content - Centered horizontally and vertically */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md space-y-8 w-full">
              <div className="opacity-0 animate-[fade-in_0.6s_ease-out_forwards] text-center">
                <h2 className="text-3xl font-bold">Você está quase lá!</h2>
              </div>
              
              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="flex gap-4 items-start p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] opacity-0 animate-[fade-in_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm opacity-80 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div />
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
