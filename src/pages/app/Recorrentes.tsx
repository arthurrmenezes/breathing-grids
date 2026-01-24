import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Repeat, Calendar, TrendingUp, MoreHorizontal, Eye, EyeOff, Pencil, Trash2, X } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

type RecurrenceType = 'expense' | 'income';

interface Recurrence {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextDate: string;
  category: string;
  icon: string;
  totalSpent?: number;
  totalReceived?: number;
  status: 'paid' | 'pending';
  lastPayment?: string;
  createdAt: string;
  linkedTransactions: number;
}

const recurringExpenses: Recurrence[] = [
  { 
    id: 1, 
    name: 'Netflix', 
    amount: 55.90, 
    frequency: 'Mensal',
    nextDate: '22 Jan 2025',
    category: 'Entretenimento',
    icon: '🎬',
    totalSpent: 670.80,
    status: 'paid',
    lastPayment: '22 Dez 2024',
    createdAt: '22 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 2, 
    name: 'Spotify', 
    amount: 21.90, 
    frequency: 'Mensal',
    nextDate: '20 Jan 2025',
    category: 'Entretenimento',
    icon: '🎵',
    totalSpent: 262.80,
    status: 'pending',
    lastPayment: '20 Dez 2024',
    createdAt: '20 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 3, 
    name: 'Amazon Prime', 
    amount: 14.90, 
    frequency: 'Mensal',
    nextDate: '15 Jan 2025',
    category: 'Entretenimento',
    icon: '📦',
    totalSpent: 178.80,
    status: 'paid',
    lastPayment: '15 Dez 2024',
    createdAt: '15 Jul 2024',
    linkedTransactions: 6
  },
  { 
    id: 4, 
    name: 'Aluguel', 
    amount: 2500.00, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Moradia',
    icon: '🏠',
    totalSpent: 30000.00,
    status: 'pending',
    lastPayment: '05 Dez 2024',
    createdAt: '05 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 5, 
    name: 'Academia Smart Fit', 
    amount: 99.90, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Saúde',
    icon: '🏋️',
    totalSpent: 1198.80,
    status: 'paid',
    lastPayment: '05 Dez 2024',
    createdAt: '05 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 6, 
    name: 'iCloud Storage', 
    amount: 3.50, 
    frequency: 'Mensal',
    nextDate: '01 Jan 2025',
    category: 'Serviços',
    icon: '☁️',
    totalSpent: 42.00,
    status: 'paid',
    lastPayment: '01 Dez 2024',
    createdAt: '01 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 7, 
    name: 'YouTube Premium', 
    amount: 24.90, 
    frequency: 'Mensal',
    nextDate: '28 Jan 2025',
    category: 'Entretenimento',
    icon: '📺',
    totalSpent: 298.80,
    status: 'pending',
    lastPayment: '28 Dez 2024',
    createdAt: '28 Jan 2024',
    linkedTransactions: 12
  },
];

const recurringIncome: Recurrence[] = [
  { 
    id: 101, 
    name: 'Salário', 
    amount: 8450.00, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Trabalho',
    icon: '💰',
    totalReceived: 101400.00,
    status: 'pending',
    lastPayment: '05 Dez 2024',
    createdAt: '05 Jan 2024',
    linkedTransactions: 12
  },
  { 
    id: 102, 
    name: 'Freelance Design', 
    amount: 2000.00, 
    frequency: 'Mensal',
    nextDate: '15 Jan 2025',
    category: 'Freelance',
    icon: '💼',
    totalReceived: 12000.00,
    status: 'paid',
    lastPayment: '15 Dez 2024',
    createdAt: '15 Jul 2024',
    linkedTransactions: 6
  },
];

