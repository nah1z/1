import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFunds } from "@/hooks/useFunds";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { currentYearMonth } from "@/lib/month";
import { FundSwitcher } from "@/components/FundSwitcher";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { SummaryCards } from "@/components/SummaryCards";
import { AddBudgetDialog } from "@/components/AddBudgetDialog";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionList } from "@/components/TransactionList";

interface Props {
  session: Session;
}

export function Dashboard({ session }: Props) {
  const userId = session.user.id;
  const { funds, loading: fundsLoading, createFund } = useFunds(userId);
  const [selectedFundId, setSelectedFundId] = useState<string | undefined>();
  const [yearMonth, setYearMonth] = useState(currentYearMonth());

  useEffect(() => {
    if (!selectedFundId && funds.length > 0) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);

  const {
    total: budgetTotal,
    addBudget,
  } = useBudgets(selectedFundId, yearMonth, userId);
  const {
    transactions,
    totalIncome,
    totalExpense,
    addTransaction,
  } = useTransactions(selectedFundId, yearMonth, userId);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">情侶共同基金</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => supabase.auth.signOut()}
        >
          登出
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FundSwitcher
          funds={funds}
          selectedFundId={selectedFundId}
          onSelect={setSelectedFundId}
          onCreate={createFund}
        />
        <MonthSwitcher yearMonth={yearMonth} onChange={setYearMonth} />
      </div>

      {fundsLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            載入中…
          </CardContent>
        </Card>
      ) : funds.length === 0 ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm">
              目前還沒有任何基金，請先建立一個共同基金。
            </p>
            <p className="text-xs text-muted-foreground">
              建立後另一位使用者需在 Supabase
              後台手動加入該基金的 member_ids。
            </p>
          </CardContent>
        </Card>
      ) : !selectedFundId ? (
        <Card>
          <CardContent className="p-6 text-sm">請選擇基金</CardContent>
        </Card>
      ) : (
        <>
          <SummaryCards
            budgetTotal={budgetTotal}
            income={totalIncome}
            expense={totalExpense}
          />

          <div className="flex justify-end">
            <AddBudgetDialog yearMonth={yearMonth} onAdd={addBudget} />
          </div>

          <AddTransactionForm onAdd={addTransaction} />

          <TransactionList
            transactions={transactions}
            currentUserId={userId}
          />
        </>
      )}
    </div>
  );
}
