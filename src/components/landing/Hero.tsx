import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [email, setEmail] = useState('');

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Dotted Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 noise-texture" />

      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-soft text-accent text-sm font-medium mb-8 animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
            Agora em beta público
          </div>

          {/* Main Headline */}
          <h1 
            className="text-display text-foreground mb-6 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            Clareza financeira,{' '}
            <span className="relative">
              finalmente
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 4 150 4 198 10"
                  stroke="hsl(160 84% 39%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-draw-line"
                  style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                />
              </svg>
            </span>
            .
          </h1>

          {/* Sub-headline */}
          <p 
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            A plataforma de finanças pessoais que conecta seu fluxo de caixa diário 
            com sua riqueza de longo prazo. Sem planilhas, apenas controle.
          </p>

          {/* Email Input + CTA */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16 animate-fade-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="relative w-full sm:w-auto sm:flex-1">
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-5 pr-36 rounded-full border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
              <Link to="/cadastro">
                <Button 
                  variant="hero" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6"
                >
                  Começar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div 
            className="relative max-w-5xl mx-auto animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative animate-float">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-3xl opacity-50" />
              
              {/* Dashboard Card */}
              <div className="relative bg-surface rounded-2xl lg:rounded-3xl border border-border shadow-card-hover overflow-hidden">
                {/* Mock Header Bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                      app.tmoney.com.br
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 lg:p-8">
                  <div className="grid grid-cols-12 gap-4 lg:gap-6">
                    {/* Summary Cards Row */}
                    <div className="col-span-12 grid grid-cols-3 gap-4">
                      <SummaryCard 
                        label="Saldo Total" 
                        value="R$ 47.892,54" 
                        trend="+12,5%"
                        positive 
                      />
                      <SummaryCard 
                        label="Entrada Mensal" 
                        value="R$ 8.450,00" 
                        trend="+3,2%"
                        positive 
                      />
                      <SummaryCard 
                        label="Livre para Gastar" 
                        value="R$ 2.341,20" 
                        trend="-8,1%"
                      />
                    </div>
                    
                    {/* Chart Area */}
                    <div className="col-span-12 lg:col-span-8 bg-secondary/30 rounded-xl p-4 h-48">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Fluxo de Caixa</span>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary">6 meses</span>
                        </div>
                      </div>
                      <ChartMockup />
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="col-span-12 lg:col-span-4 space-y-3">
                      <div className="bg-accent text-accent-foreground rounded-xl p-4 text-center">
                        <span className="text-sm font-medium">+ Adicionar Transação</span>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Próximos</span>
                        <div className="mt-2 space-y-2">
                          <UpcomingItem name="Netflix" date="Amanhã" amount="R$ 55,90" />
                          <UpcomingItem name="Spotify" date="28 Dez" amount="R$ 21,90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({ 
  label, 
  value, 
  trend, 
  positive = false 
}: { 
  label: string; 
  value: string; 
  trend: string;
  positive?: boolean;
}) => (
  <div className="bg-surface rounded-xl p-4 border border-border">
    <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
      {trend}
    </span>
  </div>
);

const ChartMockup = () => (
  <svg className="w-full h-24" viewBox="0 0 400 100" fill="none">
    <defs>
      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 80 Q50 70 100 60 T200 40 T300 50 T400 30 L400 100 L0 100 Z"
      fill="url(#chartGradient)"
    />
    <path
      d="M0 80 Q50 70 100 60 T200 40 T300 50 T400 30"
      stroke="hsl(160 84% 39%)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const UpcomingItem = ({ 
  name, 
  date, 
  amount 
}: { 
  name: string; 
  date: string; 
  amount: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground ml-2">{date}</span>
    </div>
    <span className="text-sm font-medium tabular-nums">{amount}</span>
  </div>
);