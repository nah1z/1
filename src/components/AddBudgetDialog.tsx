import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  yearMonth: string;
  onAdd: (amount: number, note: string) => Promise<void>;
}

export function AddBudgetDialog({ yearMonth, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("請輸入正確的金額");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(value, note.trim());
      setAmount("");
      setNote("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">新增預算</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增 {yearMonth} 預算</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="budget-amount">金額</Label>
            <Input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例：10000"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="budget-note">備註（選填）</Label>
            <Input
              id="budget-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：月初加碼"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "新增中…" : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
