import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/types/db";

interface Props {
  transactions: Transaction[];
  currentUserId: string | undefined;
}

const fmt = (n: number) =>
  n.toLocaleString("zh-Hant-TW", { maximumFractionDigits: 2 });

export function TransactionList({ transactions, currentUserId }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">本月紀錄</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚無紀錄</p>
        ) : (
          <ul className="space-y-1">
            {transactions.map((t) => {
              const mine = t.created_by === currentUserId;
              const isIncome = t.type === "income";
              return (
                <li
                  key={t.id}
                  className="flex justify-between border-b py-1 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t.date}</span>
                    <span>{t.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        mine
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {mine ? "我" : "對方"}
                    </span>
                  </span>
                  <span
                    className={isIncome ? "text-green-600" : "text-red-600"}
                  >
                    {isIncome ? "+" : "-"}${fmt(Number(t.amount))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
