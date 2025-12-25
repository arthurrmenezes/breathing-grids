import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Repeat, Calendar, TrendingUp, MoreHorizontal, Pause, Play, Eye, EyeOff } from 'lucide-react';

const recurringExpenses = [
  { 
    id: 1, 
    name: 'Netflix', 
    amount: 55.90, 
    frequency: 'Mensal',
    nextDate: '22 Jan 2025',
    category: 'Entretenimento',
    icon: '🎬',
    active: true,
    totalSpent: 670.80
  },
  { 
    id: 2, 
    name: 'Spotify', 
    amount: 21.90, 
    frequency: 'Mensal',
    nextDate: '20 Jan 2025',
    category: 'Entretenimento',
    icon: '🎵',
    active: true,
    totalSpent: 262.80
  },
  { 
    id: 3, 
    name: 'Amazon Prime', 
    amount: 14.90, 
    frequency: 'Mensal',
    nextDate: '15 Jan 2025',
    category: 'Entretenimento',
    icon: '📦',
    active: true,
    totalSpent: 178.80
  },
  { 
    id: 4, 
    name: 'Aluguel', 
    amount: 2500.00, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Moradia',
    icon: '🏠',
    active: true,
    totalSpent: 30000.00
  },
  { 
    id: 5, 
    name: 'Academia Smart Fit', 
    amount: 99.90, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Saúde',
    icon: '🏋️',
    active: true,
    totalSpent: 1198.80
  },
  { 
    id: 6, 
    name: 'iCloud Storage', 
    amount: 3.50, 
    frequency: 'Mensal',
    nextDate: '01 Jan 2025',
    category: 'Serviços',
    icon: '☁️',
    active: false,
    totalSpent: 42.00
  },
  { 
    id: 7, 
    name: 'YouTube Premium', 
    amount: 24.90, 
    frequency: 'Mensal',
    nextDate: '28 Jan 2025',
    category: 'Entretenimento',
    icon: '📺',
    active: true,
    totalSpent: 298.80
  },
];

const recurringIncome = [
  { 
    id: 101, 
    name: 'Salário', 
    amount: 8450.00, 
    frequency: 'Mensal',
    nextDate: '05 Jan 2025',
    category: 'Trabalho',
    icon: '💰',
    active: true,
    totalReceived: 101400.00
  },
  { 
    id: 102, 
    name: 'Freelance Design', 
    amount: 2000.00, 
    frequency: 'Mensal',
    nextDate: '15 Jan 2025',
    category: 'Freelance',
    icon: '💼',
    active: true,
    totalReceived: 12000.00
  },
];

const Recorrentes = () => {
  const { showValues, setShowValues } = useValuesVisibility();

  const totalMonthlyExpenses = recurringExpenses
    .filter(r => r.active)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalMonthlyIncome = recurringIncome
    .filter(r => r.active)
    .reduce((sum, r) => sum + r.amount, 0);

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
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Recorrência
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
              </div>
              <span className="text-sm text-muted-foreground">Despesas Mensais</span>
            </div>
            <p className="text-2xl font-semibold">
              R$ {totalMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {recurringExpenses.filter(r => r.active).length} assinaturas ativas
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Receitas Mensais</span>
            </div>
            <p className="text-2xl font-semibold">
              R$ {totalMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {recurringIncome.filter(r => r.active).length} fontes de renda
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Repeat className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Saldo Recorrente</span>
            </div>
            <p className="text-2xl font-semibold text-success">
              + R$ {(totalMonthlyIncome - totalMonthlyExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">por mês</p>
          </div>
        </div>

        {/* Recurring Income */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Receitas Recorrentes ({recurringIncome.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringIncome.map((item) => (
              <div 
                key={item.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-success/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{item.frequency}</span>
                        <span>•</span>
                        <span>Próximo: {item.nextDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-success tabular-nums">
                      + R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: R$ {item.totalReceived.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Expenses */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
            Despesas Recorrentes ({recurringExpenses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringExpenses.map((item) => (
              <div 
                key={item.id}
                className={`bg-card rounded-xl border border-border p-4 transition-colors ${
                  item.active ? 'hover:border-accent/30' : 'opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      item.active ? 'bg-secondary' : 'bg-secondary/50'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {!item.active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Pausado
                          </span>
                        )}
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
                      <p className="font-medium tabular-nums">
                        - R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Próximo: {item.nextDate}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        {item.active ? (
                          <Pause className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Play className="w-4 h-4 text-accent" />
                        )}
                      </button>
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Recorrentes;