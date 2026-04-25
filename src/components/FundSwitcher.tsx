import { useState, type FormEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Fund } from "@/types/db";

interface Props {
  funds: Fund[];
  selectedFundId: string | undefined;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<Fund>;
}

export function FundSwitcher({
  funds,
  selectedFundId,
  onSelect,
  onCreate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const fund = await onCreate(name.trim());
      onSelect(fund.id);
      setName("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedFundId} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="選擇基金" />
        </SelectTrigger>
        <SelectContent>
          {funds.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            新增基金
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增基金</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fund-name">基金名稱</Label>
              <Input
                id="fund-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：日常、旅遊基金"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "建立中…" : "建立"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
