import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  CreditCard,
  Sparkles,
  Target
} from 'lucide-react';

export const BentoGrid = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container relative mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-micro uppercase tracking-widest text-accent mb-4 block">
            Features
          </span>
          <h2 className="text-h1 mb-4">
            Everything you need,{' '}
            <span className="text-gradient">nothing you don't</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Powerful tools designed to give you complete visibility and control 
            over your financial life.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {/* Large Card - Cash Flow Visualization */}
          <div className="md:col-span-2 md:row-span-2 group">
            <BentoCard className="h-full min-h-[400px] p-8">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-micro uppercase tracking-widest text-muted-foreground">
                    Cash Flow
                  </span>
                </div>
                
                <h3 className="text-h2 mb-3">
                  Visualize your money in motion
                </h3>
                <p className="text-muted-foreground mb-8">
                  Real-time charts that breathe with your finances. See patterns, 
                  predict trends, and make informed decisions.
                </p>
                
                {/* Chart Animation */}
                <div className="flex-1 relative rounded-xl bg-secondary/50 overflow-hidden">
                  <AnimatedChart />
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Smart Categorization */}
          <div className="group">
            <BentoCard className="h-full min-h-[200px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-success/10">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                <span className="text-micro uppercase tracking-widest text-muted-foreground">
                  Smart AI
                </span>
              </div>
              
              <h3 className="text-h3 mb-2">Auto-categorization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI learns your spending patterns and categorizes automatically.
              </p>
              
              <div className="space-y-2">
                <TransactionRow icon="🍕" name="Pizza Hut" category="Food" />
                <TransactionRow icon="🚗" name="Uber" category="Transport" />
                <TransactionRow icon="🎬" name="Netflix" category="Entertainment" />
              </div>
            </BentoCard>
          </div>

          {/* Recurring Logic */}
          <div className="group">
            <BentoCard className="h-full min-h-[200px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <span className="text-micro uppercase tracking-widest text-muted-foreground">
                  Recurring
                </span>
              </div>
              
              <h3 className="text-h3 mb-2">Predict your bills</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Never be surprised by a recurring payment again.
              </p>
              
              <CalendarMockup />
            </BentoCard>
          </div>

          {/* Card Management - Wide */}
          <div className="md:col-span-2 group">
            <BentoCard className="h-full min-h-[200px] p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-purple-soft">
                      <CreditCard className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-micro uppercase tracking-widest text-muted-foreground">
                      Cards
                    </span>
                  </div>
                  
                  <h3 className="text-h3 mb-2">Manage all your cards</h3>
                  <p className="text-sm text-muted-foreground">
                    Track limits, closing dates, and find the best day to buy. 
                    Freeze cards instantly when needed.
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <CreditCardMockup />
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Goals */}
          <div className="group">
            <BentoCard className="h-full min-h-[180px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-success/10">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <span className="text-micro uppercase tracking-widest text-muted-foreground">
                  Goals
                </span>
              </div>
              
              <h3 className="text-h3 mb-2">Save with purpose</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set goals and watch your progress grow.
              </p>
              
              <div className="space-y-3">
                <GoalProgress label="Emergency Fund" progress={72} />
                <GoalProgress label="Vacation" progress={45} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
};

const BentoCard = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div 
    className={`
      relative bg-surface rounded-2xl border border-border 
      shadow-card hover:shadow-card-hover 
      transition-all duration-300 
      group-hover:border-accent/20
      overflow-hidden
      ${className}
    `}
  >
    {/* Noise texture overlay */}
    <div className="absolute inset-0 noise-texture pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const TransactionRow = ({ 
  icon, 
  name, 
  category 
}: { 
  icon: string; 
  name: string; 
  category: string;
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium flex-1">{name}</span>
    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
      {category}
    </span>
  </div>
);

const AnimatedChart = () => (
  <div className="absolute inset-0 flex items-end p-4">
    <svg className="w-full h-3/4" viewBox="0 0 400 150" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bentoChartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(262 72% 62%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(262 72% 62%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 120 Q40 100 80 110 T160 80 T240 90 T320 60 T400 70 L400 150 L0 150 Z"
        fill="url(#bentoChartGradient)"
        className="animate-pulse-soft"
      />
      <path
        d="M0 120 Q40 100 80 110 T160 80 T240 90 T320 60 T400 70"
        stroke="hsl(262 72% 62%)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Data points */}
      <circle cx="80" cy="110" r="4" fill="hsl(262 72% 62%)" />
      <circle cx="160" cy="80" r="4" fill="hsl(262 72% 62%)" />
      <circle cx="240" cy="90" r="4" fill="hsl(262 72% 62%)" />
      <circle cx="320" cy="60" r="4" fill="hsl(262 72% 62%)" />
    </svg>
    
    {/* Floating tooltip */}
    <div className="absolute top-8 right-12 bg-foreground text-primary-foreground text-xs px-3 py-1.5 rounded-lg shadow-lg">
      R$ 4,250
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
    </div>
  </div>
);

const CalendarMockup = () => (
  <div className="grid grid-cols-7 gap-1">
    {Array.from({ length: 28 }, (_, i) => {
      const isHighlighted = [4, 11, 18, 25].includes(i);
      return (
        <div
          key={i}
          className={`
            aspect-square rounded-md flex items-center justify-center text-xs
            ${isHighlighted 
              ? 'bg-accent text-accent-foreground font-medium' 
              : 'bg-secondary/50 text-muted-foreground'
            }
          `}
        >
          {i + 1}
        </div>
      );
    })}
  </div>
);

const CreditCardMockup = () => (
  <div className="relative w-56 h-36 rounded-xl bg-card-gradient p-5 text-primary-foreground transform transition-transform duration-500 hover:rotate-3 shadow-purple-glow">
    <div className="flex justify-between items-start mb-8">
      <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
      <span className="text-xs opacity-80">tMoney</span>
    </div>
    <div className="text-sm tracking-widest mb-2 opacity-90">•••• •••• •••• 4829</div>
    <div className="flex justify-between items-end">
      <div>
        <span className="text-[10px] uppercase opacity-60 block">Limit Available</span>
        <span className="text-sm font-medium">R$ 8,500</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-destructive/80" />
        <div className="w-6 h-6 rounded-full bg-yellow-500/80 -ml-3" />
      </div>
    </div>
  </div>
);

const GoalProgress = ({ 
  label, 
  progress 
}: { 
  label: string; 
  progress: number;
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{progress}%</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-accent rounded-full transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
