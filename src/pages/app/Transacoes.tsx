import { useState, useEffect, useMemo } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NewTransactionModal } from '@/components/app/NewTransactionModal';
import { EditTransactionModal } from '@/components/app/EditTransactionModal';
import { ViewTransactionModal } from '@/components/app/ViewTransactionModal';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { Calendar } from '@/components/ui/calendar';
import { 
  Transaction, 
  PaymentMethodLabels, 
  TransactionTypeEnum,
  FinancialSummary
} from '@/types/transaction';
import { Category } from '@/types/category';
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

const Transacoes = () => {
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
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMinValue, setFilterMinValue] = useState('');
  const [filterMaxValue, setFilterMaxValue] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();

  // Sort - 3 states: date (default), amount-desc, amount-asc
  const [sortState, setSortState] = useState<SortState>('date');

  const hasActiveFilters = useMemo(() => {
    return filterType !== 'all' || 
           filterCategory !== 'all' || 
           filterPayment !== 'all' || 
           filterStatus !== 'all' ||
           filterMinValue !== '' ||
           filterMaxValue !== '' ||
           filterStartDate !== undefined ||
           filterEndDate !== undefined ||
           searchQuery !== '';
  }, [filterType, filterCategory, filterPayment, filterStatus, filterMinValue, filterMaxValue, filterStartDate, filterEndDate, searchQuery]);

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
      if (filterCategory !== 'all') {
        params.categoryId = filterCategory;
      }
      if (filterPayment !== 'all') {
        params.paymentMethod = parseInt(filterPayment);
      }
      if (filterStatus !== 'all') {
        params.paymentStatus = parseInt(filterStatus);
      }
      if (filterMinValue) params.minValue = parseFloat(filterMinValue);
      if (filterMaxValue) params.maxValue = parseFloat(filterMaxValue);
      if (filterStartDate) params.startDate = format(filterStartDate, 'yyyy-MM-dd');
      if (filterEndDate) params.endDate = format(filterEndDate, 'yyyy-MM-dd');

      const response = await transactionService.getAll(params);
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        setTransactions(response.data.transactions);
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
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterType, filterCategory, filterPayment, filterStatus, filterStartDate, filterEndDate]);

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
    setCurrentPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterPayment('all');
    setFilterStatus('all');
    setFilterMinValue('');
    setFilterMaxValue('');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setSearchQuery('');
    setCurrentPage(1);
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const hasDateFilter = filterStartDate || filterEndDate;
  const hasValueFilter = filterMinValue !== '' || filterMaxValue !== '';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-h2">Transações</h1>
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
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[140px]", hasDateFilter && "border-accent")}>
                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                {hasDateFilter ? (
                  <span className="text-sm">
                    {filterStartDate ? format(filterStartDate, 'dd/MM/yy') : '...'} - {filterEndDate ? format(filterEndDate, 'dd/MM/yy') : '...'}
                  </span>
                ) : (
                  'Período'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Calendar
                    mode="single"
                    selected={filterStartDate}
                    onSelect={setFilterStartDate}
                    className={cn("p-3 pointer-events-auto rounded-md border")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Calendar
                    mode="single"
                    selected={filterEndDate}
                    onSelect={setFilterEndDate}
                    className={cn("p-3 pointer-events-auto rounded-md border")}
                  />
                </div>
                {hasDateFilter && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setFilterStartDate(undefined);
                      setFilterEndDate(undefined);
                    }}
                  >
                    Limpar datas
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Transaction Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-auto min-w-[180px] bg-card border-border h-10">
              <SelectValue placeholder="Todas as transações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as transações</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="w-auto min-w-[180px] bg-card border-border h-10">
              <SelectValue placeholder="Forma de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as formas</SelectItem>
              <SelectItem value="0">Cartão Crédito</SelectItem>
              <SelectItem value="1">Cartão Débito</SelectItem>
              <SelectItem value="2">Pix</SelectItem>
              <SelectItem value="3">TED</SelectItem>
              <SelectItem value="4">Boleto</SelectItem>
              <SelectItem value="5">Dinheiro</SelectItem>
              <SelectItem value="6">Cheque</SelectItem>
              <SelectItem value="7">Crypto Wallet</SelectItem>
              <SelectItem value="8">Voucher</SelectItem>
              <SelectItem value="9">Outro</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-auto min-w-[150px] bg-card border-border h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="0">Pendente</SelectItem>
              <SelectItem value="1">Pago</SelectItem>
              <SelectItem value="2">Atrasado</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-auto min-w-[150px] bg-card border-border h-10">
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value Filter - Styled like Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className={cn("bg-card border-border h-10 min-w-[100px]", hasValueFilter && "border-accent")}>
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
                    onChange={(e) => setFilterMinValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor máximo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 10.000,00"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
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

            {/* Summary Stats */}
            <div className="flex items-center gap-6 ml-auto text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-destructive" />
                <span className={`font-medium ${showValues ? 'text-destructive' : ''}`}>
                  {showValues ? formatCurrency(summary?.totalExpense || 0) : '••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-success" />
                <span className={`font-medium ${showValues ? 'text-success' : ''}`}>
                  {showValues ? formatCurrency(summary?.totalIncome || 0) : '••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-accent" />
                <span className={`font-medium ${showValues ? 'text-accent' : ''}`}>
                  {showValues ? formatCurrency(summary?.balance || 0) : '••••••'}
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
                      <th className="p-4 w-12">
                        <Checkbox 
                          checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Descrição
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(tx)}
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </td>
                          <td className="p-4">
                            <span className={showValues ? '' : 'blur-sm select-none'}>
                              {tx.title}
                            </span>
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
