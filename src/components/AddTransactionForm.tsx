import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntryType } from "@/types/db";

interface Props {
  onAdd: (input: {
    date: string;
    name: string;
    amount: number;
    type: EntryType;
    note?: string;
  }) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export function AddTransactionForm({ onAdd }: Props) {
  const [form, setForm] = useState<{
    date: string;
    name: string;
    amount: string;
    type: EntryType;
  }>({ date: today(), name: "", amount: "", type: "expense" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.date || !form.name || !form.amount) {
      setError("請填寫日期、項目與金額");
      return;
    }
    const value = parseFloat(form.amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("請輸入正確的金額");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({
        date: form.date,
        name: form.name.trim(),
        amount: value,
        type: form.type,
      });
      setForm({ date: today(), name: "", amount: "", type: form.type });
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Select
            value={form.type}
            onValueChange={(value) =>
              setForm({ ...form, type: value as EntryType })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">支出</SelectItem>
              <SelectItem value="income">收入</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="項目名稱"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="金額"
          type="number"
          inputMode="decimal"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? "新增中…" : "新增紀錄"}
        </Button>
      </CardContent>
    </Card>
  );
}
