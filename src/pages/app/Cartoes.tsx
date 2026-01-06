import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Eye, EyeOff, MoreHorizontal, ArrowUpRight, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, subWeeks } from 'date-fns';

type ContasPeriodType = "1W" | "1M" | "YTD" | "3M" | "1Y" | "ALL";

const cards = [
  {
    id: 1,
    bank: 'Nubank',
    brand: 'Mastercard',
    type: 'credit',
    limit: 12000,
    used: 3450.80,
    available: 8549.20,
    previousAvailable: 7800.00,
    closingDate: 15,
    dueDate: 22,
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 2,
    bank: 'Itaú',
    brand: 'Visa',
    type: 'credit',
    limit: 25000,
    used: 8750.00,
    available: 16250.00,
    previousAvailable: 17500.00,
    closingDate: 10,
    dueDate: 17,
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 3,
    bank: 'Inter',
    brand: 'Mastercard',
    type: 'debit',
    balance: 4523.50,
    previousBalance: 4100.00,
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 4,
    bank: 'C6 Bank',
    brand: 'Mastercard',
    type: 'credit',
    limit: 8000,
    used: 2100.00,
    available: 5900.00,
    previousAvailable: 5500.00,
    closingDate: 5,
    dueDate: 12,
    color: 'from-gray-800 to-gray-900',
  },
  {
    id: 5,
    bank: 'Sodexo',
    brand: 'Visa',
    type: 'vr',
    balance: 850.00,
    previousBalance: 1200.00,
    color: 'from-green-500 to-green-700',
  },
];

const recentCardTransactions = [
  { id: 1, card: 'Nubank', name: 'iFood', amount: -45.90, date: '24 Dez', status: 'paid' },
  { id: 2, card: 'Nubank', name: 'Amazon', amount: -189.90, date: '23 Dez', status: 'paid' },
  { id: 3, card: 'Itaú', name: 'Posto Shell', amount: -250.00, date: '23 Dez', status: 'pending' },
  { id: 4, card: 'Nubank', name: 'Uber', amount: -28.50, date: '22 Dez', status: 'paid' },
];

const pendingTransactions = [
  { id: 1, card: 'Itaú', name: 'Mercado Livre', amount: -320.00, dueDate: '10 Jan', status: 'pending' },
  { id: 2, card: 'Nubank', name: 'Netflix', amount: -55.90, dueDate: '15 Jan', status: 'pending' },
  { id: 3, card: 'C6 Bank', name: 'Spotify', amount: -21.90, dueDate: '12 Jan', status: 'pending' },
];

// Mock data for the Contas chart
const generateContasData = (period: ContasPeriodType) => {
  const now = new Date();
  const data: { label: string; receitas: number; despesas: number }[] = [];
  
  let numPoints = 30;
  switch (period) {
    case "1W": numPoints = 7; break;
    case "1M": numPoints = 30; break;
    case "3M": numPoints = 12; break;
    case "YTD": numPoints = new Date().getMonth() + 1; break;
    case "1Y": numPoints = 12; break;
    case "ALL": numPoints = 24; break;
  }
  
  for (let i = 0; i < numPoints; i++) {
    const label = period === "1W" || period === "1M" 
      ? format(new Date(now.getTime() - (numPoints - 1 - i) * 24 * 60 * 60 * 1000), 'dd/MM')
      : format(new Date(now.getFullYear(), now.getMonth() - (numPoints - 1 - i), 1), 'MMM');
    
    data.push({
      label,
      receitas: Math.floor(Math.random() * 3000) + 2000,
      despesas: Math.floor(Math.random() * 2000) + 1000,
    });
  }
  
  return data;
};

