import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  X
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

const transactions = [
  { id: 'TXN-240101', name: 'Transferência Recebida', type: 'Receita', category: 'Recebido', paymentMethod: 'Pix', amount: 980.00, date: '24 Dez 2024, 09:41', status: 'pago', icon: '💰' },
  { id: 'TXN-240102', name: 'Youtube Premium', type: 'Despesa', category: 'Assinatura', paymentMethod: 'Cartão Crédito', amount: -20.00, date: '24 Dez 2024, 09:41', status: 'pago', icon: '📺' },
  { id: 'TXN-240103', name: 'Internet', type: 'Despesa', category: 'Conta', paymentMethod: 'Débito Automático', amount: -120.00, date: '23 Dez 2024, 01:56', status: 'pago', icon: '🌐' },
  { id: 'TXN-240104', name: 'Transferência Recebida', type: 'Receita', category: 'Recebido', paymentMethod: 'Pix', amount: 1000.00, date: '23 Dez 2024, 11:36', status: 'pago', icon: '💰' },
  { id: 'TXN-240105', name: 'Starbucks Coffee', type: 'Despesa', category: 'Alimentação', paymentMethod: 'Cartão Débito', amount: -12.00, date: '22 Dez 2024, 09:41', status: 'pago', icon: '☕' },
  { id: 'TXN-240106', name: 'Salário (Freelance)', type: 'Receita', category: 'Recebido', paymentMethod: 'Pix', amount: 100.00, date: '22 Dez 2024, 10:12', status: 'pendente', icon: '💼' },
  { id: 'TXN-240107', name: 'Crypto Investment', type: 'Receita', category: 'Investimento', paymentMethod: 'Transferência', amount: 1000.00, date: '21 Dez 2024, 10:12', status: 'pago', icon: '📈' },
  { id: 'TXN-240108', name: 'Amazon Purchase', type: 'Despesa', category: 'Compras', paymentMethod: 'Cartão Crédito', amount: -30.00, date: '21 Dez 2024, 10:12', status: 'pago', icon: '📦' },
  { id: 'TXN-240109', name: 'Spotify Premium', type: 'Despesa', category: 'Assinatura', paymentMethod: 'Cartão Crédito', amount: -40.00, date: '20 Dez 2024, 08:00', status: 'atrasado', icon: '🎵' },
  { id: 'TXN-240110', name: 'Supermercado Extra', type: 'Despesa', category: 'Alimentação', paymentMethod: 'Cartão Débito', amount: -342.50, date: '20 Dez 2024, 14:30', status: 'pago', icon: '🛒' },
  { id: 'TXN-240111', name: 'Freelance Project', type: 'Receita', category: 'Recebido', paymentMethod: 'Pix', amount: 2500.00, date: '19 Dez 2024, 16:20', status: 'pago', icon: '💼' },
  { id: 'TXN-240112', name: 'Restaurante', type: 'Despesa', category: 'Alimentação', paymentMethod: 'Cartão Crédito', amount: -85.00, date: '19 Dez 2024, 20:30', status: 'pago', icon: '🍽️' },
  { id: 'TXN-240113', name: 'Uber', type: 'Despesa', category: 'Transporte', paymentMethod: 'Pix', amount: -28.50, date: '18 Dez 2024, 18:45', status: 'pago', icon: '🚗' },
  { id: 'TXN-240114', name: 'Farmácia', type: 'Despesa', category: 'Saúde', paymentMethod: 'Cartão Débito', amount: -67.90, date: '18 Dez 2024, 10:15', status: 'pago', icon: '💊' },
  { id: 'TXN-240115', name: 'Conta de Luz', type: 'Despesa', category: 'Conta', paymentMethod: 'Débito Automático', amount: -189.00, date: '17 Dez 2024, 08:00', status: 'pago', icon: '⚡' },
  { id: 'TXN-240116', name: 'Netflix', type: 'Despesa', category: 'Assinatura', paymentMethod: 'Cartão Crédito', amount: -55.90, date: '17 Dez 2024, 08:00', status: 'pago', icon: '🎬' },
  { id: 'TXN-240117', name: 'Dividendos', type: 'Receita', category: 'Investimento', paymentMethod: 'Transferência', amount: 350.00, date: '16 Dez 2024, 14:00', status: 'pago', icon: '📊' },
  { id: 'TXN-240118', name: 'Gasolina', type: 'Despesa', category: 'Transporte', paymentMethod: 'Cartão Débito', amount: -150.00, date: '16 Dez 2024, 11:30', status: 'pago', icon: '⛽' },
  { id: 'TXN-240119', name: 'Cinema', type: 'Despesa', category: 'Lazer', paymentMethod: 'Pix', amount: -45.00, date: '15 Dez 2024, 19:00', status: 'pago', icon: '🎬' },
  { id: 'TXN-240120', name: 'Aluguel', type: 'Despesa', category: 'Moradia', paymentMethod: 'Transferência', amount: -2500.00, date: '15 Dez 2024, 08:00', status: 'pago', icon: '🏠' },
];

const categories = [
  'Todas',
  'Alimentação',
  'Transporte',
  'Assinatura',
  'Conta',
  'Compras',
  'Investimento',
  'Lazer',
  'Saúde',
  'Moradia',
  'Recebido',
];

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
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterPayment, setFilterPayment] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMinValue, setFilterMinValue] = useState('');
  const [filterMaxValue, setFilterMaxValue] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalItems = 200;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
  };

  const handleDelete = (id: string) => {
    setSelectedTransaction(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    console.log('Deleting transaction:', selectedTransaction);
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
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
            <Button variant="accent" size="sm">
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
              <Select defaultValue="recent">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recente</SelectItem>
                  <SelectItem value="oldest">Mais Antigo</SelectItem>
                  <SelectItem value="highest">Maior Valor</SelectItem>
                  <SelectItem value="lowest">Menor Valor</SelectItem>
                </SelectContent>
              </Select>
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
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                <Button variant="accent" size="sm">
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
                {transactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                          {tx.icon}
                        </div>
                        <div>
                          <p className="font-medium">{tx.name}</p>
                          <p className="text-sm text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium tabular-nums ${tx.amount > 0 ? 'text-success' : ''}`}>
                        {showValues 
                          ? `${tx.amount > 0 ? '+' : ''}R$ ${Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '••••••'
                        }
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{tx.date}</td>
                    <td className="p-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${tx.status === 'pago' ? 'bg-success/10 text-success' : ''}
                        ${tx.status === 'pendente' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                        ${tx.status === 'atrasado' ? 'bg-destructive/10 text-destructive' : ''}
                      `}>
                        {tx.status === 'pago' && '✓ Pago'}
                        {tx.status === 'pendente' && '⏳ Pendente'}
                        {tx.status === 'atrasado' && '⚠ Atrasado'}
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
                            onClick={() => handleDelete(tx.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalItems}</strong> resultados
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {[1, 2, 3].map((page) => (
                <Button 
                  key={page}
                  variant="outline" 
                  size="sm" 
                  className={currentPage === page ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <span className="text-muted-foreground">...</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Transacoes;
