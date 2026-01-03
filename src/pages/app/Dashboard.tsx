import { useState, useMemo, useEffect } from "react";
import { AppLayout, useValuesVisibility } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types/transaction";
import { Category } from "@/types/category";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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

// Helper function to calculate nice Y-axis ticks based on max value
const calculateYAxisTicks = (maxValue: number): number[] => {
  if (maxValue === 0) return [0];
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

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

// Color palette for categories
const categoryColors = [
  "hsl(160 84% 39%)", "hsl(200 84% 45%)", "hsl(280 84% 50%)", 
  "hsl(40 84% 50%)", "hsl(0 0% 60%)", "hsl(340 84% 50%)",
  "hsl(120 84% 39%)", "hsl(220 84% 50%)"
];

const Dashboard = () => {
  const { showValues } = useValuesVisibility();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("6months");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [currentSummary, setCurrentSummary] = useState<FinancialData | null>(null);
  const [previousSummary, setPreviousSummary] = useState<FinancialData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categorySpending, setCategorySpending] = useState<{ category: string; value: number; percentage: number; color: string }[]>([]);

  // Calculate date ranges for the selected period
  const getDateRanges = (period: PeriodType) => {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;
    
    switch (period) {
      case "year":
        startDate = subMonths(startOfMonth(now), 11);
        previousStartDate = subMonths(startDate, 12);
        previousEndDate = subMonths(startDate, 1);
        break;
      case "6months":
        startDate = subMonths(startOfMonth(now), 5);
        previousStartDate = subMonths(startDate, 6);
        previousEndDate = subMonths(startDate, 1);
        break;
      case "3months":
        startDate = subMonths(startOfMonth(now), 2);
        previousStartDate = subMonths(startDate, 3);
        previousEndDate = subMonths(startDate, 1);
        break;
      case "month":
      default:
        startDate = startOfMonth(now);
        previousStartDate = subMonths(startDate, 1);
        previousEndDate = endOfMonth(previousStartDate);
        break;
    }
    
    return {
      current: {
        start: format(startDate, "yyyy-MM-dd"),
        end: format(endOfMonth(now), "yyyy-MM-dd"),
      },
      previous: {
        start: format(previousStartDate, "yyyy-MM-dd"),
        end: format(previousEndDate, "yyyy-MM-dd"),
      },
    };
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateRanges = getDateRanges(selectedPeriod);
      
      try {
        // Fetch current period summary
        const currentResponse = await transactionService.getFinancialSummary(
          dateRanges.current.start,
          dateRanges.current.end
        );
        
        if (currentResponse.data) {
          setCurrentSummary({
            totalIncome: currentResponse.data.totalIncome,
            totalExpense: currentResponse.data.totalExpense,
            balance: currentResponse.data.balance,
          });
        }

        // Fetch previous period for comparison
        const previousResponse = await transactionService.getFinancialSummary(
          dateRanges.previous.start,
          dateRanges.previous.end
        );
        
        if (previousResponse.data) {
          setPreviousSummary({
            totalIncome: previousResponse.data.totalIncome,
            totalExpense: previousResponse.data.totalExpense,
            balance: previousResponse.data.balance,
          });
        }

        // Fetch recent transactions
        const transactionsResponse = await transactionService.getAll({
          pageNumber: 1,
          pageSize: 5,
        });
        
        if (transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data.transactions);
        }

        // Fetch categories
        const categoriesResponse = await categoryService.getAll({ pageSize: 50 });
        
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data.categories);
        }

        // Fetch all transactions for chart data and category spending
        const allTransactionsResponse = await transactionService.getAll({
          pageNumber: 1,
          pageSize: 1000,
          startDate: dateRanges.current.start,
          endDate: dateRanges.current.end,
        });

        if (allTransactionsResponse.data) {
          const transactions = allTransactionsResponse.data.transactions;
          
          // Build chart data by month
          const monthlyData = new Map<string, { income: number; expense: number }>();
          
          transactions.forEach((tx) => {
            const date = new Date(tx.date);
            const monthKey = format(date, "yyyy-MM");
            const monthLabel = monthLabels[date.getMonth()];
            
            if (!monthlyData.has(monthKey)) {
              monthlyData.set(monthKey, { income: 0, expense: 0 });
            }
            
            const data = monthlyData.get(monthKey)!;
            const isIncome = tx.transactionType === "Income" || tx.transactionType === "Receita";
            
            if (isIncome) {
              data.income += tx.amount;
            } else {
              data.expense += tx.amount;
            }
          });

          // Convert to array sorted by date
          const sortedEntries = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const chartDataPoints = sortedEntries.map(([key, data]) => {
            const date = new Date(key + "-01");
            return {
              label: monthLabels[date.getMonth()],
              income: data.income,
              expense: data.expense,
            };
          });
          
          setChartData(chartDataPoints.length > 0 ? chartDataPoints : [{ label: "-", income: 0, expense: 0 }]);

          // Calculate spending by category
          const categorySpendingMap = new Map<string, number>();
          
          transactions.forEach((tx) => {
            const isExpense = tx.transactionType === "Expense" || tx.transactionType === "Despesa";
            if (isExpense) {
              const current = categorySpendingMap.get(tx.categoryId) || 0;
              categorySpendingMap.set(tx.categoryId, current + tx.amount);
            }
          });

          const totalSpending = Array.from(categorySpendingMap.values()).reduce((a, b) => a + b, 0);
          
          const spendingData = Array.from(categorySpendingMap.entries())
            .map(([categoryId, value], index) => {
              const category = categoriesResponse.data?.categories.find(c => c.id === categoryId);
              return {
                category: category?.title || "Outros",
                value,
                percentage: totalSpending > 0 ? Math.round((value / totalSpending) * 100) : 0,
                color: categoryColors[index % categoryColors.length],
              };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
          
          setCategorySpending(spendingData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [0];
    const maxIncome = Math.max(...chartData.map((d) => d.income));
    const maxExpense = Math.max(...chartData.map((d) => d.expense));
    const maxValue = Math.max(maxIncome, maxExpense);
    return calculateYAxisTicks(maxValue);
  }, [chartData]);

  const yAxisDomain = useMemo(() => {
    return [0, yAxisTicks[yAxisTicks.length - 1] || 1];
  }, [yAxisTicks]);

  const hideValue = (value: string) => (showValues ? value : "••••••");

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, value: current };
    const percentage = Math.round(((current - previous) / previous) * 100);
    const value = current - previous;
    return { percentage, value };
  };

  const balanceChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.balance, previousSummary.balance)
    : { percentage: 0, value: 0 };

  const incomeChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.totalIncome, previousSummary.totalIncome)
    : { percentage: 0, value: 0 };

  const expenseChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.totalExpense, previousSummary.totalExpense)
    : { percentage: 0, value: 0 };

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const totalCategorySpending = categorySpending.reduce((sum, cat) => sum + cat.value, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard 
            title="Saldo disponível" 
            value={hideValue(formatCurrency(user?.balance || currentSummary?.balance || 0))} 
            change={`${balanceChange.percentage >= 0 ? "+" : ""}${balanceChange.percentage}%`}
            changeValue={`${balanceChange.value >= 0 ? "+" : "-"}${formatCurrency(balanceChange.value)}`}
            trend={balanceChange.percentage >= 0 ? "up" : "down"} 
            icon={Wallet}
            showValues={showValues}
          />
          <SummaryCard 
            title="Receitas" 
            value={hideValue(formatCurrency(currentSummary?.totalIncome || 0))} 
            change={`${incomeChange.percentage >= 0 ? "+" : ""}${incomeChange.percentage}%`}
            changeValue={`${incomeChange.value >= 0 ? "+" : "-"}${formatCurrency(incomeChange.value)}`}
            trend={incomeChange.percentage >= 0 ? "up" : "down"} 
            icon={TrendingUp}
            showValues={showValues}
          />
          <SummaryCard 
            title="Despesas" 
            value={hideValue(formatCurrency(currentSummary?.totalExpense || 0))} 
            change={`${expenseChange.percentage >= 0 ? "+" : ""}${expenseChange.percentage}%`}
            changeValue={`${expenseChange.value >= 0 ? "+" : "-"}${formatCurrency(expenseChange.value)}`}
            trend={expenseChange.percentage <= 0 ? "up" : "down"} 
            icon={TrendingDown}
            showValues={showValues}
          />
        </div>

        {/* Cash Flow Chart - Second Position */}
        <div className="bg-card rounded-2xl border border-border p-6">
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
                interval={0}
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
                formatter={(value: number) => [showValues ? formatCurrency(value) : "••••••"]}
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

        {/* Middle Row - Transactions and Category Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Transações Recentes</h3>
              <a href="/app/transacoes" className="text-sm text-accent hover:underline">
                Ver todas
              </a>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.transactionType === "Income" || tx.transactionType === "Receita";
                  const category = categories.find(c => c.id === tx.categoryId);
                  // Use parseISO to correctly handle the date without timezone issues
                  const formattedDate = format(parseISO(tx.date), "dd MMM", { locale: ptBR });
                  
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {isIncome ? "💰" : "💸"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${!showValues ? 'blur-sm select-none' : ''}`}>{tx.title}</p>
                        <p className={`text-sm text-muted-foreground ${!showValues ? 'blur-sm select-none' : ''}`}>{category?.title || "Sem categoria"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium tabular-nums ${isIncome ? "text-success" : "text-destructive"}`}>
                          {showValues
                            ? `${isIncome ? "+" : "-"}${formatCurrency(tx.amount)}`
                            : "••••••"}
                        </p>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Category Breakdown with Donut Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Gastos por Categoria</h3>
              <a href="/app/categorias" className="text-sm text-accent hover:underline">
                Ver todas
              </a>
            </div>
            
            {categorySpending.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum gasto no período</p>
            ) : (
              <>
                {/* Donut Chart */}
                <div className="relative mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold">{showValues ? formatCurrency(totalCategorySpending) : "••••••"}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>

                {/* Category List with percentages */}
                <div className="space-y-3">
                  {categorySpending.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{showValues ? formatCurrency(cat.value) : "••••••"}</span>
                        <span className="text-xs text-muted-foreground w-8 text-right">{cat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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
  changeValue,
  trend,
  icon: Icon,
  showValues,
}: {
  title: string;
  value: string;
  change: string;
  changeValue: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  showValues: boolean;
}) => (
  <div className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm ${trend === "up" ? "text-success" : "text-destructive"}`}>
            {showValues ? `${changeValue} vs mês anterior` : "•••••••"}
          </span>
          {showValues && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              trend === "up" 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            }`}>
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="p-2 rounded-xl bg-accent/10">
        <Icon className="w-5 h-5 text-accent" />
      </div>
    </div>
  </div>
);

export default Dashboard;
