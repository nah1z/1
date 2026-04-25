import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { EntryType, Transaction } from "@/types/db";
import { monthRange } from "@/lib/month";

export function useTransactions(
  fundId: string | undefined,
  yearMonth: string,
  userId: string | undefined,
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fundId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    let active = true;
    const { start, end } = monthRange(yearMonth);

    const load = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("fund_id", fundId)
        .gte("date", start)
        .lt("date", end)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        console.error("載入交易失敗", error);
        setTransactions([]);
      } else {
        setTransactions((data ?? []) as Transaction[]);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`transactions-${fundId}-${yearMonth}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `fund_id=eq.${fundId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [fundId, yearMonth]);

  const addTransaction = async (input: {
    date: string;
    name: string;
    amount: number;
    type: EntryType;
    note?: string;
  }) => {
    if (!fundId || !userId) throw new Error("尚未選擇基金或未登入");
    const { error } = await supabase.from("transactions").insert({
      fund_id: fundId,
      date: input.date,
      name: input.name,
      amount: input.amount,
      type: input.type,
      note: input.note || null,
      created_by: userId,
    });
    if (error) throw error;
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    transactions,
    totalIncome,
    totalExpense,
    loading,
    addTransaction,
  };
}
