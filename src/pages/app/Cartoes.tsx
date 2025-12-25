import { useState } from 'react';
import { AppLayout, useValuesVisibility } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Lock, Unlock, Eye, EyeOff, MoreHorizontal, ArrowUpRight } from 'lucide-react';

const cards = [
  {
    id: 1,
    name: 'Nubank',
    lastDigits: '4829',
    brand: 'Mastercard',
    type: 'credit',
    limit: 12000,
    used: 3450.80,
    available: 8549.20,
    closingDate: 15,
    dueDate: 22,
    color: 'from-purple-500 to-purple-700',
    frozen: false,
  },
  {
    id: 2,
    name: 'Itaú Platinum',
    lastDigits: '7192',
    brand: 'Visa',
    type: 'credit',
    limit: 25000,
    used: 8750.00,
    available: 16250.00,
    closingDate: 10,
    dueDate: 17,
    color: 'from-orange-500 to-orange-700',
    frozen: false,
  },
  {
    id: 3,
    name: 'Inter',
    lastDigits: '3344',
    brand: 'Mastercard',
    type: 'debit',
    balance: 4523.50,
    color: 'from-orange-400 to-red-500',
    frozen: false,
  },
  {
    id: 4,
    name: 'C6 Bank',
    lastDigits: '9981',
    brand: 'Mastercard',
    type: 'credit',
    limit: 8000,
    used: 2100.00,
    available: 5900.00,
    closingDate: 5,
    dueDate: 12,
    color: 'from-gray-800 to-gray-900',
    frozen: true,
  },
];

const recentCardTransactions = [
  { id: 1, card: 'Nubank', name: 'iFood', amount: -45.90, date: '24 Dez' },
  { id: 2, card: 'Nubank', name: 'Amazon', amount: -189.90, date: '23 Dez' },
  { id: 3, card: 'Itaú', name: 'Posto Shell', amount: -250.00, date: '23 Dez' },
  { id: 4, card: 'Nubank', name: 'Uber', amount: -28.50, date: '22 Dez' },
];

const Cartoes = () => {
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const { showValues, setShowValues } = useValuesVisibility();

  const totalLimit = cards.filter(c => c.type === 'credit').reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalUsed = cards.filter(c => c.type === 'credit').reduce((sum, c) => sum + (c.used || 0), 0);

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

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Limite Total</span>
            </div>
            <p className="text-2xl font-semibold">
              {showValues ? `R$ ${totalLimit.toLocaleString('pt-BR')}` : '••••••'}
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Utilizado</span>
            </div>
            <p className="text-2xl font-semibold">
              {showValues ? `R$ ${totalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {((totalUsed / totalLimit) * 100).toFixed(1)}% do limite
            </p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <CreditCard className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Disponível</span>
            </div>
            <p className="text-2xl font-semibold text-success">
              {showValues ? `R$ ${(totalLimit - totalUsed).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
            </p>
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
                  flex-shrink-0 w-72 h-44 rounded-2xl p-5 cursor-pointer
                  bg-gradient-to-br ${card.color} text-white
                  transition-all duration-300
                  ${selectedCard.id === card.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-105' : 'hover:scale-102'}
                  ${card.frozen ? 'opacity-60 grayscale' : ''}
                `}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">{card.name}</p>
                      <p className="text-xs opacity-60">{card.type === 'credit' ? 'Crédito' : 'Débito'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.frozen && <Lock className="w-4 h-4" />}
                      <span className="text-xs font-medium">{card.brand}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-lg tracking-widest">•••• •••• •••• {card.lastDigits}</p>
                    {card.type === 'credit' ? (
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-60">Disponível</p>
                          <p className="text-sm font-medium">
                            {showValues ? `R$ ${card.available?.toLocaleString('pt-BR')}` : '••••'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-60">Fecha dia {card.closingDate}</p>
                          <p className="text-xs opacity-60">Vence dia {card.dueDate}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs opacity-60">Saldo</p>
                        <p className="text-sm font-medium">
                          {showValues ? `R$ ${card.balance?.toLocaleString('pt-BR')}` : '••••'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Card Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Info */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Detalhes do Cartão</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  {selectedCard.frozen ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {selectedCard.frozen ? 'Desbloquear' : 'Bloquear'}
                </Button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{selectedCard.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Bandeira</span>
                <span className="font-medium">{selectedCard.brand}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">{selectedCard.type === 'credit' ? 'Crédito' : 'Débito'}</span>
              </div>
              {selectedCard.type === 'credit' && (
                <>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Limite</span>
                    <span className="font-medium">
                      {showValues ? `R$ ${selectedCard.limit?.toLocaleString('pt-BR')}` : '••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Fatura Atual</span>
                    <span className="font-medium">
                      {showValues ? `R$ ${selectedCard.used?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Melhor Dia de Compra</span>
                    <span className="font-medium text-accent">Dia {selectedCard.closingDate! + 1}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Últimas Transações</h3>
              <a href="/app/transacoes" className="text-sm text-accent hover:underline">
                Ver todas
              </a>
            </div>
            
            <div className="space-y-3">
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
                    R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Cartoes;