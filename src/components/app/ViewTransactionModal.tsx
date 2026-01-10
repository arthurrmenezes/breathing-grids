import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction, PaymentMethodLabels, PaymentStatusLabels, TransactionInstallmentItem } from "@/types/transaction";
import { Category } from "@/types/category";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  categories: Category[];
}

export const ViewTransactionModal = ({
  open,
  onOpenChange,
  transaction,
  categories,
}: ViewTransactionModalProps) => {
  const [showInstallments, setShowInstallments] = useState(false);

  if (!transaction) return null;

  const category = categories.find((c) => c.id === transaction.categoryId);
  const isIncome = transaction.transactionType === "Income" || transaction.transactionType === "Receita";

  // Check for installment data - supports both single installment and installments array
  const installmentData = transaction.installment || (transaction.installments && transaction.installments[0]);
  const hasInstallments = installmentData && installmentData.totalInstallments > 1;

  const formatCurrency = (value: number) =>
    `R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getInstallmentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="default" className="text-xs">Pago</Badge>;
      case 'Overdue':
        return <Badge variant="destructive" className="text-xs">Atrasado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pt-4 pr-4">
            {/* Title & Amount */}
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <p className="text-lg font-semibold mb-2">{transaction.title}</p>
              <p className={`text-2xl font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
                {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
              </p>
              {hasInstallments && (
                <p className="text-sm text-muted-foreground mt-1">
                  {installmentData.totalInstallments}x de {formatCurrency(transaction.amount / installmentData.totalInstallments)}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <DetailRow label="Tipo" value={isIncome ? "Receita" : "Despesa"} />
              <DetailRow label="Categoria" value={category?.title || "Sem categoria"} />
              <DetailRow label="Data" value={formatDate(transaction.date)} />
              <DetailRow 
                label="Forma de Pagamento" 
                value={PaymentMethodLabels[transaction.paymentMethod] || "Não informado"} 
              />
              <DetailRow 
                label="Status" 
                value={
                  <Badge variant={transaction.status === "Paid" ? "default" : transaction.status === "Overdue" ? "destructive" : "secondary"}>
                    {PaymentStatusLabels[transaction.status] || transaction.status || "Pendente"}
                  </Badge>
                } 
              />
              {transaction.description && (
                <DetailRow label="Descrição" value={transaction.description} />
              )}
              {transaction.destination && (
                <DetailRow label="Destino" value={transaction.destination} />
              )}
            </div>

            {/* Installments Section */}
            {hasInstallments && installmentData.installments && installmentData.installments.length > 0 && (
              <Collapsible open={showInstallments} onOpenChange={setShowInstallments}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between mt-4"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Ver parcelas ({installmentData.totalInstallments}x)</span>
                    </div>
                    {showInstallments ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="bg-secondary/20 rounded-lg p-3 space-y-2">
                    {/* Installment Summary */}
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">Valor total</span>
                      <span className="font-medium">{formatCurrency(installmentData.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">Status geral</span>
                      {getInstallmentStatusBadge(installmentData.status)}
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">Primeiro pagamento</span>
                      <span className="font-medium">{formatShortDate(installmentData.firstPaymentDate)}</span>
                    </div>
                    
                    {/* Individual Installments */}
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Parcelas</p>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {installmentData.installments
                          .sort((a: TransactionInstallmentItem, b: TransactionInstallmentItem) => a.number - b.number)
                          .map((installment: TransactionInstallmentItem) => (
                            <div 
                              key={installment.id} 
                              className="flex items-center justify-between py-2 px-3 bg-background rounded-md border border-border"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {installment.number}/{installmentData.totalInstallments}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {formatCurrency(installment.amount)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Vence: {formatShortDate(installment.dueDate)}
                                  </span>
                                </div>
                              </div>
                              {getInstallmentStatusBadge(installment.status)}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
  </div>
);