const Recorrentes = () => {
  const { showValues, setShowValues } = useValuesVisibility();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState<Recurrence | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RecurrenceType>('expense');

  const totalMonthlyExpenses = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);
  const totalMonthlyIncome = recurringIncome.reduce((sum, r) => sum + r.amount, 0);

  // Payment status data for expenses
  const expensesPaid = recurringExpenses.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const expensesPending = recurringExpenses.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const expensesTotal = expensesPaid + expensesPending;
  const expensesPaidPercentage = expensesTotal > 0 ? (expensesPaid / expensesTotal) * 100 : 0;
  const expensesPendingPercentage = expensesTotal > 0 ? (expensesPending / expensesTotal) * 100 : 0;

  // Payment status data for income
  const incomePaid = recurringIncome.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const incomePending = recurringIncome.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const incomeTotal = incomePaid + incomePending;
  const incomePaidPercentage = incomeTotal > 0 ? (incomePaid / incomeTotal) * 100 : 0;
  const incomePendingPercentage = incomeTotal > 0 ? (incomePending / incomeTotal) * 100 : 0;

  const expenseStatusData = [
    { name: 'Pago', value: expensesPaid, color: 'hsl(var(--accent))', percentage: expensesPaidPercentage },
    { name: 'Pendente', value: expensesPending, color: 'hsl(var(--muted))', percentage: expensesPendingPercentage },
  ];

  const incomeStatusData = [
    { name: 'Recebido', value: incomePaid, color: 'hsl(var(--accent))', percentage: incomePaidPercentage },
    { name: 'Pendente', value: incomePending, color: 'hsl(var(--muted))', percentage: incomePendingPercentage },
  ];

  const handleDelete = (item: Recurrence) => {
    setSelectedRecurrence(item);
    setDeleteDialogOpen(true);
  };

  const handleView = (item: Recurrence) => {
    setSelectedRecurrence(item);
    setViewDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Deleting recurrence:', selectedRecurrence?.id);
    setDeleteDialogOpen(false);
    setSelectedRecurrence(null);
  };

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Custom tooltip for ring chart
  const CustomRingTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {showValues ? formatCurrency(data.value) : '••••••'}
          </p>
          <p className="text-sm font-medium text-accent">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Timeline component
  const Timeline = ({ item }: { item: Recurrence }) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    
    return (
      <div className="flex items-center gap-1">
        {months.map((month, index) => (
          <div
            key={month}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              index <= currentMonth 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground"
            )}
            title={month}
          >
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  const renderRecurrenceList = (items: Recurrence[], type: RecurrenceType) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div 
          key={item.id}
          className={cn(
            "bg-card rounded-xl border border-border p-4 transition-colors",
            type === 'expense' ? "hover:border-accent/30" : "hover:border-success/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                type === 'expense' ? "bg-secondary" : "bg-success/10"
              )}>
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{item.name}</h4>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    item.status === 'paid' 
                      ? "bg-success/10 text-success" 
                      : "bg-warning/10 text-warning"
                  )}>
                    {item.status === 'paid' ? (type === 'expense' ? 'Pago' : 'Recebido') : 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.frequency}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={cn(
                  "font-medium tabular-nums",
                  type === 'expense' ? "" : "text-success"
                )}>
                  {showValues 
                    ? `${type === 'expense' ? '-' : '+'} ${formatCurrency(item.amount)}`
                    : '••••••'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Próximo: {item.nextDate}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(item)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStatusChart = (data: typeof expenseStatusData, type: RecurrenceType) => (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold">
            {showValues ? formatCurrency(data[1].value) : 'R$ ••••••'}
          </p>
          <p className="text-sm text-muted-foreground">
            {type === 'expense' ? 'Falta pagar' : 'Falta receber'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data[1].percentage.toFixed(1)}%</p>
        </div>

        <div className="w-24 h-24 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomRingTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>

        <div className="flex-1 text-right">
          <p className="text-2xl font-bold">
            {showValues ? formatCurrency(data[0].value) : 'R$ ••••••'}
          </p>
          <p className="text-sm text-muted-foreground">
            {type === 'expense' ? 'Pago até agora' : 'Recebido até agora'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data[0].percentage.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h2">Recorrentes</h1>
            <p className="text-muted-foreground">Gerencie suas despesas e receitas recorrentes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Summary - Reordered: Saldo, Receita, Despesa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Repeat className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Saldo Recorrente</span>
            </div>
            <p className="text-2xl font-semibold text-success">
              {showValues 
                ? `+ R$ ${(totalMonthlyIncome - totalMonthlyExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••••'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">por mês</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Receita Recorrente</span>
            </div>
            <p className="text-2xl font-semibold">
              {showValues 
                ? `R$ ${totalMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••••'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {recurringIncome.length} fontes de renda
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
              </div>
              <span className="text-sm text-muted-foreground">Despesa Recorrente</span>
            </div>
            <p className="text-2xl font-semibold">
              {showValues 
                ? `R$ ${totalMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••••'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {recurringExpenses.length} assinaturas ativas
            </p>
          </div>
        </div>

        {/* Tabs for Expenses and Income */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RecurrenceType)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="expense" className="gap-2">
                <TrendingUp className="w-4 h-4 rotate-180" />
                Despesas
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Receitas
              </TabsTrigger>
            </TabsList>
            
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Criar nova {activeTab === 'expense' ? 'despesa' : 'receita'}
            </Button>
          </div>

          <TabsContent value="expense" className="space-y-6 mt-6">
            {/* Status Chart for Expenses */}
            {renderStatusChart(expenseStatusData, 'expense')}
            
            {/* Expenses List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
                Despesas Recorrentes ({recurringExpenses.length})
              </h3>
              {renderRecurrenceList(recurringExpenses, 'expense')}
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-6 mt-6">
            {/* Status Chart for Income */}
            {renderStatusChart(incomeStatusData, 'income')}
            
            {/* Income List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Receitas Recorrentes ({recurringIncome.length})
              </h3>
              {renderRecurrenceList(recurringIncome, 'income')}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedRecurrence?.icon}</span>
              {selectedRecurrence?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecurrence && (
            <div className="space-y-6">
              {/* Value */}
              <div className="text-center py-4 bg-secondary/50 rounded-xl">
                <p className="text-3xl font-bold">
                  {showValues ? formatCurrency(selectedRecurrence.amount) : '••••••'}
                </p>
                <p className="text-sm text-muted-foreground">{selectedRecurrence.frequency}</p>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Linha do tempo (2024)</h4>
                <Timeline item={selectedRecurrence} />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total no ano</span>
                  <span className="font-medium">
                    {showValues 
                      ? formatCurrency((selectedRecurrence.totalSpent || selectedRecurrence.totalReceived || 0))
                      : '••••••'
                    }
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Último pagamento</span>
                  <span className="font-medium">{selectedRecurrence.lastPayment}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Próximo esperado</span>
                  <span className="font-medium">{selectedRecurrence.nextDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Transações vinculadas</span>
                  <span className="font-medium">{selectedRecurrence.linkedTransactions}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">{selectedRecurrence.category}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Criado em</span>
                  <span className="font-medium">{selectedRecurrence.createdAt}</span>
                </div>
              </div>

              {/* Remove Pattern Button */}
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleDelete(selectedRecurrence);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover padrão recorrente
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recorrência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta recorrência? Esta ação não pode ser desfeita.
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

export default Recorrentes;