import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from 'lucide-react';

const transactions = [
  { id: 'TXN-240101', name: 'Transferência Recebida', type: 'Recebido', amount: 980.00, date: '24 Dez 2024, 09:41', status: 'completed', icon: '💰' },
  { id: 'TXN-240102', name: 'Youtube Premium', type: 'Assinatura', amount: -20.00, date: '24 Dez 2024, 09:41', status: 'completed', icon: '📺' },
  { id: 'TXN-240103', name: 'Internet', type: 'Conta', amount: -120.00, date: '23 Dez 2024, 01:56', status: 'completed', icon: '🌐' },
  { id: 'TXN-240104', name: 'Transferência Recebida', type: 'Recebido', amount: 1000.00, date: '23 Dez 2024, 11:36', status: 'completed', icon: '💰' },
  { id: 'TXN-240105', name: 'Starbucks Coffee', type: 'Alimentação', amount: -12.00, date: '22 Dez 2024, 09:41', status: 'completed', icon: '☕' },
  { id: 'TXN-240106', name: 'Salário (Freelance)', type: 'Recebido', amount: 100.00, date: '22 Dez 2024, 10:12', status: 'completed', icon: '💼' },
  { id: 'TXN-240107', name: 'Crypto Investment', type: 'Investimento', amount: 1000.00, date: '21 Dez 2024, 10:12', status: 'completed', icon: '📈' },
  { id: 'TXN-240108', name: 'Amazon Purchase', type: 'Compras', amount: -30.00, date: '21 Dez 2024, 10:12', status: 'completed', icon: '📦' },
  { id: 'TXN-240109', name: 'Spotify Premium', type: 'Assinatura', amount: -40.00, date: '20 Dez 2024, 08:00', status: 'failed', icon: '🎵' },
  { id: 'TXN-240110', name: 'Supermercado Extra', type: 'Alimentação', amount: -342.50, date: '20 Dez 2024, 14:30', status: 'completed', icon: '🛒' },
];

const Transacoes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { showValues, setShowValues } = useValuesVisibility();

  const totalTransactions = 125430;
  const totalIncome = 92000;
  const totalExpenses = 58500;

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-secondary">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Total de Transações</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              R$ {totalTransactions.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-success mt-1">↑ 12,5% vs mês anterior</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <ArrowUpRight className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total de Receitas</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              R$ {totalIncome.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-success mt-1">↑ 15,5% vs mês anterior</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Total de Despesas</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              R$ {totalExpenses.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-destructive mt-1">↑ 8,5% vs mês anterior</p>
          </div>
        </div>

        {/* Filters & Search */}
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
              <Button variant="outline" size="default">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option>Todos os Status</option>
                <option>Completo</option>
                <option>Pendente</option>
                <option>Falhou</option>
              </select>
              <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option>Mais Recente</option>
                <option>Mais Antigo</option>
                <option>Maior Valor</option>
                <option>Menor Valor</option>
              </select>
            </div>
          </div>
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
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm"></th>
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
                          <p className="text-sm text-muted-foreground">{tx.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium tabular-nums ${tx.amount > 0 ? 'text-success' : ''}`}>
                        {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{tx.date}</td>
                    <td className="p-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${tx.status === 'completed' ? 'bg-success/10 text-success' : ''}
                        ${tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                        ${tx.status === 'failed' ? 'bg-destructive/10 text-destructive' : ''}
                      `}>
                        {tx.status === 'completed' && '✓ Completo'}
                        {tx.status === 'pending' && '⏳ Pendente'}
                        {tx.status === 'failed' && '✗ Falhou'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando <strong>10</strong> de <strong>200</strong> transações
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-accent text-accent-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="text-muted-foreground">...</span>
              <Button variant="outline" size="sm">10</Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Transacoes;