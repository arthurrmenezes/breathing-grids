import { useState, useMemo, useEffect } from "react";
import { AppLayout, useValuesVisibility } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Wallet, Loader2, CalendarDays, ChevronDown, Plus, AlertCircle, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { transactionService } from "@/services/transactionService";
import { categoryService } from "@/services/categoryService";
import { cardService } from "@/services/cardService";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction, PaymentStatusEnum } from "@/types/transaction";
import { Category } from "@/types/category";
import { Card } from "@/types/card";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, getDate, parseISO, startOfMonth, startOfQuarter, startOfYear, subDays, subMonths } from "date-fns";
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
import { cn } from "@/lib/utils";
import { NewTransactionModal } from "@/components/app/NewTransactionModal";

type PeriodType = "current-month" | "year" | "6months" | "3months";
type MainPeriodType = "current-month" | "last-month" | "current-quarter" | "current-year" | "last-6-months" | "last-12-months";
type AccumulatedPeriodType = "3months" | "6months" | "year";
type TransactionFilterType = "all" | "income" | "expense";

const periodLabels: Record<PeriodType, string> = {
  "current-month": "Mês atual",
  year: "Último ano",
  "6months": "Últimos 6 meses",
  "3months": "Últimos 3 meses",
};

const mainPeriodLabels: Record<MainPeriodType, string> = {
  "current-month": "Mês atual",
  "last-month": "Mês passado",
  "current-quarter": "Trimestre atual",
  "current-year": "Ano atual",
  "last-6-months": "Últimos 6 meses",
  "last-12-months": "Últimos 12 meses",
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
  periodIncome: number;
  periodExpense: number;
  balance: number;
}

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface SimpleTimeSeriesPoint {
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

  const isIncomeTx = (tx: Transaction) => tx.transactionType === "Income" || tx.transactionType === "Receita";
  const isExpenseTx = (tx: Transaction) => tx.transactionType === "Expense" || tx.transactionType === "Despesa";
  const capitalize = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
  
  // Card filter - filter all data by selected card (always has a card selected)
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [cardsLoaded, setCardsLoaded] = useState(false);
  
  // Main period filter
  const [mainPeriod, setMainPeriod] = useState<MainPeriodType>("current-month");

  // Separate period for cash flow chart
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("current-month");

  // Accumulated balance period
  const [accumulatedPeriod, setAccumulatedPeriod] = useState<AccumulatedPeriodType>("6months");
  
  // Transaction and category filters
  const [recentTxFilter, setRecentTxFilter] = useState<TransactionFilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<TransactionFilterType>("all");
  
  const [loading, setLoading] = useState(true);
  
  // New transaction modal
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  
  // Data states
  const [periodBalance, setPeriodBalance] = useState<number>(0);
  const [currentSummary, setCurrentSummary] = useState<FinancialData | null>(null);
  const [previousSummary, setPreviousSummary] = useState<FinancialData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [overdueTransactions, setOverdueTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpendingItem[]>([]);
  
  // Spending pace data
  const [spendingPaceData, setSpendingPaceData] = useState<SimpleTimeSeriesPoint[]>([]);
  const [spendingTotal, setSpendingTotal] = useState(0);
  
  // Patrimonio data
  const [patrimonioData, setPatrimonioData] = useState<SimpleTimeSeriesPoint[]>([]);
  const [currentPatrimonio, setCurrentPatrimonio] = useState(0);
  const [patrimonioChange, setPatrimonioChange] = useState(0);

  // Accumulated balance data
  const [accumulatedBalanceData, setAccumulatedBalanceData] = useState<SimpleTimeSeriesPoint[]>([]);
  
  // Fetch cards
  const fetchCards = async () => {
    try {
      const response = await cardService.getAll({ pageSize: 50 });
      if (response.data) {
        setCards(response.data.cards);
        // Auto-select first card if none selected
        if (response.data.cards.length > 0 && !selectedCardId) {
          setSelectedCardId(response.data.cards[0].id);
        }
        setCardsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

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
      case "current-month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = subMonths(startOfMonth(now), 11);
        break;
      case "6months":
        startDate = subMonths(startOfMonth(now), 5);
        break;
      case "3months":
        startDate = subMonths(startOfMonth(now), 2);
        break;
      default:
        startDate = subMonths(startOfMonth(now), 2);
        break;
    }
    
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endOfMonth(now), "yyyy-MM-dd"),
      startDate,
      endDate: endOfMonth(now),
    };
  };

  // Fetch balance for the selected period (income - expenses for that period)
  const fetchPeriodBalance = async () => {
    if (!selectedCardId) return;
    try {
      const { start, end } = getMainDateRange();
      const response = await transactionService.getFinancialSummary(selectedCardId, start, end);
      if (response.data) {
        // Calculate balance as income - expenses for the period
        const periodBalanceCalc = response.data.periodIncome - response.data.periodExpense;
        setPeriodBalance(periodBalanceCalc);
      }
    } catch (error) {
      console.error("Error fetching period balance:", error);
    }
  };

  // Fetch spending pace data (cumulative expenses per day for the selected main period)
  const fetchSpendingPaceData = async () => {
    if (!selectedCardId) return;
    try {
      const { start, end, startDate, endDate } = getMainDateRange();

      const response = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 5000,
        startDate: start,
        endDate: end,
        cardId: selectedCardId || undefined,
      });

      const expensesByDate = new Map<string, number>();
      if (response.data) {
        response.data.transactions.forEach((tx) => {
          if (!isExpenseTx(tx)) return;
          const dateKey = format(parseISO(tx.date), "yyyy-MM-dd");
          expensesByDate.set(dateKey, (expensesByDate.get(dateKey) || 0) + tx.amount);
        });
      }

      const days = eachDayOfInterval({ start: startDate, end: endDate });
      let cumulative = 0;
      const points: SimpleTimeSeriesPoint[] = days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        cumulative += expensesByDate.get(key) || 0;
        return {
          label: format(d, "dd/MM"),
          value: cumulative,
        };
      });

      setSpendingPaceData(points);
      setSpendingTotal(cumulative);
    } catch (error) {
      console.error("Error fetching spending pace data:", error);
    }
  };

  // Fetch patrimonio (cumulative income) data for the selected main period
  const fetchPatrimonioData = async () => {
    if (!selectedCardId) return;
    try {
      const { start, end, startDate, endDate } = getMainDateRange();

      const response = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 5000,
        startDate: start,
        endDate: end,
        cardId: selectedCardId || undefined,
      });
      
      if (response.data) {
        const incomesByDate = new Map<string, number>();
        response.data.transactions.forEach((tx) => {
          if (!isIncomeTx(tx)) return;
          const dateKey = format(parseISO(tx.date), "yyyy-MM-dd");
          incomesByDate.set(dateKey, (incomesByDate.get(dateKey) || 0) + tx.amount);
        });

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        let cumulative = 0;
        const points: SimpleTimeSeriesPoint[] = days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          cumulative += incomesByDate.get(key) || 0;
          return {
            label: format(d, "dd/MM"),
            value: cumulative,
          };
        });

        setPatrimonioData(points);
        setCurrentPatrimonio(cumulative);

        const firstValue = points.length > 0 ? points[0].value : 0;
        const change = firstValue !== 0 ? ((cumulative - firstValue) / Math.abs(firstValue)) * 100 : 0;
        setPatrimonioChange(change);
      }
    } catch (error) {
      console.error("Error fetching patrimonio data:", error);
    }
  };

  // Fetch accumulated balance evolution data (monthly cumulative net = income - expense)
  const fetchAccumulatedBalanceData = async () => {
    if (!selectedCardId) return;
    try {
      const now = new Date();
      const monthsCount = accumulatedPeriod === "3months" ? 3 : accumulatedPeriod === "6months" ? 6 : 12;
      const rangeStart = startOfMonth(subMonths(now, monthsCount - 1));
      const rangeEnd = endOfMonth(now);

      const response = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 5000,
        startDate: format(rangeStart, "yyyy-MM-dd"),
        endDate: format(rangeEnd, "yyyy-MM-dd"),
        cardId: selectedCardId || undefined,
      });

      const monthStarts: Date[] = [];
      for (let i = 0; i < monthsCount; i++) {
        monthStarts.push(startOfMonth(addMonths(rangeStart, i)));
      }

      const netByMonth = new Map<string, number>();
      monthStarts.forEach((m) => netByMonth.set(format(m, "yyyy-MM"), 0));

      if (response.data) {
        response.data.transactions.forEach((tx) => {
          const monthKey = format(parseISO(tx.date), "yyyy-MM");
          if (!netByMonth.has(monthKey)) return;
          const current = netByMonth.get(monthKey) || 0;
          const next = isIncomeTx(tx) ? current + tx.amount : isExpenseTx(tx) ? current - tx.amount : current;
          netByMonth.set(monthKey, next);
        });
      }

      let running = 0;
      const points: SimpleTimeSeriesPoint[] = monthStarts.map((m) => {
        const key = format(m, "yyyy-MM");
        running += netByMonth.get(key) || 0;
        return {
          label: capitalize(format(m, "MMM", { locale: ptBR })),
          value: running,
        };
      });

      setAccumulatedBalanceData(points.length > 0 ? points : [{ label: "-", value: 0 }]);
    } catch (error) {
      console.error("Error fetching accumulated balance data:", error);
    }
  };

  // Fetch summary data based on selected period
  const fetchSummaryData = async () => {
    if (!selectedCardId) return;
    const { start: monthStart, end: monthEnd } = getMainDateRange();
    const { start: previousMonthStart, end: previousMonthEnd } = getPreviousDateRange();

    try {
      // Fetch current period summary
      const currentResponse = await transactionService.getFinancialSummary(selectedCardId, monthStart, monthEnd);
      
      if (currentResponse.data) {
        setCurrentSummary({
          periodIncome: currentResponse.data.periodIncome,
          periodExpense: currentResponse.data.periodExpense,
          balance: currentResponse.data.balance,
        });
      }

      // Fetch previous period for comparison
      const previousResponse = await transactionService.getFinancialSummary(selectedCardId, previousMonthStart, previousMonthEnd);
      
      if (previousResponse.data) {
        setPreviousSummary({
          periodIncome: previousResponse.data.periodIncome,
          periodExpense: previousResponse.data.periodExpense,
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
        cardId: selectedCardId || undefined,
      });

      // Fetch transactions for previous period
      const transactionsForPrevious = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 1000,
        startDate: previousMonthStart,
        endDate: previousMonthEnd,
        cardId: selectedCardId || undefined,
      });

      if (transactionsForPeriod.data && transactionsForPrevious.data && categoriesResponse.data) {
        const currentTransactions = transactionsForPeriod.data.transactions;
        const previousTransactions = transactionsForPrevious.data.transactions;
        
        // Calculate spending by category for current period
        const currentCategoryMap = new Map<string, number>();
        currentTransactions.forEach((tx) => {
          if (isExpenseTx(tx)) {
            const current = currentCategoryMap.get(tx.categoryId) || 0;
            currentCategoryMap.set(tx.categoryId, current + tx.amount);
          }
        });

        // Calculate spending by category for previous period
        const previousCategoryMap = new Map<string, number>();
        previousTransactions.forEach((tx) => {
          if (isExpenseTx(tx)) {
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
        cardId: selectedCardId || undefined,
      });

      if (allTransactionsResponse.data) {
        const transactions = allTransactionsResponse.data.transactions;
        
        // For "current-month", show daily non-cumulative data
        if (selectedPeriod === "current-month") {
          const dailyData = new Map<string, { income: number; expense: number }>();
          
          // Generate all days in the current month
          const days = eachDayOfInterval({ start: dateRanges.startDate, end: dateRanges.endDate });
          days.forEach((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            dailyData.set(dayKey, { income: 0, expense: 0 });
          });
          
          // Add transaction data (non-cumulative - just daily totals)
          transactions.forEach((tx) => {
            const dayKey = format(parseISO(tx.date), "yyyy-MM-dd");
            if (!dailyData.has(dayKey)) return;
            
            const data = dailyData.get(dayKey)!;
            if (isIncomeTx(tx)) {
              data.income += tx.amount;
            } else if (isExpenseTx(tx)) {
              data.expense += tx.amount;
            }
          });

          // Convert to array sorted by date
          const sortedEntries = Array.from(dailyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const chartDataPoints = sortedEntries.map(([key]) => {
            const data = dailyData.get(key)!;
            return {
              label: format(parseISO(key), "dd"),
              income: data.income,
              expense: data.expense,
            };
          });
          
          setChartData(chartDataPoints.length > 0 ? chartDataPoints : [{ label: "-", income: 0, expense: 0 }]);
        } else {
          // For other periods, show monthly data
          const monthlyData = new Map<string, { income: number; expense: number }>();
          
          // Generate all months in the range
          const startDate = parseISO(dateRanges.start);
          const endDate = parseISO(dateRanges.end);
          let currentDate = startOfMonth(startDate);
          
          while (currentDate <= endDate) {
            const monthKey = format(currentDate, "yyyy-MM");
            monthlyData.set(monthKey, { income: 0, expense: 0 });
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
          }
          
          // Now add transaction data
          transactions.forEach((tx) => {
            const date = parseISO(tx.date);
            const monthKey = format(date, "yyyy-MM");
            
            if (!monthlyData.has(monthKey)) {
              monthlyData.set(monthKey, { income: 0, expense: 0 });
            }
            
            const data = monthlyData.get(monthKey)!;
            
            if (isIncomeTx(tx)) {
              data.income += tx.amount;
            } else {
              data.expense += tx.amount;
            }
          });

          // Convert to array sorted by date
          const sortedEntries = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const chartDataPoints = sortedEntries.map(([key]) => {
            const date = parseISO(`${key}-01`);
            const data = monthlyData.get(key)!;
            return {
              label: monthLabels[date.getMonth()],
              income: data.income,
              expense: data.expense,
            };
          });
          
          setChartData(chartDataPoints.length > 0 ? chartDataPoints : [{ label: "-", income: 0, expense: 0 }]);
        }
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Fetch recent transactions (ordered by date, most recent first)
  const fetchRecentTransactions = async () => {
    try {
      const { start, end } = getMainDateRange();
      const transactionsResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 5,
        startDate: start,
        endDate: end,
        cardId: selectedCardId || undefined,
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

  // Fetch overdue transactions (status = Overdue/2)
  const fetchOverdueTransactions = async () => {
    try {
      const overdueResponse = await transactionService.getAll({
        pageNumber: 1,
        pageSize: 10,
        paymentStatus: PaymentStatusEnum.Atrasado, // Overdue = 2
        cardId: selectedCardId || undefined,
      });
      
      if (overdueResponse.data) {
        setOverdueTransactions(overdueResponse.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching overdue transactions:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchCards();
      await Promise.all([
        fetchPeriodBalance(),
        fetchSummaryData(),
        fetchChartData(),
        fetchRecentTransactions(),
        fetchOverdueTransactions(),
        fetchSpendingPaceData(),
        fetchPatrimonioData(),
        fetchAccumulatedBalanceData(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Update all data when card filter changes
  useEffect(() => {
    if (!selectedCardId) return;
    fetchPeriodBalance();
    fetchSummaryData();
    fetchChartData();
    fetchRecentTransactions();
    fetchOverdueTransactions();
    fetchSpendingPaceData();
    fetchPatrimonioData();
    fetchAccumulatedBalanceData();
  }, [selectedCardId]);

  // Update summary, category spending and balance when period changes
  useEffect(() => {
    fetchPeriodBalance();
    fetchSummaryData();
    fetchSpendingPaceData();
    fetchPatrimonioData();
    fetchRecentTransactions();
  }, [mainPeriod]);

  // Update chart when period changes
  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod]);

  // Update accumulated balance when its period changes
  useEffect(() => {
    fetchAccumulatedBalanceData();
  }, [accumulatedPeriod]);

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
    const maxValue = Math.max(...spendingPaceData.map((d) => d.value));
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

  // Filtered recent transactions
  const filteredRecentTransactions = useMemo(() => {
    if (recentTxFilter === "all") return recentTransactions;
    return recentTransactions.filter((tx) => {
      const income = isIncomeTx(tx);
      if (recentTxFilter === "income") return income;
      return !income;
    });
  }, [recentTransactions, recentTxFilter]);

  // Filtered category spending
  const filteredCategorySpending = useMemo(() => {
    // Note: categorySpending is already based on expenses in fetchSummaryData
    // For income filtering, we'd need to recalculate. For now, filter works on existing data.
    return categorySpending;
  }, [categorySpending, categoryFilter]);

  const hideValue = (value: string) => (showValues ? value : "••••••");

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, value: current };
    const percentage = Math.round(((current - previous) / previous) * 100);
    const value = current - previous;
    return { percentage, value };
  };

  const incomeChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.periodIncome, previousSummary.periodIncome)
    : { percentage: 0, value: 0 };

  const expenseChange = currentSummary && previousSummary
    ? calculateChange(currentSummary.periodExpense, previousSummary.periodExpense)
    : { percentage: 0, value: 0 };

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const getPeriodLabel = () => {
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
        {/* Period Selector and Card Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">{getPeriodLabel()}</h2>
            
            {/* Card Filter - Always has a card selected */}
            <Select value={selectedCardId} onValueChange={setSelectedCardId}>
              <SelectTrigger className="w-auto h-9 px-3 bg-card border-border rounded-md text-sm">
                <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Alterar período
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(mainPeriodLabels) as MainPeriodType[]).map((key) => (
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
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={() => setNewTransactionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova transação
            </Button>
          </div>
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
            value={hideValue(formatCurrency(currentSummary?.periodIncome || 0))} 
            change={`${incomeChange.percentage >= 0 ? "+" : ""}${incomeChange.percentage}%`}
            changeValue={`${incomeChange.value >= 0 ? "+" : "-"}${formatCurrency(incomeChange.value)}`}
            trend={incomeChange.percentage >= 0 ? "up" : "down"} 
            icon={TrendingUp}
            showValues={showValues}
          />
          <SummaryCard 
            title="Despesas" 
            value={hideValue(formatCurrency(currentSummary?.periodExpense || 0))} 
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
                {showValues ? formatCurrency(spendingTotal) : "••••••"}
              </p>
              <p className="text-sm text-muted-foreground">Total de gastos no período</p>
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
                  formatter={(value: number) => [showValues ? formatCurrency(value) : "••••••", "Gastos acumulados"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(35 92% 50%)"
                  strokeWidth={2}
                  fill="url(#spendingGradient)"
                  name="Gastos acumulados"
                />
              </AreaChart>
            </ResponsiveContainer>
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
                <SelectItem value="current-month">Mês atual</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>

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

        {/* Overdue Transactions Section - Only show if there are overdue transactions */}
        {overdueTransactions.length > 0 && (
          <div className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-destructive">Transações Atrasadas</h3>
                  <p className="text-sm text-muted-foreground">
                    {overdueTransactions.length === 1 
                      ? "1 transação com pagamento em atraso"
                      : `${overdueTransactions.length} transações com pagamento em atraso`
                    }
                  </p>
                </div>
              </div>
              <Link to="/app/transacoes?status=2" className="text-sm text-destructive hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-2">
              {overdueTransactions.slice(0, 5).map((tx) => {
                const category = categories.find(c => c.id === tx.categoryId);
                const formattedDate = format(parseISO(tx.date), "dd MMM", { locale: ptBR });
                
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!showValues ? 'blur-sm select-none' : ''}`}>{tx.title}</p>
                      <p className={`text-xs text-muted-foreground ${!showValues ? 'blur-sm select-none' : ''}`}>{category?.title || "Sem categoria"} • {formattedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums text-destructive">
                        {showValues ? `-${formatCurrency(tx.amount)}` : "••••••"}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        Atrasado
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Middle Row - Transactions and Category Breakdown 50/50 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium">Transações Recentes</h3>
                <Select value={recentTxFilter} onValueChange={(v) => setRecentTxFilter(v as TransactionFilterType)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Link to="/app/transacoes" className="text-sm text-accent hover:underline">
                Ver todas
              </Link>
            </div>
            {filteredRecentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-2">
                {filteredRecentTransactions.map((tx) => {
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
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium">Principais Categorias</h3>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TransactionFilterType)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

        {/* Accumulated Balance Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-medium">Evolução do Saldo Acumulado</h3>
              <p className="text-sm text-muted-foreground">
                Saldo no período:{" "}
                {showValues ? (
                  <span className={periodBalance >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                    {periodBalance >= 0 ? "+" : "-"}R$ {Math.abs(periodBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                ) : "••••••"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Projeção Final do Ano</p>
                <p className="text-sm font-medium">{showValues ? "R$ 2.245,00" : "••••••"}</p>
              </div>
              <Select value={accumulatedPeriod} onValueChange={(v) => setAccumulatedPeriod(v as AccumulatedPeriodType)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={accumulatedBalanceData}>
              <defs>
                <linearGradient id="accumulatedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280 84% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(280 84% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => {
                  const formattedValue = value < 0 
                    ? `-R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                  return [`Saldo: ${showValues ? formattedValue : "••••••"}`];
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(280 84% 50%)"
                strokeWidth={2}
                fill="url(#accumulatedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Next Month Forecast - Modern compact card */}
        <div className="bg-gradient-to-br from-card to-secondary/50 rounded-2xl border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Previsão Próximo Mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Próximo mês: {capitalize(format(addMonths(new Date(), 1), "MMMM yyyy", { locale: ptBR }))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                Baseado em recorrentes
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold">
                {showValues ? "R$ 1.650" : "••••"}
              </p>
              <p className="text-xs text-muted-foreground">Saldo previsto</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-success">
                {showValues ? "R$ 5.500" : "••••"}
              </p>
              <p className="text-xs text-muted-foreground">Receita prevista</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-destructive">
                {showValues ? "R$ 3.850" : "••••"}
              </p>
              <p className="text-xs text-muted-foreground">Despesa prevista</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-2xl sm:text-3xl font-bold text-accent">+43%</p>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês atual</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Transaction Modal */}
      <NewTransactionModal
        open={newTransactionOpen}
        onOpenChange={setNewTransactionOpen}
        onSuccess={() => {
          setNewTransactionOpen(false);
          // Reload all data
          const fetchAll = async () => {
            setLoading(true);
            await Promise.all([
              fetchPeriodBalance(),
              fetchSummaryData(),
              fetchChartData(),
              fetchRecentTransactions(),
              fetchOverdueTransactions(),
              fetchSpendingPaceData(),
              fetchPatrimonioData(),
            ]);
            setLoading(false);
          };
          fetchAll();
        }}
        categories={categories}
      />
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