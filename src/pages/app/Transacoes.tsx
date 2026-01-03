import { useState, useEffect, useMemo } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NewTransactionModal } from '@/components/app/NewTransactionModal';
import { EditTransactionModal } from '@/components/app/EditTransactionModal';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { 
  Transaction, 
  TransactionTypeLabels, 
  PaymentMethodLabels, 
  PaymentStatusLabels,
  TransactionTypeEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  FinancialSummary
} from '@/types/transaction';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { format } from 'date-fns';
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

const Transacoes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { showValues, setShowValues } = useValuesVisibility();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

  // Sort
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hasActiveFilters = useMemo(() => {
    return filterType !== 'all' || 
           filterCategory !== 'all' || 
           filterPayment !== 'all' || 
           filterStatus !== 'all' ||
           filterMinValue !== '' ||
           filterMaxValue !== '' ||
           searchQuery !== '';
  }, [filterType, filterCategory, filterPayment, filterStatus, filterMinValue, filterMaxValue, searchQuery]);

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
  }, [currentPage, filterType, filterCategory, filterPayment, filterStatus]);

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
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
          {/* Transaction Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-auto min-w-[180px] bg-card border-border">
              <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
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
            <SelectTrigger className="w-auto min-w-[180px] bg-card border-border">
              <SelectValue placeholder="Forma de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as formas</SelectItem>
              <SelectItem value="0">Pix</SelectItem>
              <SelectItem value="1">Cartão Crédito</SelectItem>
              <SelectItem value="2">Cartão Débito</SelectItem>
              <SelectItem value="3">Débito Automático</SelectItem>
              <SelectItem value="4">Transferência</SelectItem>
              <SelectItem value="5">Boleto</SelectItem>
              <SelectItem value="6">Dinheiro</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-auto min-w-[150px] bg-card border-border">
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
            <SelectTrigger className="w-auto min-w-[150px] bg-card border-border">
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-card border-border">
                Valor
                {(filterMinValue || filterMaxValue) && (
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
                        Conta
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Data
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        <button 
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                          Valor
                          {sortOrder === 'asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider w-12">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => {
                      const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
                      
                      return (
                        <tr 
                          key={tx.id} 
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={selectedTransactions.includes(tx.id)}
                                onCheckedChange={() => toggleSelectTransaction(tx.id)}
                              />
                              <span className="text-muted-foreground text-sm">{index + 1 + (currentPage - 1) * itemsPerPage}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={showValues ? '' : 'blur-sm select-none'}>
                              {tx.title}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-secondary/50 text-sm">
                              <span className="w-2 h-2 rounded-full bg-accent" />
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
