import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Fund } from "@/types/db";

export function useFunds(userId: string | undefined) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("funds")
        .select("*")
        .order("created_at", { ascending: true });
      if (!active) return;
      if (error) {
        console.error("載入基金失敗", error);
        setFunds([]);
      } else {
        setFunds((data ?? []) as Fund[]);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("funds-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "funds" },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createFund = async (name: string) => {
    if (!userId) throw new Error("尚未登入");
    const { data, error } = await supabase
      .from("funds")
      .insert({ name, member_ids: [userId] })
      .select()
      .single();
    if (error) throw error;
    return data as Fund;
  };

  return { funds, loading, createFund };
}
