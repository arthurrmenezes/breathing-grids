import { useState, useEffect } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewTransactionModal } from '@/components/app/NewTransactionModal';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { 
  Transaction, 
  TransactionTypeLabels, 
  PaymentMethodLabels, 
  PaymentStatusLabels,
  TransactionTypeEnum,
  PaymentMethodEnum,
  PaymentStatusEnum
} from '@/types/transaction';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  X,
  Loader2
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

const paymentMethods = [
  'Todos',
  'Pix',
  'Cartão Crédito',
  'Cartão Débito',
  'Débito Automático',
  'Transferência',
];

const Transacoes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { showValues, setShowValues } = useValuesVisibility();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  
  // Filter states
  const [filterType, setFilterType] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterPayment, setFilterPayment] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMinValue, setFilterMinValue] = useState('');
  const [filterMaxValue, setFilterMaxValue] = useState('');

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

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        textSearch: searchQuery || undefined,
      };

      if (filterType !== 'Todos') {
        params.transactionType = filterType === 'Receita' ? TransactionTypeEnum.Receita : TransactionTypeEnum.Despesa;
      }
      if (filterCategory !== 'Todas') {
        const cat = categories.find(c => c.title === filterCategory);
        if (cat) params.categoryId = cat.id;
      }
      if (filterPayment !== 'Todos') {
        params.paymentMethod = PaymentMethodEnum[filterPayment as keyof typeof PaymentMethodEnum];
      }
      if (filterStatus !== 'Todos') {
        params.paymentStatus = PaymentStatusEnum[filterStatus as keyof typeof PaymentStatusEnum];
      }
      if (filterDateStart) params.startDate = filterDateStart;
      if (filterDateEnd) params.endDate = filterDateEnd;
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
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilterType('Todos');
    setFilterCategory('Todas');
    setFilterPayment('Todos');
    setFilterStatus('Todos');
    setFilterDateStart('');
    setFilterDateEnd('');
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
  };

  const getTypeLabel = (type: string) => TransactionTypeLabels[type] || type;
  const getPaymentLabel = (method: string) => PaymentMethodLabels[method] || method;
  const getStatusLabel = (status: string) => PaymentStatusLabels[status] || status;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.title || 'Sem categoria';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-h2">Transações</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="accent" size="sm" onClick={() => setNewTransactionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="default"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {showFilters ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Receita">Receita</SelectItem>
                      <SelectItem value="Despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Start */}
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                  />
                </div>

                {/* Date End */}
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                  />
                </div>

                {/* Min Value */}
                <div className="space-y-2">
                  <Label>Valor Mínimo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                  />
                </div>

                {/* Max Value */}
                <div className="space-y-2">
                  <Label>Valor Máximo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 10.000,00"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="accent" size="sm" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
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
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nome</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Valor</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Data</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
                      const statusLower = getStatusLabel(tx.status).toLowerCase();
                      
                      return (
                        <tr 
                          key={tx.id} 
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                                {isIncome ? '💰' : '💸'}
                              </div>
                              <div>
                                <p className="font-medium">{tx.title}</p>
                                <p className="text-sm text-muted-foreground">{getCategoryName(tx.categoryId)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-medium tabular-nums ${isIncome ? 'text-success' : ''}`}>
                              {showValues 
                                ? `${isIncome ? '+' : '-'}R$ ${Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : '••••••'
                              }
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
                          <td className="p-4">
                            <span className={`
                              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                              ${statusLower === 'pago' ? 'bg-success/10 text-success' : ''}
                              ${statusLower === 'pendente' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                              ${statusLower === 'atrasado' ? 'bg-destructive/10 text-destructive' : ''}
                            `}>
                              {statusLower === 'pago' && '✓ Pago'}
                              {statusLower === 'pendente' && '⏳ Pendente'}
                              {statusLower === 'atrasado' && '⚠ Atrasado'}
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
                                <DropdownMenuItem>
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
