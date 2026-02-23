

## Correções na Pagina de Transações

### Problema 1: Resumo financeiro zerado com "Todos os cartões"

O endpoint da API `/transactions/financial-summary/{cardId}` exige um `cardId` obrigatório, então quando nenhum cartão está selecionado o hook simplesmente não faz a requisição e os valores ficam zerados.

**Solução**: Quando o filtro é "Todos os cartões" (sem `cardId`), buscar o resumo financeiro de cada cartão individualmente e somar os valores (`periodIncome`, `periodExpense`, `balance`).

### Problema 2: Sinal de "-" no saldo negativo

Atualmente o saldo negativo fica vermelho mas não exibe o sinal de menos.

**Solução**: Adicionar `-` antes do valor formatado quando `balance < 0`.

---

### Detalhes Técnicos

**Arquivo: `src/pages/app/Transacoes.tsx`**

1. Substituir o uso direto do `useFinancialSummary` (que depende de um cardId) por uma logica que:
   - Se `filterCardId` estiver definido: usa o `useFinancialSummary` normalmente (comportamento atual)
   - Se `filterCardId` estiver vazio ("Todos os cartões"): faz chamadas paralelas a `transactionService.getFinancialSummary` para cada cartão disponivel, e soma `periodIncome`, `periodExpense` e `balance`

2. Implementar isso com um `useQuery` customizado que agrega os dados de todos os cartões quando nenhum filtro de cartão esta ativo.

3. Na exibição do Saldo (linha ~877-878), alterar para:
   ```
   {showValues ? `${balance < 0 ? '-' : ''}${formatCurrency(balance)}` : '••••••'}
   ```
   O `formatCurrency` já usa `Math.abs`, então basta prefixar o sinal.

**Arquivo: `src/hooks/useFinancialSummary.ts`** (sem alteração necessaria - a logica de agregação ficará em Transacoes.tsx)

