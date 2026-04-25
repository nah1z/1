import { Card, CardContent } from "@/components/ui/card";

interface Props {
  budgetTotal: number;
  income: number;
  expense: number;
}

const fmt = (n: number) =>
  n.toLocaleString("zh-Hant-TW", { maximumFractionDigits: 2 });

export function SummaryCards({ budgetTotal, income, expense }: Props) {
  const remaining = budgetTotal + income - expense;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">本月預算</div>
          <div className="text-xl font-semibold">${fmt(budgetTotal)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">本月收入</div>
          <div className="text-xl font-semibold text-green-600">
            ${fmt(income)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">本月支出</div>
          <div className="text-xl font-semibold text-red-600">
            ${fmt(expense)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">結餘</div>
          <div
            className={`text-xl font-bold ${
              remaining < 0 ? "text-red-600" : ""
            }`}
          >
            ${fmt(remaining)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
