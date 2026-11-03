import type { Lang } from "./i18n";

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

export const CATEGORIES: { value: Category; zh: string; en: string; emoji: string }[] = [
  { value: "food", zh: "食品", en: "Food", emoji: "🍎" },
  { value: "medicine", zh: "药品", en: "Medicine", emoji: "💊" },
  { value: "daily", zh: "日化", en: "Personal care", emoji: "🧴" },
  { value: "other", zh: "其他", en: "Other", emoji: "📦" },
];

const CATEGORY_LABELS: Record<Lang, Record<Category, string>> = {
  zh: { food: "食品", medicine: "药品", daily: "日化", other: "其他" },
  en: { food: "Food", medicine: "Medicine", daily: "Personal care", other: "Other" },
};

export function categoryLabel(category: Category, lang: Lang): string {
  return CATEGORY_LABELS[lang][category];
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  food: "🍎",
  medicine: "💊",
  daily: "🧴",
  other: "📦",
};

/** 常用物品快捷选项：按分类与语言预设，添加页点一下即可填入名称。 */
export const PRESET_ITEMS: Record<Lang, Record<Category, string[]>> = {
  zh: {
    food: ["牛奶", "鸡蛋", "酸奶", "面包", "豆浆", "水果", "蔬菜", "剩菜"],
    medicine: ["感冒药", "退烧药", "肠胃药", "维生素", "创可贴", "眼药水"],
    daily: ["洗发水", "沐浴露", "牙膏", "洗面奶", "防晒霜", "洗衣液"],
    other: ["电池", "纸巾", "垃圾袋", "调味料", "干货"],
  },
  en: {
    food: ["Milk", "Eggs", "Yogurt", "Bread", "Soy milk", "Fruit", "Vegetables", "Leftovers"],
    medicine: ["Cold medicine", "Fever reducer", "Stomach medicine", "Vitamins", "Band-aids", "Eye drops"],
    daily: ["Shampoo", "Body wash", "Toothpaste", "Face wash", "Sunscreen", "Laundry detergent"],
    other: ["Batteries", "Tissues", "Trash bags", "Seasoning", "Dried goods"],
  },
};
