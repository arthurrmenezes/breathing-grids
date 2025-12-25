import { useState, useMemo } from "react";
import { AppLayout, useValuesVisibility } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PeriodType = "year" | "6months" | "3months" | "month";

const periodLabels: Record<PeriodType, string> = {
  year: "Último ano",
  "6months": "Últimos 6 meses",
  "3months": "Últimos 3 meses",
  month: "Este mês",
};

// Mock data for different periods
const yearlyData = [
  { label: "Jan", income: 7200, expense: 5800 },
  { label: "Fev", income: 7800, expense: 6100 },
  { label: "Mar", income: 8100, expense: 6400 },
  { label: "Abr", income: 7500, expense: 5900 },
  { label: "Mai", income: 8400, expense: 6200 },
  { label: "Jun", income: 8900, expense: 6700 },
  { label: "Jul", income: 8400, expense: 6200 },
  { label: "Ago", income: 7800, expense: 5900 },
  { label: "Set", income: 9200, expense: 7100 },
  { label: "Out", income: 8900, expense: 6800 },
  { label: "Nov", income: 9500, expense: 7400 },
  { label: "Dez", income: 10200, expense: 7800 },
];

const sixMonthsData = [
  { label: "Jul", income: 8400, expense: 6200 },
  { label: "Ago", income: 7800, expense: 5900 },
  { label: "Set", income: 9200, expense: 7100 },
  { label: "Out", income: 8900, expense: 6800 },
  { label: "Nov", income: 9500, expense: 7400 },
  { label: "Dez", income: 10200, expense: 7800 },
];

const threeMonthsData = [
  { label: "Out", income: 8900, expense: 6800 },
  { label: "Nov", income: 9500, expense: 7400 },
  { label: "Dez", income: 10200, expense: 7800 },
];

// Generate daily data for the current month (December)
const generateMonthlyData = () => {
  const daysInMonth = 31; // December
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    data.push({
      label: i.toString(),
      income: Math.floor(Math.random() * 500 + 100),
      expense: Math.floor(Math.random() * 400 + 50),
    });
  }
  return data;
};

const monthlyData = generateMonthlyData();

const recentTransactions = [
  { id: 1, name: "Supermercado Extra", category: "Alimentação", amount: -342.5, date: "24 Dez", icon: "🛒" },
  { id: 2, name: "Salário", category: "Receita", amount: 8450.0, date: "23 Dez", icon: "💰" },
  { id: 3, name: "Netflix", category: "Entretenimento", amount: -55.9, date: "22 Dez", icon: "🎬" },
  { id: 4, name: "Uber", category: "Transporte", amount: -28.9, date: "22 Dez", icon: "🚗" },
  { id: 5, name: "iFood", category: "Alimentação", amount: -67.8, date: "21 Dez", icon: "🍔" },
];

const upcomingBills = [
  { id: 1, name: "Aluguel", amount: 2500.0, dueDate: "05 Jan", status: "pending" },
  { id: 2, name: "Internet", amount: 129.9, dueDate: "10 Jan", status: "pending" },
  { id: 3, name: "Energia", amount: 245.0, dueDate: "15 Jan", status: "pending" },
];

const categoryData = [
  { category: "Alimentação", value: 1850 },
  { category: "Transporte", value: 980 },
  { category: "Lazer", value: 650 },
  { category: "Moradia", value: 2800 },
  { category: "Outros", value: 520 },
];

// Helper function to calculate nice Y-axis ticks based on max value
const calculateYAxisTicks = (maxValue: number): number[] => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  
  let step: number;
  if (normalized <= 1.5) {
    step = magnitude * 0.25;
  } else if (normalized <= 3) {
    step = magnitude * 0.5;
  } else if (normalized <= 6) {
    step = magnitude;
  } else {
    step = magnitude * 2;
  }
  
  const niceMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i <= niceMax; i += step) {
    ticks.push(i);
  }
  
  // Limit to 5 ticks max
  if (ticks.length > 5) {
    const newStep = niceMax / 4;
    return [0, newStep, newStep * 2, newStep * 3, niceMax];
  }
  
  return ticks;
};

const formatYAxisValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return value.toString();
};

const Dashboard = () => {
  const { showValues } = useValuesVisibility();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("6months");

  const chartData = useMemo(() => {
    switch (selectedPeriod) {
      case "year":
        return yearlyData;
      case "6months":
        return sixMonthsData;
      case "3months":
        return threeMonthsData;
      case "month":
        return monthlyData;
      default:
        return sixMonthsData;
    }
  }, [selectedPeriod]);

  const yAxisTicks = useMemo(() => {
    const maxIncome = Math.max(...chartData.map((d) => d.income));
    const maxExpense = Math.max(...chartData.map((d) => d.expense));
    const maxValue = Math.max(maxIncome, maxExpense);
    return calculateYAxisTicks(maxValue);
  }, [chartData]);

  const yAxisDomain = useMemo(() => {
    return [0, yAxisTicks[yAxisTicks.length - 1]];
  }, [yAxisTicks]);

  const hideValue = (value: string) => (showValues ? value : "••••••");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard 
            title="Saldo Total" 
            value={hideValue("R$ 47.892,54")} 
            change="+12,5%" 
            trend="up" 
            icon={Wallet}
            showValues={showValues}
          />
          <SummaryCard 
            title="Receitas" 
            value={hideValue("R$ 10.200,00")} 
            change="+7,4%" 
            trend="up" 
            icon={TrendingUp}
            showValues={showValues}
          />
          <SummaryCard 
            title="Despesas" 
            value={hideValue("R$ 7.800,00")} 
            change="+5,4%" 
            trend="down" 
            icon={TrendingDown}
            showValues={showValues}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium">Fluxo de Caixa</h3>
                <p className="text-sm text-muted-foreground">{periodLabels[selectedPeriod]}</p>
              </div>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodType)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Último ano</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="text-muted-foreground">Despesas</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  interval={selectedPeriod === "month" ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  ticks={yAxisTicks}
                  domain={yAxisDomain}
                  tickFormatter={formatYAxisValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label) => selectedPeriod === "month" ? `Dia ${label}` : label}
                  formatter={(value: number) => [showValues ? `R$ ${value.toLocaleString("pt-BR")}` : "••••••"]}
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
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => [showValues ? `R$ ${value.toLocaleString("pt-BR")}` : "••••••"]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  cursor={false}
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
                    <p className={`font-medium tabular-nums ${tx.amount > 0 ? "text-success" : ""}`}>
                      {showValues
                        ? `${tx.amount > 0 ? "+" : ""}R$ ${Math.abs(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "••••••"}
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
              <h3 className="text-lg font-medium">Próximas Despesas</h3>
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
                      {showValues
                        ? `R$ ${bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "••••••"}
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
  showValues,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  showValues: boolean;
}) => (
  <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 rounded-xl bg-accent/10">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div
        className={`flex items-center gap-1 text-sm font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}
      >
        {trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {showValues ? change : "••••"}
      </div>
    </div>
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
  </div>
);

export default Dashboard;