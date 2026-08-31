export type Category = "food" | "medicine" | "daily" | "other";

export interface Item {
  id: string;
  name: string;
  category: Category;
  expiryDate: string; // YYYY-MM-DD
  createdAt: number;
  note?: string;
  usedUp?: boolean;
}

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "food", label: "食品", emoji: "🍎" },
  { value: "medicine", label: "药品", emoji: "💊" },
  { value: "daily", label: "日化", emoji: "🧴" },
  { value: "other", label: "其他", emoji: "📦" },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  food: "食品",
  medicine: "药品",
  daily: "日化",
  other: "其他",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  food: "🍎",
  medicine: "💊",
  daily: "🧴",
  other: "📦",
};
