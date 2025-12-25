import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Bell, BellOff, Calendar, MoreHorizontal, Check, Eye, EyeOff } from 'lucide-react';

const reminders = [
  { 
    id: 1, 
    name: 'Aluguel', 
    amount: 2500.00, 
    dueDate: '05 Jan 2025', 
    daysUntil: 12,
    category: 'Moradia',
    recurring: true,
    icon: '🏠',
    status: 'pending'
  },
  { 
    id: 2, 
    name: 'Cartão Nubank', 
    amount: 1850.00, 
    dueDate: '10 Jan 2025', 
    daysUntil: 17,
    category: 'Cartão',
    recurring: true,
    icon: '💳',
    status: 'pending'
  },
  { 
    id: 3, 
    name: 'Internet', 
    amount: 129.90, 
    dueDate: '10 Jan 2025', 
    daysUntil: 17,
    category: 'Serviços',
    recurring: true,
    icon: '🌐',
    status: 'pending'
  },
  { 
    id: 4, 
    name: 'Energia', 
    amount: 245.00, 
    dueDate: '15 Jan 2025', 
    daysUntil: 22,
    category: 'Serviços',
    recurring: true,
    icon: '⚡',
    status: 'pending'
  },
  { 
    id: 5, 
    name: 'Academia', 
    amount: 99.90, 
    dueDate: '05 Jan 2025', 
    daysUntil: 12,
    category: 'Saúde',
    recurring: true,
    icon: '🏋️',
    status: 'pending'
  },
  { 
    id: 6, 
    name: 'IPTU (Parcela 1/12)', 
    amount: 450.00, 
    dueDate: '20 Jan 2025', 
    daysUntil: 27,
    category: 'Impostos',
    recurring: false,
    icon: '📋',
    status: 'pending'
  },
];

const paidReminders = [
  { 
    id: 7, 
    name: 'Netflix', 
    amount: 55.90, 
    dueDate: '22 Dez 2024', 
    category: 'Entretenimento',
    icon: '🎬',
    status: 'paid',
    paidDate: '20 Dez 2024'
  },
  { 
    id: 8, 
    name: 'Spotify', 
    amount: 21.90, 
    dueDate: '20 Dez 2024', 
    category: 'Entretenimento',
    icon: '🎵',
    status: 'paid',
    paidDate: '20 Dez 2024'
  },
];

const Lembretes = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const { showValues, setShowValues } = useValuesVisibility();

  const totalPending = reminders.reduce((sum, r) => sum + r.amount, 0);
  const upcomingThisWeek = reminders.filter(r => r.daysUntil <= 7);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h2">Lembretes</h1>
            <p className="text-muted-foreground">Gerencie suas contas e lembretes de pagamento</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lembrete
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Bell className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Total Pendente</span>
            </div>
            <p className="text-2xl font-semibold">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm text-muted-foreground">Vence Esta Semana</span>
            </div>
            <p className="text-2xl font-semibold">{upcomingThisWeek.length} contas</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Pagas Este Mês</span>
            </div>
            <p className="text-2xl font-semibold">{paidReminders.length} contas</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'paid' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Pagas
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {/* Pending */}
          {(filter === 'all' || filter === 'pending') && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Pendentes ({reminders.length})
              </h3>
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id}
                  className="bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                        {reminder.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{reminder.name}</h4>
                          {reminder.recurring && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{reminder.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          R$ {reminder.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm ${reminder.daysUntil <= 7 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                          Vence em {reminder.daysUntil} dias
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Marcar Pago
                        </Button>
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paid */}
          {(filter === 'all' || filter === 'paid') && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Pagas Este Mês ({paidReminders.length})
              </h3>
              {paidReminders.map((reminder) => (
                <div 
                  key={reminder.id}
                  className="bg-card rounded-xl border border-border p-4 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-xl relative">
                        {reminder.icon}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{reminder.name}</h4>
                        <p className="text-sm text-muted-foreground">{reminder.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        R$ {reminder.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-success">Pago em {reminder.paidDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Lembretes;