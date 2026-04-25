export type EntryType = "income" | "expense";

export interface Fund {
  id: string;
  name: string;
  member_ids: string[];
  created_at: string;
}

export interface Budget {
  id: string;
  fund_id: string;
  year_month: string; // 'YYYY-MM'
  amount: number;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  fund_id: string;
  date: string; // 'YYYY-MM-DD'
  name: string;
  amount: number;
  type: EntryType;
  note: string | null;
  created_by: string;
  created_at: string;
}
