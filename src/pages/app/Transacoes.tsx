import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NewTransactionModal } from '@/components/app/NewTransactionModal';
import { EditTransactionModal } from '@/components/app/EditTransactionModal';
import { ViewTransactionModal } from '@/components/app/ViewTransactionModal';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { cardService } from '@/services/cardService';
import { Calendar } from '@/components/ui/calendar';
import { 
  Transaction, 
  PaymentMethodLabels, 
  TransactionTypeEnum,
  FinancialSummary,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '@/types/transaction';
import { Category } from '@/types/category';
import { Card, CardTypeLabels } from '@/types/card';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Loader2,
  CalendarDays,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type SortState = 'date' | 'amount-desc' | 'amount-asc';

// Payment methods list
const paymentMethods = [
  { value: 0, label: 'Cartão Crédito' },
  { value: 1, label: 'Cartão Débito' },
  { value: 2, label: 'Pix' },
  { value: 3, label: 'TED' },
  { value: 4, label: 'Boleto' },
  { value: 5, label: 'Dinheiro' },
  { value: 6, label: 'Cheque' },
  { value: 7, label: 'Crypto Wallet' },
  { value: 8, label: 'Voucher' },
  { value: 9, label: 'Outro' },
];

// Payment statuses list
const paymentStatuses = [
  { value: 0, label: 'Pendente' },
  { value: 1, label: 'Pago' },
  { value: 2, label: 'Atrasado' },
];

const Transacoes = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { showValues, setShowValues } = useValuesVisibility();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewTransactionOpen, setViewTransactionOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterPayments, setFilterPayments] = useState<number[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<number[]>([]);
  const [filterMinValue, setFilterMinValue] = useState('');
  const [filterMaxValue, setFilterMaxValue] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();
  const [filterCardId, setFilterCardId] = useState<string>('');

  // Sort - 3 states: date (default), amount-desc, amount-asc
  const [sortState, setSortState] = useState<SortState>('date');

  // Initialize filters from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const statusParam = searchParams.get('status');
    const cardIdParam = searchParams.get('cardId');
    
    if (typeParam === 'expense') {
      setFilterType('expense');
    } else if (typeParam === 'income') {
      setFilterType('income');
    }
    
    if (startDateParam) {
      setFilterStartDate(parseISO(startDateParam));
    }
    if (endDateParam) {
      setFilterEndDate(parseISO(endDateParam));
    }
    if (statusParam) {
      setFilterStatuses([parseInt(statusParam, 10)]);
    }
    if (cardIdParam) {
      setFilterCardId(cardIdParam);
    }
  }, [searchParams]);

  const hasActiveFilters = useMemo(() => {
    return filterType !== 'all' || 
           filterCategories.length > 0 || 
           filterPayments.length > 0 || 
           filterStatuses.length > 0 ||
           filterMinValue !== '' ||
           filterMaxValue !== '' ||
           filterStartDate !== undefined ||
           filterEndDate !== undefined ||
           filterCardId !== '' ||
           searchQuery !== '';
  }, [filterType, filterCategories, filterPayments, filterStatuses, filterMinValue, filterMaxValue, filterStartDate, filterEndDate, filterCardId, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ pageSize: 50 });
      if (response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await cardService.getAll({ pageSize: 50 });
      if (response.data) {
        setCards(response.data.cards);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await transactionService.getFinancialSummary();
      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        textSearch: searchQuery || undefined,
      };

      if (filterType !== 'all') {
        params.transactionType = filterType === 'income' ? TransactionTypeEnum.Receita : TransactionTypeEnum.Despesa;
      }
      if (filterCardId) {
        params.cardId = filterCardId;
      }
      // For multi-select, we'll send the first one (backend might need adjustment for multiple)
      if (filterCategories.length === 1) {
        params.categoryId = filterCategories[0];
      }
      if (filterPayments.length === 1) {
        params.paymentMethod = filterPayments[0];
      }
      if (filterStatuses.length === 1) {
        params.paymentStatus = filterStatuses[0];
      }
      if (filterMinValue) params.minValue = parseFloat(filterMinValue);
      if (filterMaxValue) params.maxValue = parseFloat(filterMaxValue);
      if (filterStartDate) params.startDate = format(filterStartDate, 'yyyy-MM-dd');
      if (filterEndDate) params.endDate = format(filterEndDate, 'yyyy-MM-dd');

      const response = await transactionService.getAll(params);
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        let txs = response.data.transactions;
        
        // Client-side filtering for multiple selections
        if (filterCategories.length > 1) {
          txs = txs.filter(tx => filterCategories.includes(tx.categoryId));
        }
        if (filterPayments.length > 1) {
          const paymentLabels = filterPayments.map(p => {
            const method = paymentMethods.find(m => m.value === p);
            return method?.label;
          });
          txs = txs.filter(tx => {
            const txLabel = PaymentMethodLabels[tx.paymentMethod] || tx.paymentMethod;
            return paymentLabels.includes(txLabel);
          });
        }
        if (filterStatuses.length > 1) {
          const statusLabels = filterStatuses.map(s => {
            const status = paymentStatuses.find(st => st.value === s);
            return status?.label;
          });
          txs = txs.filter(tx => {
            const statusMap: Record<string, string> = {
              'Pending': 'Pendente',
              'Paid': 'Pago',
              'Overdue': 'Atrasado',
            };
            const txLabel = statusMap[tx.status] || tx.status;
            return statusLabels.includes(txLabel);
          });
        }
        
        setTransactions(txs);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalTransactions);
      }
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCards();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterType, filterCategories, filterPayments, filterStatuses, filterStartDate, filterEndDate, filterCardId]);

  // Sort transactions locally
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      if (sortState === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortState === 'amount-desc') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });
    return sorted;
  }, [transactions, sortState]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const applyValueFilter = () => {
    // Validate min/max values
    const min = filterMinValue ? parseFloat(filterMinValue) : null;
    const max = filterMaxValue ? parseFloat(filterMaxValue) : null;
    
    if (min !== null && max !== null && min > max) {
      toast.error('Valor mínimo não pode ser maior que o máximo');
      return;
    }
    
    setCurrentPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategories([]);
    setFilterPayments([]);
    setFilterStatuses([]);
    setFilterMinValue('');
    setFilterMaxValue('');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setFilterCardId('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return card?.name || 'Sem cartão';
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    
    setDeleting(true);
    try {
      const response = await transactionService.delete(selectedTransaction.id);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Transação excluída com sucesso');
        fetchTransactions();
        fetchSummary();
      }
    } catch (error) {
      toast.error('Erro ao excluir transação');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleTransactionCreated = () => {
    fetchTransactions();
    fetchSummary();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditTransactionOpen(true);
  };

  const handleView = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setViewTransactionOpen(true);
  };

  const handleEditSuccess = () => {
    fetchTransactions();
    fetchSummary();
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.title || 'Sem categoria';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  const toggleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleSortByValue = () => {
    if (sortState === 'date') {
      setSortState('amount-desc');
    } else if (sortState === 'amount-desc') {
      setSortState('amount-asc');
    } else {
      setSortState('date');
    }
  };

  // Handle date selection with validation
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date && filterEndDate && date > filterEndDate) {
      toast.error('Data inicial não pode ser depois da data final');
      return;
    }
    setFilterStartDate(date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date && filterStartDate && date < filterStartDate) {
      toast.error('Data final não pode ser antes da data inicial');
      return;
    }
    setFilterEndDate(date);
  };

  // Handle min/max value changes with validation
  const handleMinValueChange = (value: string) => {
    setFilterMinValue(value);
  };

  const handleMaxValueChange = (value: string) => {
    setFilterMaxValue(value);
  };

  // Toggle payment method selection
  const togglePaymentMethod = (value: number) => {
    setFilterPayments(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // Toggle all payment methods
  const toggleAllPaymentMethods = () => {
    if (filterPayments.length === paymentMethods.length) {
      setFilterPayments([]);
    } else {
      setFilterPayments([]);
    }
  };

  // Toggle status selection
  const toggleStatus = (value: number) => {
    setFilterStatuses(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // Toggle all statuses
  const toggleAllStatuses = () => {
    if (filterStatuses.length === paymentStatuses.length) {
      setFilterStatuses([]);
    } else {
      setFilterStatuses([]);
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setFilterCategories(prev => 
      prev.includes(categoryId) ? prev.filter(v => v !== categoryId) : [...prev, categoryId]
    );
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (filterCategories.length === categories.length) {
      setFilterCategories([]);
    } else {
      setFilterCategories([]);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const hasDateFilter = filterStartDate || filterEndDate;
  const hasValueFilter = filterMinValue !== '' || filterMaxValue !== '';
  const hasPaymentFilter = filterPayments.length > 0;
  const hasStatusFilter = filterStatuses.length > 0;
  const hasCategoryFilter = filterCategories.length > 0;
  const hasCardFilter = filterCardId !== '';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* New Header with Month Selector */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  const newDate = filterStartDate ? new Date(filterStartDate.getFullYear(), filterStartDate.getMonth() - 1, 1) : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                  setFilterStartDate(newDate);
                  setFilterEndDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0));
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {filterStartDate 
                  ? format(filterStartDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())
                  : format(new Date(), 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())
                }
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  const baseDate = filterStartDate || new Date();
                  const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
                  setFilterStartDate(newDate);
                  setFilterEndDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0));
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFilterStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
                  setFilterEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
                }}
              >
                Hoje
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-10 bg-card border-border"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowValues(!showValues)}
                title={showValues ? "Ocultar valores" : "Mostrar valores"}
              >
                {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </Button>
              <Button variant="accent" size="sm" onClick={() => setNewTransactionOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transações</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Receitas</p>
              <p className="text-2xl font-bold text-success">
                {showValues ? formatCurrency(summary?.periodIncome || 0) : '••••••'}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Despesas</p>
              <p className="text-2xl font-bold text-destructive">
                {showValues ? formatCurrency(summary?.periodExpense || 0) : '••••••'}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saldo</p>
              <p className={cn("text-2xl font-bold", (summary?.balance || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                {showValues ? formatCurrency(summary?.balance || 0) : '••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transaction Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-auto h-9 px-3 bg-card border-border rounded-md text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Method Filter - Multi Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[180px] rounded-md justify-start", hasPaymentFilter && "border-accent")}>
                {hasPaymentFilter ? (
                  <span className="text-sm">
                    {filterPayments.length} forma{filterPayments.length > 1 ? 's' : ''} selecionada{filterPayments.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  'Forma de Pagamento'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <label 
                  className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                >
                  <Checkbox 
                    checked={filterPayments.length === 0}
                    onCheckedChange={toggleAllPaymentMethods}
                  />
                  <span className="text-sm font-semibold">Todas as formas</span>
                </label>
                <div className="border-t border-border pt-2 space-y-1">
                  {paymentMethods.map((method) => (
                    <label 
                      key={method.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                    >
                      <Checkbox 
                        checked={filterPayments.includes(method.value)}
                        onCheckedChange={() => togglePaymentMethod(method.value)}
                      />
                      <span className="text-sm">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter - Multi Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[150px] rounded-md justify-start", hasStatusFilter && "border-accent")}>
                {hasStatusFilter ? (
                  <span className="text-sm">
                    {filterStatuses.length} status selecionado{filterStatuses.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  'Status'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <label 
                  className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                >
                  <Checkbox 
                    checked={filterStatuses.length === 0}
                    onCheckedChange={toggleAllStatuses}
                  />
                  <span className="text-sm font-semibold">Todos os status</span>
                </label>
                <div className="border-t border-border pt-2 space-y-1">
                  {paymentStatuses.map((status) => (
                    <label 
                      key={status.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                    >
                      <Checkbox 
                        checked={filterStatuses.includes(status.value)}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <span className="text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Filter - Multi Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[150px] rounded-md justify-start", hasCategoryFilter && "border-accent")}>
                {hasCategoryFilter ? (
                  <span className="text-sm">
                    {filterCategories.length} categoria{filterCategories.length > 1 ? 's' : ''} selecionada{filterCategories.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  'Categorias'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto" align="start">
              <div className="space-y-3">
                <label 
                  className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                >
                  <Checkbox 
                    checked={filterCategories.length === 0}
                    onCheckedChange={toggleAllCategories}
                  />
                  <span className="text-sm font-semibold">Todas as categorias</span>
                </label>
                <div className="border-t border-border pt-2 space-y-1">
                  {categories.map((cat) => (
                    <label 
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-md"
                    >
                      <Checkbox 
                        checked={filterCategories.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm">{cat.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Card Filter */}
          <Select 
            value={filterCardId || "all"} 
            onValueChange={(value) => setFilterCardId(value === "all" ? "" : value)}
          >
            <SelectTrigger className={cn("w-auto min-w-[150px] bg-card border-border h-10 rounded-md justify-center", hasCardFilter && "border-accent")}>
              <SelectValue placeholder="Todos os cartões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"><span className="font-semibold">Todos os cartões</span></SelectItem>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} ({CardTypeLabels[card.type] || card.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value Filter - Styled like Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[100px] rounded-md", hasValueFilter && "border-accent")}>
                Valor
                {hasValueFilter && (
                  <span className="ml-2 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                    Filtrado
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Valor mínimo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={filterMinValue}
                    onChange={(e) => handleMinValueChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor máximo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 10.000,00"
                    value={filterMaxValue}
                    onChange={(e) => handleMaxValueChange(e.target.value)}
                  />
                </div>
                <Button size="sm" className="w-full" onClick={applyValueFilter}>
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar filtros
          </button>
        )}

        {/* Search and Summary */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-10 bg-background border-accent/50 focus:border-accent"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Summary Stats - Reordered: Total, Income, Expense, Balance */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 ml-auto text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-success" />
                <span className={`font-medium ${showValues ? 'text-success' : ''}`}>
                  {showValues ? formatCurrency(summary?.periodIncome || 0) : '••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-destructive" />
                <span className={`font-medium ${showValues ? 'text-destructive' : ''}`}>
                  {showValues ? formatCurrency(summary?.periodExpense || 0) : '••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-accent" />
                <span className={`font-medium ${showValues ? ((summary?.balance || 0) < 0 ? 'text-destructive' : 'text-accent') : ''}`}>
                  {showValues 
                    ? `${(summary?.balance || 0) < 0 ? '-' : ''}${formatCurrency(summary?.balance || 0)}`
                    : '••••••'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
              <Button variant="accent" onClick={() => setNewTransactionOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira transação
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Cartão
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Forma de Pagamento
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Data
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        <button 
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={handleSortByValue}
                        >
                          Valor
                          {sortState === 'amount-desc' ? (
                            <ArrowDown className="w-3 h-3" />
                          ) : sortState === 'amount-asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider w-12">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((tx) => {
                      const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
                      
                      return (
                        <tr 
                          key={tx.id} 
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <button
                              onClick={() => handleView(tx)}
                              className={`hover:underline text-left ${showValues ? '' : 'blur-sm select-none'}`}
                            >
                              {tx.title}
                            </button>
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {getCardName(tx.cardId)}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-border bg-secondary/50 text-sm">
                              {getCategoryName(tx.categoryId)}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            <span className={showValues ? '' : 'blur-sm select-none'}>
                              {PaymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(tx.date)}
                          </td>
                          <td className="p-4">
                            <span className={`font-medium tabular-nums ${isIncome ? 'text-success' : 'text-destructive'}`}>
                              {showValues 
                                ? formatCurrency(tx.amount)
                                : '••••••'
                              }
                            </span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(tx)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(tx)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(tx)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Mostrando {startItem} a {endItem} de {totalItems} transações
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Transaction Modal */}
      <NewTransactionModal 
        open={newTransactionOpen} 
        onOpenChange={setNewTransactionOpen}
        onSuccess={handleTransactionCreated}
        categories={categories}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={editTransactionOpen}
        onOpenChange={setEditTransactionOpen}
        onSuccess={handleEditSuccess}
        categories={categories}
        transaction={editingTransaction}
      />

      {/* View Transaction Modal */}
      <ViewTransactionModal
        open={viewTransactionOpen}
        onOpenChange={setViewTransactionOpen}
        transaction={viewingTransaction}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "{selectedTransaction?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Transacoes;