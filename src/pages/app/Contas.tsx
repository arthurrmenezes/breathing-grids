import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  CreditCard, 
  Eye, 
  EyeOff, 
  MoreHorizontal, 
  ArrowUpRight, 
  Loader2,
  Pencil,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cardService } from '@/services/cardService';
import { transactionService } from '@/services/transactionService';
import { Card as CardType, CardTypeLabels, getCardColor } from '@/types/card';
import { Transaction } from '@/types/transaction';
import { NewCardModal } from '@/components/app/NewCardModal';
import { EditCardModal } from '@/components/app/EditCardModal';
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

interface Invoice {
  id: string;
  month: string;
  year: number;
  closeDate: string;
  dueDate: string;
  status: 'open' | 'closed';
  totalAmount: number;
  transactions: Transaction[];
}

const Contas = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const { showValues, setShowValues } = useValuesVisibility();
  
  // Selected invoice for viewing transactions
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Modals
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCard, setDeletingCard] = useState<CardType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Transactions
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  // Invoices (simulated based on transactions)
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Financial summary
  const [financialSummary, setFinancialSummary] = useState<{
    periodIncome: number;
    periodExpense: number;
  } | null>(null);

  // Fetch cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await cardService.getAll({ pageSize: 50 });
      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        const cardsWithColors = response.data.cards.map((card, index) => ({
          ...card,
          color: getCardColor(card.name, index),
        }));
        setCards(cardsWithColors);
        if (cardsWithColors.length > 0 && !selectedCard) {
          setSelectedCard(cardsWithColors[0]);
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for selected card
  const fetchCardTransactions = async () => {
    if (!selectedCard) return;
    
    try {
      const recentResponse = await transactionService.getAll({
        cardId: selectedCard.id,
        pageSize: 10,
      });
      
      if (recentResponse.data) {
        setRecentTransactions(recentResponse.data.transactions);
      }

      const pendingResponse = await transactionService.getAll({
        cardId: selectedCard.id,
        paymentStatus: 0,
        pageSize: 10,
      });

      if (pendingResponse.data) {
        setPendingTransactions(pendingResponse.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching card transactions:', error);
    }
  };

  // Fetch invoices for credit cards
  const fetchInvoices = async () => {
    if (!selectedCard || selectedCard.type !== 'CreditCard') {
      setInvoices([]);
      return;
    }

    try {
      const now = new Date();
      const generatedInvoices: Invoice[] = [];

      // Generate invoices for the last 6 months
      for (let i = 0; i < 6; i++) {
        const invoiceDate = subMonths(now, i);
        const monthStart = startOfMonth(invoiceDate);
        const monthEnd = endOfMonth(invoiceDate);

        const response = await transactionService.getAll({
          cardId: selectedCard.id,
          startDate: format(monthStart, 'yyyy-MM-dd'),
          endDate: format(monthEnd, 'yyyy-MM-dd'),
          pageSize: 100,
        });

        const transactions = response.data?.transactions || [];
        const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

        if (transactions.length > 0) {
          generatedInvoices.push({
            id: `invoice-${selectedCard.id}-${format(invoiceDate, 'yyyy-MM')}`,
            month: format(invoiceDate, 'MMM yyyy', { locale: ptBR }).toUpperCase(),
            year: invoiceDate.getFullYear(),
            closeDate: format(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), selectedCard.creditCard?.closeDay || 1), 'dd/MM/yyyy'),
            dueDate: format(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), selectedCard.creditCard?.dueDay || 10), 'dd/MM/yyyy'),
            status: i === 0 ? 'open' : 'closed',
            totalAmount,
            transactions,
          });
        }
      }

      setInvoices(generatedInvoices);
      // Auto-select the first (current) invoice
      if (generatedInvoices.length > 0) {
        setSelectedInvoice(generatedInvoices[0]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Fetch financial summary for selected card
  const fetchFinancialSummary = async () => {
    if (!selectedCard) return;

    try {
      const response = await cardService.getFinancialSummary(selectedCard.id);
      if (response.data) {
        setFinancialSummary({
          periodIncome: response.data.periodIncome,
          periodExpense: response.data.periodExpense,
        });
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    if (selectedCard) {
      fetchCardTransactions();
      fetchFinancialSummary();
      fetchInvoices();
    }
  }, [selectedCard]);

  // Handle card actions
  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setEditCardOpen(true);
  };

  const handleDeleteCard = (card: CardType) => {
    setDeletingCard(card);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCard = async () => {
    if (!deletingCard) return;

    setIsDeleting(true);
    try {
      const response = await cardService.delete(deletingCard.id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Cartão excluído com sucesso');
        fetchCards();
        if (selectedCard?.id === deletingCard.id) {
          setSelectedCard(null);
        }
      }
    } catch (error) {
      toast.error('Erro ao excluir cartão');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingCard(null);
    }
  };

  // Calculate totals for credit cards
  const totalLimit = useMemo(() => {
    return cards
      .filter(c => c.type === 'CreditCard')
      .reduce((sum, c) => sum + (c.creditCard?.limit || 0), 0);
  }, [cards]);

  const totalUsed = useMemo(() => {
    return financialSummary?.periodExpense || 0;
  }, [financialSummary]);

  const totalAvailable = totalLimit - totalUsed;

  // Payment status data for ring chart
  const paidTransactions = recentTransactions.filter(t => t.status === 'Paid');
  const totalPaid = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = totalPaid + totalPending;
  const paidPercentage = totalPayments > 0 ? (totalPaid / totalPayments) * 100 : 0;
  const pendingPercentage = totalPayments > 0 ? (totalPending / totalPayments) * 100 : 0;

  const paymentStatusData = [
    { name: 'Pago', value: totalPaid, color: 'hsl(var(--accent))', percentage: paidPercentage },
    { name: 'Falta pagar', value: totalPending, color: 'hsl(var(--muted))', percentage: pendingPercentage },
  ];

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getCardTypeLabel = (type: string) => {
    return CardTypeLabels[type] || type;
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-h2">Contas</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="accent" size="sm" onClick={() => setNewCardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>
        </div>

        {/* Cards Carousel */}
        {cards.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mb-4">Adicione seu primeiro cartão para começar a gerenciar seus gastos.</p>
            <Button variant="accent" onClick={() => setNewCardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Seus Cartões ({cards.length})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={cn(
                      "flex-shrink-0 w-64 h-36 rounded-2xl p-4 cursor-pointer",
                      "bg-gradient-to-br text-white",
                      card.color || getCardColor(card.name, index),
                      "transition-all duration-300",
                      selectedCard?.id === card.id 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-105' 
                        : 'hover:scale-102'
                    )}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium opacity-90">{card.name}</p>
                          <p className="text-xs opacity-70">{getCardTypeLabel(card.type)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 rounded hover:bg-white/20 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditCard(card); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCard(card); }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-1">
                        {card.type === 'CreditCard' && card.creditCard ? (
                          <>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs opacity-60">Limite</p>
                                <p className="text-sm font-medium">
                                  {showValues ? formatCurrency(card.creditCard.limit) : '••••'}
                                </p>
                              </div>
                              <div className="text-right text-xs opacity-70">
                                <p>Fecha {card.creditCard.closeDay}</p>
                                <p>Vence {card.creditCard.dueDay}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-xs opacity-60">Cartão de Débito</p>
                            <p className="text-xs opacity-70">Sem limite definido</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Card Content - Everything shown together */}
            {selectedCard && selectedCard.type === 'CreditCard' && (
              <div className="space-y-6">
                {/* Faturas Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faturas Abertas</h3>
                  
                  {invoices.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => setSelectedInvoice(invoice)}
                          className={cn(
                            "flex-shrink-0 w-48 bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all cursor-pointer",
                            selectedInvoice?.id === invoice.id && "ring-2 ring-accent"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{invoice.month}</span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              invoice.status === 'open' 
                                ? 'bg-accent/10 text-accent' 
                                : 'bg-secondary text-muted-foreground'
                            )}>
                              {invoice.status === 'open' ? 'Aberta' : 'Fechada'}
                            </span>
                          </div>
                          <p className="font-bold text-lg mb-2">
                            {showValues ? formatCurrency(invoice.totalAmount) : '••••••'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vencimento: {invoice.dueDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Invoice Transactions */}
                {selectedInvoice && (
                  <div className="bg-card rounded-2xl border border-border">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-medium">Transações - {selectedInvoice.month}</h3>
                      <span className="text-sm text-muted-foreground">
                        {selectedInvoice.transactions.length} transações
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {selectedInvoice.transactions.map((tx) => {
                        const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
                        return (
                          <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                              {isIncome ? "💰" : "💸"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{tx.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                            </div>
                            <span className={cn(
                              "font-medium tabular-nums",
                              isIncome ? "text-success" : "text-destructive"
                            )}>
                              {showValues 
                                ? `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}` 
                                : '••••••'
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <CreditCard className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">Limite Total</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {showValues ? formatCurrency(totalLimit) : '••••••'}
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      </div>
                      <span className="text-sm text-muted-foreground">Utilizado</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {showValues ? formatCurrency(totalUsed) : '••••••'}
                    </p>
                    {totalLimit > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {((totalUsed / totalLimit) * 100).toFixed(1)}% do limite
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-success/10">
                        <CreditCard className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-sm text-muted-foreground">Disponível</span>
                    </div>
                    <p className="text-xl font-semibold text-success">
                      {showValues ? formatCurrency(totalAvailable) : '••••••'}
                    </p>
                  </div>
                </div>

                {/* Payment Status Ring + Pending Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Status */}
                  {totalPayments > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-2xl font-bold">
                            {showValues ? formatCurrency(totalPending) : 'R$ ••••••'}
                          </p>
                          <p className="text-sm text-muted-foreground">Falta pagar</p>
                          <p className="text-xs text-muted-foreground mt-1">{pendingPercentage.toFixed(1)}%</p>
                        </div>

                        <div className="w-24 h-24 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={40}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                              >
                                {paymentStatusData.map((entry, index) => (
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
                            {showValues ? formatCurrency(totalPaid) : 'R$ ••••••'}
                          </p>
                          <p className="text-sm text-muted-foreground">Pago até agora</p>
                          <p className="text-xs text-muted-foreground mt-1">{paidPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Transactions */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium">Transações Pendentes</h3>
                      <span className="text-sm text-muted-foreground">{pendingTransactions.length} pendentes</span>
                    </div>
                    
                    {pendingTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma transação pendente</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingTransactions.slice(0, 5).map((tx) => (
                          <div 
                            key={tx.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                              💸
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{tx.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                            </div>
                            <span className="font-medium tabular-nums text-destructive">
                              {showValues ? `-${formatCurrency(tx.amount)}` : '••••••'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Transactions + Card Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Transactions */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium">Últimas Transações</h3>
                      <Link to={`/app/transacoes?cardId=${selectedCard.id}`} className="text-sm text-accent hover:underline">
                        Ver todas
                      </Link>
                    </div>
                    
                    {recentTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma transação recente</p>
                    ) : (
                      <div className="space-y-2">
                        {recentTransactions.slice(0, 5).map((tx) => {
                          const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
                          return (
                            <div 
                              key={tx.id}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                                {isIncome ? "💰" : "💸"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{tx.title}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                              </div>
                              <span className={cn(
                                "font-medium tabular-nums",
                                isIncome ? "text-success" : "text-destructive"
                              )}>
                                {showValues 
                                  ? `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}` 
                                  : '••••••'
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-medium mb-6">Detalhes do Cartão</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome</span>
                        <span className="font-medium">{selectedCard.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo</span>
                        <span className="font-medium">{getCardTypeLabel(selectedCard.type)}</span>
                      </div>
                      {selectedCard.creditCard && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Limite</span>
                            <span className="font-medium">
                              {showValues ? formatCurrency(selectedCard.creditCard.limit) : '••••••'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dia de Fechamento</span>
                            <span className="font-medium">{selectedCard.creditCard.closeDay}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dia de Vencimento</span>
                            <span className="font-medium">{selectedCard.creditCard.dueDay}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* For debit cards, show transactions directly */}
            {selectedCard && selectedCard.type !== 'CreditCard' && (
              <TransactionsContent 
                selectedCard={selectedCard}
                recentTransactions={recentTransactions}
                pendingTransactions={pendingTransactions}
                financialSummary={financialSummary}
                totalLimit={totalLimit}
                totalUsed={totalUsed}
                totalAvailable={totalAvailable}
                paymentStatusData={paymentStatusData}
                showValues={showValues}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getCardTypeLabel={getCardTypeLabel}
                handleEditCard={handleEditCard}
                handleDeleteCard={handleDeleteCard}
                cards={cards}
                CustomRingTooltip={CustomRingTooltip}
                totalPending={totalPending}
                totalPaid={totalPaid}
                pendingPercentage={pendingPercentage}
                paidPercentage={paidPercentage}
                totalPayments={totalPayments}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <NewCardModal
        open={newCardOpen}
        onOpenChange={setNewCardOpen}
        onSuccess={() => {
          setNewCardOpen(false);
          fetchCards();
        }}
      />

      <EditCardModal
        open={editCardOpen}
        onOpenChange={setEditCardOpen}
        card={editingCard}
        onSuccess={() => {
          setEditCardOpen(false);
          fetchCards();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{deletingCard?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCard}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

// Extracted component for transactions content
interface TransactionsContentProps {
  selectedCard: CardType;
  recentTransactions: Transaction[];
  pendingTransactions: Transaction[];
  financialSummary: { periodIncome: number; periodExpense: number } | null;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  paymentStatusData: any[];
  showValues: boolean;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  getCardTypeLabel: (type: string) => string;
  handleEditCard: (card: CardType) => void;
  handleDeleteCard: (card: CardType) => void;
  cards: CardType[];
  CustomRingTooltip: any;
  totalPending: number;
  totalPaid: number;
  pendingPercentage: number;
  paidPercentage: number;
  totalPayments: number;
}

const TransactionsContent = ({
  selectedCard,
  recentTransactions,
  pendingTransactions,
  financialSummary,
  totalLimit,
  totalUsed,
  totalAvailable,
  paymentStatusData,
  showValues,
  formatCurrency,
  formatDate,
  getCardTypeLabel,
  handleEditCard,
  handleDeleteCard,
  cards,
  CustomRingTooltip,
  totalPending,
  totalPaid,
  pendingPercentage,
  paidPercentage,
  totalPayments,
}: TransactionsContentProps) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards - Credit Cards Only */}
      {cards.some(c => c.type === 'CreditCard') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Limite Total</span>
            </div>
            <p className="text-xl font-semibold">
              {showValues ? formatCurrency(totalLimit) : '••••••'}
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Utilizado</span>
            </div>
            <p className="text-xl font-semibold">
              {showValues ? formatCurrency(totalUsed) : '••••••'}
            </p>
            {totalLimit > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {((totalUsed / totalLimit) * 100).toFixed(1)}% do limite
              </p>
            )}
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <CreditCard className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Disponível</span>
            </div>
            <p className="text-xl font-semibold text-success">
              {showValues ? formatCurrency(totalAvailable) : '••••••'}
            </p>
          </div>
        </div>
      )}

      {/* Payment Status Ring */}
      {totalPayments > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-2xl font-bold">
                {showValues ? formatCurrency(totalPending) : 'R$ ••••••'}
              </p>
              <p className="text-sm text-muted-foreground">Falta pagar</p>
              <p className="text-xs text-muted-foreground mt-1">{pendingPercentage.toFixed(1)}%</p>
            </div>

            <div className="w-24 h-24 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
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
                {showValues ? formatCurrency(totalPaid) : 'R$ ••••••'}
              </p>
              <p className="text-sm text-muted-foreground">Pago até agora</p>
              <p className="text-xs text-muted-foreground mt-1">{paidPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transactions + Card Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Transactions */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Transações Pendentes</h3>
            <span className="text-sm text-muted-foreground">{pendingTransactions.length} pendentes</span>
          </div>
          
          {pendingTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma transação pendente</p>
          ) : (
            <div className="space-y-2">
              {pendingTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                    💸
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                  <span className="font-medium tabular-nums text-destructive">
                    {showValues ? `-${formatCurrency(tx.amount)}` : '••••••'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Card Details */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Detalhes do Cartão</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditCard(selectedCard)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteCard(selectedCard)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{selectedCard.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{getCardTypeLabel(selectedCard.type)}</span>
            </div>
            {selectedCard.type === 'CreditCard' && selectedCard.creditCard && (
              <>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Limite</span>
                  <span className="font-medium">
                    {showValues ? formatCurrency(selectedCard.creditCard.limit) : '••••••'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Data de Fechamento</span>
                  <span className="font-medium">Dia {selectedCard.creditCard.closeDay}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Data de Vencimento</span>
                  <span className="font-medium">Dia {selectedCard.creditCard.dueDay}</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Criado em</span>
              <span className="font-medium">{format(parseISO(selectedCard.createdAt), "dd/MM/yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Últimas Transações</h3>
          <Link to="/app/transacoes" className="text-sm text-accent hover:underline">
            Ver todas
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isIncome = tx.transactionType === 'Income' || tx.transactionType === 'Receita';
              return (
                <div 
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                    {isIncome ? "💰" : "💸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                  <span className={cn(
                    "font-medium tabular-nums",
                    isIncome ? "text-success" : "text-destructive"
                  )}>
                    {showValues 
                      ? `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}` 
                      : '••••••'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contas;
