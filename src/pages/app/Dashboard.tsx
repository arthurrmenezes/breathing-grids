import { useState, useMemo, useEffect } from "react";
import { AppLayout, useValuesVisibility } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Wallet, Loader2, CalendarDays, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types/transaction";
import { Category } from "@/types/category";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, startOfQuarter, startOfYear, subDays, getDaysInMonth, getDate, subWeeks, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type PeriodType = "year" | "6months" | "3months" | "month";
type MainPeriodType = "current-month" | "last-month" | "current-quarter" | "current-year" | "last-6-months" | "last-12-months" | "custom";
type PatrimonioPeriodType = "1D" | "1W" | "1M" | "3M" | "YTD" | "1Y" | "ALL";

const periodLabels: Record<PeriodType, string> = {
  year: "Último ano",
  "6months": "Últimos 6 meses",
  "3months": "Últimos 3 meses",
  month: "Este mês",
};

const mainPeriodLabels: Record<MainPeriodType, string> = {
  "current-month": "Mês atual",
  "last-month": "Mês passado",
  "current-quarter": "Trimestre atual",
  "current-year": "Ano atual",
  "last-6-months": "Últimos 6 meses",
  "last-12-months": "Últimos 12 meses",
  "custom": "Personalizado",
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
    return `R$ ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `R$ ${value}`;
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

interface SpendingPaceDataPoint {
  day: number;
  currentMonth: number;
  previousMonth: number;
}

interface PatrimonioDataPoint {
  label: string;
  value: number;
}

interface CategorySpendingItem {
  category: string;
  currentValue: number;
  previousValue: number;
  variation: number;
  color: string;
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
  const navigate = useNavigate();
  
  // Main period filter
  const [mainPeriod, setMainPeriod] = useState<MainPeriodType>("current-month");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  
  // Separate period for cash flow chart
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("6months");
  
  // Patrimonio period
  const [patrimonioPeriod, setPatrimonioPeriod] = useState<PatrimonioPeriodType>("1M");
  
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [periodBalance, setPeriodBalance] = useState<number>(0);
  const [currentSummary, setCurrentSummary] = useState<FinancialData | null>(null);
  const [previousSummary, setPreviousSummary] = useState<FinancialData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpendingItem[]>([]);
  
  // Spending pace data
  const [spendingPaceData, setSpendingPaceData] = useState<SpendingPaceDataPoint[]>([]);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(0);
  
  // Patrimonio data
  const [patrimonioData, setPatrimonioData] = useState<PatrimonioDataPoint[]>([]);
  const [currentPatrimonio, setCurrentPatrimonio] = useState(0);
  const [patrimonioChange, setPatrimonioChange] = useState(0);

  // Calculate date ranges based on main period
  const getMainDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfMonth(now);
    
    switch (mainPeriod) {
      case "current-month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last-month":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "current-quarter":
        startDate = startOfQuarter(now);
        endDate = endOfMonth(now);
        break;
      case "current-year":
        startDate = startOfYear(now);
        endDate = endOfMonth(now);
        break;
      case "last-6-months":
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      case "last-12-months":
        startDate = startOfMonth(subMonths(now, 11));
        endDate = endOfMonth(now);
        break;
      case "custom":
        startDate = customStartDate || startOfMonth(now);
        endDate = customEndDate || endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
    }
    
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
      startDate,
      endDate,
    };
  };

  // Calculate previous period for comparison
  const getPreviousDateRange = () => {
    const { startDate, endDate } = getMainDateRange();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = subDays(startDate, daysDiff);
    const previousEnd = subDays(startDate, 1);
    
    return {
      start: format(previousStart, "yyyy-MM-dd"),
      end: format(previousEnd, "yyyy-MM-dd"),
    };
  };

  // Calculate date ranges for cash flow chart
  const getChartDateRanges = (period: PeriodType) => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "year":
        startDate = subMonths(startOfMonth(now), 11);
        break;
      case "6months":
        startDate = subMonths(startOfMonth(now), 5);
        break;
      case "3months":
        startDate = subMonths(startOfMonth(now), 2);
        break;
      case "month":
      default:
        startDate = startOfMonth(now);
        break;
    }
    
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  };

  // Fetch balance for the selected period (income - expenses for that period)
  const fetchPeriodBalance = async () => {
    try {
      const { start, end } = getMainDateRange();
      // Get financial summary for the selected period (not cumulative)
      const response = await transactionService.getFinancialSummary(start, end);
      if (response.data) {
        // Calculate balance as income - expenses for the period
        const periodBalance = response.data.totalIncome - response.data.totalExpense;
        setPeriodBalance(periodBalance);
      }
    } catch (error) {
      console.error("Error fetching period balance:", error);
    }
  };

  // Fetch spending pace data (cumulative expenses per day for current and previous month)
  const fetchSpendingPaceData = async () => {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));
      
      const daysInCurrentMonth = getDaysInMonth(now);
      const daysInPreviousMonth = getDaysInMonth(subMonths(now, 1));
      const currentDay = getDate(now);
      
      // Fetch current month transactions
      const currentResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: format(currentMonthStart, "yyyy-MM-dd"),
        endDate: format(currentMonthEnd, "yyyy-MM-dd"),
      });
      
      // Fetch previous month transactions
      const previousResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: format(previousMonthStart, "yyyy-MM-dd"),
        endDate: format(previousMonthEnd, "yyyy-MM-dd"),
      });
      
      // Build cumulative data for current month
      const currentExpensesByDay = new Map<number, number>();
      if (currentResponse.data) {
        currentResponse.data.transactions.forEach((tx) => {
          const isExpense = tx.transactionType === "Expense" || tx.transactionType === "Despesa";
          if (isExpense) {
            const day = getDate(parseISO(tx.date));
            currentExpensesByDay.set(day, (currentExpensesByDay.get(day) || 0) + tx.amount);
          }
        });
      }
      
      // Build cumulative data for previous month
      const previousExpensesByDay = new Map<number, number>();
      if (previousResponse.data) {
        previousResponse.data.transactions.forEach((tx) => {
          const isExpense = tx.transactionType === "Expense" || tx.transactionType === "Despesa";
          if (isExpense) {
            const day = getDate(parseISO(tx.date));
            previousExpensesByDay.set(day, (previousExpensesByDay.get(day) || 0) + tx.amount);
          }
        });
      }
      
      // Generate chart data with cumulative values
      const chartPoints: SpendingPaceDataPoint[] = [];
      let cumulativeCurrent = 0;
      let cumulativePrevious = 0;
      
      const maxDays = Math.max(daysInCurrentMonth, daysInPreviousMonth);
      
      for (let day = 1; day <= maxDays; day++) {
        cumulativeCurrent += currentExpensesByDay.get(day) || 0;
        cumulativePrevious += previousExpensesByDay.get(day) || 0;
        
        chartPoints.push({
          day,
          currentMonth: day <= currentDay ? cumulativeCurrent : 0,
          previousMonth: cumulativePrevious,
        });
      }
      
      setSpendingPaceData(chartPoints);
      setCurrentMonthTotal(cumulativeCurrent);
      setPreviousMonthTotal(cumulativePrevious);
    } catch (error) {
      console.error("Error fetching spending pace data:", error);
    }
  };

  // Fetch patrimonio (income) data based on selected period
  const fetchPatrimonioData = async () => {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (patrimonioPeriod) {
        case "1D":
          startDate = subDays(now, 1);
          break;
        case "1W":
          startDate = subWeeks(now, 1);
          break;
        case "1M":
          startDate = subMonths(now, 1);
          break;
        case "3M":
          startDate = subMonths(now, 3);
          break;
        case "YTD":
          startDate = startOfYear(now);
          break;
        case "1Y":
          startDate = subYears(now, 1);
          break;
        case "ALL":
        default:
          startDate = subYears(now, 5);
          break;
      }
      
      const response = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      });
      
      if (response.data) {
        const transactions = response.data.transactions;
        
        // Group by date and calculate cumulative balance
        const dailyBalance = new Map<string, number>();
        let runningBalance = 0;
        
        // Sort transactions by date
        const sortedTx = [...transactions].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        sortedTx.forEach((tx) => {
          const dateKey = format(parseISO(tx.date), "dd/MM");
          const isIncome = tx.transactionType === "Income" || tx.transactionType === "Receita";
          runningBalance += isIncome ? tx.amount : -tx.amount;
          dailyBalance.set(dateKey, runningBalance);
        });
        
        const chartPoints: PatrimonioDataPoint[] = Array.from(dailyBalance.entries()).map(([label, value]) => ({
          label,
          value,
        }));
        
        setPatrimonioData(chartPoints);
        setCurrentPatrimonio(runningBalance);
        
        // Calculate change percentage
        const firstValue = chartPoints.length > 0 ? chartPoints[0].value : 0;
        const change = firstValue !== 0 ? ((runningBalance - firstValue) / Math.abs(firstValue)) * 100 : 0;
        setPatrimonioChange(change);
      }
    } catch (error) {
      console.error("Error fetching patrimonio data:", error);
    }
  };

  // Fetch summary data based on selected period
  const fetchSummaryData = async () => {
    const { start: monthStart, end: monthEnd } = getMainDateRange();
    const { start: previousMonthStart, end: previousMonthEnd } = getPreviousDateRange();

    try {
      // Fetch current period summary
      const currentResponse = await transactionService.getFinancialSummary(monthStart, monthEnd);
      
      if (currentResponse.data) {
        setCurrentSummary({
          totalIncome: currentResponse.data.totalIncome,
          totalExpense: currentResponse.data.totalExpense,
          balance: currentResponse.data.balance,
        });
      }

      // Fetch previous period for comparison
      const previousResponse = await transactionService.getFinancialSummary(previousMonthStart, previousMonthEnd);
      
      if (previousResponse.data) {
        setPreviousSummary({
          totalIncome: previousResponse.data.totalIncome,
          totalExpense: previousResponse.data.totalExpense,
          balance: previousResponse.data.balance,
        });
      }

      // Fetch categories
      const categoriesResponse = await categoryService.getAll({ pageSize: 50 });
      
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories);
      }

      // Fetch transactions for category spending (current period)
      const transactionsForPeriod = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: monthStart,
        endDate: monthEnd,
      });

      // Fetch transactions for previous period
      const transactionsForPrevious = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: previousMonthStart,
        endDate: previousMonthEnd,
      });

      if (transactionsForPeriod.data && transactionsForPrevious.data && categoriesResponse.data) {
        const currentTransactions = transactionsForPeriod.data.transactions;
        const previousTransactions = transactionsForPrevious.data.transactions;
        
        // Calculate spending by category for current period
        const currentCategoryMap = new Map<string, number>();
        currentTransactions.forEach((tx) => {
          const isExpense = tx.transactionType === "Expense" || tx.transactionType === "Despesa";
          if (isExpense) {
            const current = currentCategoryMap.get(tx.categoryId) || 0;
            currentCategoryMap.set(tx.categoryId, current + tx.amount);
          }
        });

        // Calculate spending by category for previous period
        const previousCategoryMap = new Map<string, number>();
        previousTransactions.forEach((tx) => {
          const isExpense = tx.transactionType === "Expense" || tx.transactionType === "Despesa";
          if (isExpense) {
            const current = previousCategoryMap.get(tx.categoryId) || 0;
            previousCategoryMap.set(tx.categoryId, current + tx.amount);
          }
        });

        const spendingData: CategorySpendingItem[] = Array.from(currentCategoryMap.entries())
          .map(([categoryId, currentValue], index) => {
            const category = categoriesResponse.data?.categories.find(c => c.id === categoryId);
            const previousValue = previousCategoryMap.get(categoryId) || 0;
            const variation = previousValue > 0 
              ? Math.round(((currentValue - previousValue) / previousValue) * 100) 
              : 0;
            return {
              category: category?.title || "Outros",
              currentValue,
              previousValue,
              variation,
              color: categoryColors[index % categoryColors.length],
            };
          })
          .sort((a, b) => b.currentValue - a.currentValue)
          .slice(0, 5);
        
        setCategorySpending(spendingData);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  };

  // Fetch chart data based on selected period
  const fetchChartData = async () => {
    const dateRanges = getChartDateRanges(selectedPeriod);

    try {
      const allTransactionsResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: dateRanges.start,
        endDate: dateRanges.end,
      });

      if (allTransactionsResponse.data) {
        const transactions = allTransactionsResponse.data.transactions;
        
        // Build chart data by month
        const monthlyData = new Map<string, { income: number; expense: number }>();
        
        transactions.forEach((tx) => {
          const date = new Date(tx.date);
          const monthKey = format(date, "yyyy-MM");
          
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
        const chartDataPoints = sortedEntries.map(([key]) => {
          const date = new Date(key + "-01");
          const data = monthlyData.get(key)!;
          return {
            label: monthLabels[date.getMonth()],
            income: data.income,
            expense: data.expense,
          };
        });
        
        setChartData(chartDataPoints.length > 0 ? chartDataPoints : [{ label: "-", income: 0, expense: 0 }]);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Fetch recent transactions (ordered by date, most recent first)
  const fetchRecentTransactions = async () => {
    try {
      const transactionsResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 5,
      });
      
      if (transactionsResponse.data) {
        // Sort by date descending (most recent first)
        const sorted = [...transactionsResponse.data.transactions].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setRecentTransactions(sorted);
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchPeriodBalance(),
        fetchSummaryData(),
        fetchChartData(),
        fetchRecentTransactions(),
        fetchSpendingPaceData(),
        fetchPatrimonioData(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Update summary, category spending and balance when period changes
  useEffect(() => {
    fetchPeriodBalance();
    fetchSummaryData();
    fetchSpendingPaceData();
  }, [mainPeriod, customStartDate, customEndDate]);

  // Update chart when period changes
  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod]);

  // Update patrimonio when period changes
  useEffect(() => {
    fetchPatrimonioData();
  }, [patrimonioPeriod]);

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

  // Spending pace chart ticks
  const spendingPaceYAxisTicks = useMemo(() => {
    if (spendingPaceData.length === 0) return [0];
    const maxCurrent = Math.max(...spendingPaceData.map((d) => d.currentMonth));
    const maxPrevious = Math.max(...spendingPaceData.map((d) => d.previousMonth));
    const maxValue = Math.max(maxCurrent, maxPrevious);
    return calculateYAxisTicks(maxValue);
  }, [spendingPaceData]);

  const spendingPaceYAxisDomain = useMemo(() => {
    return [0, spendingPaceYAxisTicks[spendingPaceYAxisTicks.length - 1] || 1];
  }, [spendingPaceYAxisTicks]);

  // Patrimonio chart ticks
  const patrimonioYAxisTicks = useMemo(() => {
    if (patrimonioData.length === 0) return [0];
    const maxValue = Math.max(...patrimonioData.map((d) => d.value));
    const minValue = Math.min(...patrimonioData.map((d) => d.value));
    return calculateYAxisTicks(Math.max(Math.abs(maxValue), Math.abs(minValue)));
  }, [patrimonioData]);

  const hideValue = (value: string) => (showValues ? value : "••••••");

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, value: current };
    const percentage = Math.round(((current - previous) / previous) * 100);
    const value = current - previous;
    return { percentage, value };
  };

  const incomeChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.totalIncome, previousSummary.totalIncome)
    : { percentage: 0, value: 0 };

  const expenseChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.totalExpense, previousSummary.totalExpense)
    : { percentage: 0, value: 0 };

  const spendingPaceChange = previousMonthTotal > 0
    ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100)
    : 0;

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const getPeriodLabel = () => {
    if (mainPeriod === "custom" && customStartDate && customEndDate) {
      return `${format(customStartDate, "dd/MM/yy")} - ${format(customEndDate, "dd/MM/yy")}`;
    }
    return mainPeriodLabels[mainPeriod];
  };

  const handleViewExpenses = () => {
    const { start, end } = getMainDateRange();
    navigate(`/app/transacoes?type=expense&startDate=${start}&endDate=${end}`);
  };

  const handleViewIncomes = () => {
    const { start, end } = getMainDateRange();
    navigate(`/app/transacoes?type=income&startDate=${start}&endDate=${end}`);
  };

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
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{getPeriodLabel()}</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-4 h-4 mr-2" />
                Alterar período
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(mainPeriodLabels) as MainPeriodType[]).filter(k => k !== 'custom').map((key) => (
                    <Button
                      key={key}
                      variant={mainPeriod === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMainPeriod(key)}
                      className="justify-start"
                    >
                      {mainPeriodLabels[key]}
                    </Button>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <Button
                    variant={mainPeriod === "custom" ? "default" : "outline"}
                    size="sm"
                    className="w-full mb-3"
                    onClick={() => setMainPeriod("custom")}
                  >
                    Personalizado
                  </Button>
                  {mainPeriod === "custom" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Data inicial</Label>
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          className={cn("p-2 pointer-events-auto rounded-md border text-sm")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Data final</Label>
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          className={cn("p-2 pointer-events-auto rounded-md border text-sm")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard 
            title="Saldo disponível" 
            value={hideValue(formatCurrency(periodBalance))} 
            subtitle="Saldo até o período"
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

        {/* Spending Pace and Patrimonio Charts - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Pace Chart */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ritmo de Gastos</h3>
              <button 
                onClick={handleViewExpenses}
                className="text-sm text-accent hover:underline"
              >
                Ver mais
              </button>
            </div>
            
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {showValues ? formatCurrency(currentMonthTotal) : "••••••"}{" "}
                <span className="text-base font-normal text-muted-foreground">abaixo</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  spendingPaceChange <= 0 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {spendingPaceChange >= 0 ? "+" : ""}{spendingPaceChange}%
                </span>
                <span className="text-sm text-muted-foreground">
                  vs {showValues ? formatCurrency(previousMonthTotal) : "••••••"} mês anterior
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendingPaceData}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(35 92% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(35 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  ticks={spendingPaceYAxisTicks}
                  domain={spendingPaceYAxisDomain}
                  tickFormatter={formatYAxisValue}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number, name: string) => [
                    showValues ? formatCurrency(value) : "••••••",
                    name === "currentMonth" ? "Este mês" : "Mês passado"
                  ]}
                  labelFormatter={(day) => `Dia ${day}`}
                />
                <Area
                  type="monotone"
                  dataKey="currentMonth"
                  stroke="hsl(35 92% 50%)"
                  strokeWidth={2}
                  fill="url(#spendingGradient)"
                  name="Este mês"
                />
                <Line
                  type="monotone"
                  dataKey="previousMonth"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Mês passado"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[hsl(35_92%_50%)]" />
                <span className="text-muted-foreground">Este mês</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-muted-foreground" style={{ borderStyle: "dashed" }} />
                <span className="text-muted-foreground">Mês passado</span>
              </div>
            </div>
          </div>

          {/* Patrimonio Chart */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Patrimônio</h3>
              <button 
                onClick={handleViewIncomes}
                className="text-sm text-accent hover:underline"
              >
                Ver mais
              </button>
            </div>
            
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {showValues ? formatCurrency(currentPatrimonio) : "••••••"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  patrimonioChange >= 0 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {patrimonioChange >= 0 ? "+" : ""}{patrimonioChange.toFixed(2)}%
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={patrimonioData}>
                <defs>
                  <linearGradient id="patrimonioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={formatYAxisValue}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [showValues ? formatCurrency(value) : "••••••", "Patrimônio"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2}
                  fill="url(#patrimonioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Period buttons */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {(["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"] as PatrimonioPeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setPatrimonioPeriod(period)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors",
                    patrimonioPeriod === period
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cash Flow Chart */}
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
                  color: "hsl(var(--foreground))",
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

        {/* Middle Row - Transactions and Category Breakdown 50/50 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Transações Recentes</h3>
              <Link to="/app/transacoes" className="text-sm text-accent hover:underline">
                Ver todas
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.transactionType === "Income" || tx.transactionType === "Receita";
                  const category = categories.find(c => c.id === tx.categoryId);
                  const formattedDate = format(parseISO(tx.date), "dd MMM", { locale: ptBR });
                  
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                        {isIncome ? "💰" : "💸"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!showValues ? 'blur-sm select-none' : ''}`}>{tx.title}</p>
                        <p className={`text-xs text-muted-foreground ${!showValues ? 'blur-sm select-none' : ''}`}>{category?.title || "Sem categoria"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium tabular-nums ${isIncome ? "text-success" : "text-destructive"}`}>
                          {showValues
                            ? `${isIncome ? "+" : "-"}${formatCurrency(tx.amount)}`
                            : "••••••"}
                        </p>
                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown - Table Format */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Principais Categorias</h3>
              <Link to="/app/categorias" className="text-sm text-accent hover:underline">
                Ver mais
              </Link>
            </div>
            
            {categorySpending.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum gasto no período</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left py-2 font-medium">Categoria</th>
                      <th className="text-right py-2 font-medium px-3">Atual</th>
                      <th className="text-right py-2 font-medium px-3">vs Anterior</th>
                      <th className="text-right py-2 font-medium px-3">Anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySpending.map((cat) => (
                      <tr key={cat.category} className="border-b border-border/50 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm font-medium">{cat.category}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right px-3">
                          <span className="text-sm font-medium">
                            {showValues ? formatCurrency(cat.currentValue) : "••••••"}
                          </span>
                        </td>
                        <td className="py-3 text-right px-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            cat.variation <= 0 
                              ? "bg-success/10 text-success" 
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {cat.variation >= 0 ? "+" : ""}{cat.variation}%
                          </span>
                        </td>
                        <td className="py-3 text-right px-3">
                          <span className="text-sm text-muted-foreground">
                            {showValues ? formatCurrency(cat.previousValue) : "••••••"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  subtitle,
  icon: Icon,
  showValues,
}: {
  title: string;
  value: string;
  change?: string;
  changeValue?: string;
  trend?: "up" | "down";
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  showValues: boolean;
}) => (
  <div className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {showValues ? `${changeValue} vs período anterior` : "•••••••"}
            </span>
            {showValues && change && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                trend === "up" 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {change}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-2 rounded-xl bg-accent/10">
        <Icon className="w-5 h-5 text-accent" />
      </div>
    </div>
  </div>
);

export default Dashboard;