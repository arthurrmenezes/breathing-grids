import { AppLayout } from '@/components/app/AppLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const cashFlowData = [
  { month: 'Jul', income: 8400, expense: 6200 },
  { month: 'Ago', income: 7800, expense: 5900 },
  { month: 'Set', income: 9200, expense: 7100 },
  { month: 'Out', income: 8900, expense: 6800 },
  { month: 'Nov', income: 9500, expense: 7400 },
  { month: 'Dez', income: 10200, expense: 7800 },
];

const recentTransactions = [
  { id: 1, name: 'Supermercado Extra', category: 'Alimentação', amount: -342.50, date: '24 Dez', icon: '🛒' },
  { id: 2, name: 'Salário', category: 'Receita', amount: 8450.00, date: '23 Dez', icon: '💰' },
  { id: 3, name: 'Netflix', category: 'Entretenimento', amount: -55.90, date: '22 Dez', icon: '🎬' },
  { id: 4, name: 'Uber', category: 'Transporte', amount: -28.90, date: '22 Dez', icon: '🚗' },
  { id: 5, name: 'iFood', category: 'Alimentação', amount: -67.80, date: '21 Dez', icon: '🍔' },
];

const upcomingBills = [
  { id: 1, name: 'Aluguel', amount: 2500.00, dueDate: '05 Jan', status: 'pending' },
  { id: 2, name: 'Internet', amount: 129.90, dueDate: '10 Jan', status: 'pending' },
  { id: 3, name: 'Energia', amount: 245.00, dueDate: '15 Jan', status: 'pending' },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="Saldo Total"
            value="R$ 47.892,54"
            change="+12,5%"
            trend="up"
            icon={Wallet}
          />
          <SummaryCard
            title="Receitas"
            value="R$ 10.200,00"
            change="+7,4%"
            trend="up"
            icon={TrendingUp}
          />
          <SummaryCard
            title="Despesas"
            value="R$ 7.800,00"
            change="+5,4%"
            trend="down"
            icon={TrendingDown}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium">Fluxo de Caixa</h3>
                <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="text-muted-foreground">Despesas</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(160 84% 39%)" 
                  strokeWidth={2}
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  fill="transparent" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-medium mb-6">Gastos por Categoria</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { category: 'Alimentação', value: 1850 },
                { category: 'Transporte', value: 980 },
                { category: 'Lazer', value: 650 },
                { category: 'Moradia', value: 2800 },
                { category: 'Outros', value: 520 },
              ]} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(160 84% 39%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Transações Recentes</h3>
              <a href="/app/transacoes" className="text-sm text-accent hover:underline">
                Ver todas
              </a>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {tx.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tx.name}</p>
                    <p className="text-sm text-muted-foreground">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium tabular-nums ${tx.amount > 0 ? 'text-success' : ''}`}>
                      {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Próximas Contas</h3>
              <a href="/app/lembretes" className="text-sm text-accent hover:underline">
                Ver todas
              </a>
            </div>
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">Vence em {bill.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium tabular-nums">
                      R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const SummaryCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 rounded-xl bg-accent/10">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
  </div>
);

export default Dashboard;