import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentYearMonth, shiftYearMonth } from "@/lib/month";

interface Props {
  yearMonth: string;
  onChange: (ym: string) => void;
}

export function MonthSwitcher({ yearMonth, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(shiftYearMonth(yearMonth, -1))}
        aria-label="上一月"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[100px] text-center font-medium">{yearMonth}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(shiftYearMonth(yearMonth, 1))}
        aria-label="下一月"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {yearMonth !== currentYearMonth() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(currentYearMonth())}
        >
          回到本月
        </Button>
      )}
    </div>
  );
}
