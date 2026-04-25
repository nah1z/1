import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Budget } from "@/types/db";

export function useBudgets(
  fundId: string | undefined,
  yearMonth: string,
  userId: string | undefined,
) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fundId) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("fund_id", fundId)
        .eq("year_month", yearMonth)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (error) {
        console.error("載入預算失敗", error);
        setBudgets([]);
      } else {
        setBudgets((data ?? []) as Budget[]);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`budgets-${fundId}-${yearMonth}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budgets",
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

  const addBudget = async (amount: number, note: string) => {
    if (!fundId || !userId) throw new Error("尚未選擇基金或未登入");
    const { error } = await supabase.from("budgets").insert({
      fund_id: fundId,
      year_month: yearMonth,
      amount,
      note: note || null,
      created_by: userId,
    });
    if (error) throw error;
  };

  const total = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

  return { budgets, total, loading, addBudget };
}
