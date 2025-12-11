// Types for receipt items and expense splitting
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface Person {
  id: string;
  name: string;
  contribution?: number; // Số tiền đã góp trước (VND)
}

export interface ItemAllocation {
  itemId: string;
  personIds: string[];
}

export interface PersonExpense {
  personId: string;
  personName: string;
  items: ReceiptItem[];
  total: number; // Tổng số tiền phải trả
  contribution?: number; // Số tiền đã góp trước
  remaining?: number; // Số tiền còn thiếu (âm) hoặc còn thừa (dương)
}

export interface ReceiptAnalysis {
  items: ReceiptItem[];
  total: number;
  currency?: string;
}