const Cartoes = () => {
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const { showValues, setShowValues } = useValuesVisibility();
  const [contasPeriod, setContasPeriod] = useState<ContasPeriodType>("1M");

  const totalLimit = cards.filter(c => c.type === 'credit').reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalUsed = cards.filter(c => c.type === 'credit').reduce((sum, c) => sum + (c.used || 0), 0);
  const totalAvailable = totalLimit - totalUsed;
  
  // Calculate previous month available for comparison
  const previousTotalAvailable = cards.filter(c => c.type === 'credit').reduce((sum, c) => sum + ((c as any).previousAvailable || 0), 0);
  const availableChange = previousTotalAvailable > 0 
    ? ((totalAvailable - previousTotalAvailable) / previousTotalAvailable) * 100 
    : 0;

  // Payment status ring chart data
  const totalPaid = recentCardTransactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalPending = pendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalPayments = totalPaid + totalPending;
  const paidPercentage = totalPayments > 0 ? (totalPaid / totalPayments) * 100 : 0;
  const pendingPercentage = totalPayments > 0 ? (totalPending / totalPayments) * 100 : 0;

  const paymentStatusData = [
    { name: 'Pago', value: totalPaid, color: 'hsl(var(--accent))', percentage: paidPercentage },
    { name: 'Falta pagar', value: totalPending, color: 'hsl(var(--muted))', percentage: pendingPercentage },
  ];

  // Contas chart data
  const contasData = useMemo(() => generateContasData(contasPeriod), [contasPeriod]);
  const totalReceitas = contasData.reduce((sum, d) => sum + d.receitas, 0);
  const totalDespesas = contasData.reduce((sum, d) => sum + d.despesas, 0);

  const formatCurrency = (value: number) => 
    `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case 'credit': return 'Crédito';
      case 'debit': return 'Débito';
      case 'vr': return 'Vale Refeição';
      default: return type;
    }
  };

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h2">Cartões</h1>
            <p className="text-muted-foreground">Gerencie seus cartões de crédito e débito</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>
        </div>

        {/* Cards Carousel */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Seus Cartões ({cards.length})
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`
                  flex-shrink-0 w-64 h-36 rounded-2xl p-4 cursor-pointer
                  bg-gradient-to-br ${card.color} text-white
                  transition-all duration-300
                  ${selectedCard.id === card.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-105' : 'hover:scale-102'}
                `}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium opacity-90">{card.bank}</p>
                      <p className="text-xs opacity-70">{getCardTypeLabel(card.type)}</p>
                    </div>
                    <span className="text-xs font-medium opacity-80">{card.brand}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {card.type === 'credit' ? (
                      <>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs opacity-60">Disponível</p>
                            <p className="text-sm font-medium">
                              {showValues ? formatCurrency(card.available || 0) : '••••'}
                            </p>
                          </div>
                          <div className="text-right text-xs opacity-70">
                            <p>Fecha {card.closingDate}</p>
                            <p>Vence {card.dueDate}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-xs opacity-60">Saldo</p>
                        <p className="text-sm font-medium">
                          {showValues ? formatCurrency(card.balance || 0) : '••••'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contas Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Contas</h3>
            </div>
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Receitas</span>
              </div>
              <p className="text-2xl font-bold">
                {showValues ? formatCurrency(totalReceitas) : '••••••'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success">+12.5%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Despesas</span>
              </div>
              <p className="text-2xl font-bold">
                {showValues ? formatCurrency(totalDespesas) : '••••••'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-destructive" />
                <span className="text-xs text-muted-foreground">-3.2%</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={contasData}>
              <defs>
                <linearGradient id="receitasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despesasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
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
                tickFormatter={(value) => value >= 1000 ? `R$ ${(value / 1000).toFixed(0)}k` : `R$ ${value}`}
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
                  name === "receitas" ? "Receitas:" : "Despesas:"
                ]}
              />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#receitasGradient)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#despesasGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Period buttons */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {(["1W", "1M", "YTD", "3M", "1Y", "ALL"] as ContasPeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setContasPeriod(period)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  contasPeriod === period
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

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
            <p className="text-sm text-muted-foreground mt-1">
              {((totalUsed / totalLimit) * 100).toFixed(1)}% do limite
            </p>
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
            <div className="flex items-center gap-1 mt-1">
              {availableChange >= 0 ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={cn(
                "text-sm",
                availableChange >= 0 ? "text-success" : "text-destructive"
              )}>
                {availableChange >= 0 ? '+' : ''}{availableChange.toFixed(1)}% vs mês anterior
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status Ring */}
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

        {/* Pending Transactions + Recent Transactions + Card Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Transações Pendentes</h3>
              <span className="text-sm text-muted-foreground">{pendingTransactions.length} pendentes</span>
            </div>
            
            <div className="space-y-3">
              {pendingTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{tx.name}</p>
                    <p className="text-sm text-muted-foreground">{tx.card} • Vence {tx.dueDate}</p>
                  </div>
                  <span className="font-medium tabular-nums text-destructive">
                    {showValues ? formatCurrency(tx.amount) : '••••••'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Card Details */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Detalhes do Cartão</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {pendingTransactions.filter(t => t.card === selectedCard.bank).length} transações pendentes
                </span>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Banco</span>
                <span className="font-medium">{selectedCard.bank}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Bandeira</span>
                <span className="font-medium">{selectedCard.brand}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">{getCardTypeLabel(selectedCard.type)}</span>
              </div>
              {selectedCard.type === 'credit' && (
                <>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Limite</span>
                    <span className="font-medium">
                      {showValues ? formatCurrency(selectedCard.limit || 0) : '••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Fatura Atual</span>
                    <span className="font-medium">
                      {showValues ? formatCurrency(selectedCard.used || 0) : '••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Data de Fechamento</span>
                    <span className="font-medium">Dia {selectedCard.closingDate}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Data de Vencimento</span>
                    <span className="font-medium">Dia {selectedCard.dueDate}</span>
                  </div>
                </>
              )}
              {(selectedCard.type === 'debit' || selectedCard.type === 'vr') && (
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Saldo Atual</span>
                  <span className="font-medium text-success">
                    {showValues ? formatCurrency(selectedCard.balance || 0) : '••••••'}
                  </span>
                </div>
              )}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentCardTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{tx.name}</p>
                  <p className="text-sm text-muted-foreground">{tx.card} • {tx.date}</p>
                </div>
                <span className="font-medium tabular-nums">
                  {showValues ? formatCurrency(tx.amount) : '••••••'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Cartoes;