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

/** 常用物品快捷选项：按分类预设，添加页点一下即可填入名称。 */
export const PRESET_ITEMS: Record<Category, string[]> = {
  food: ["牛奶", "鸡蛋", "酸奶", "面包", "豆浆", "水果", "蔬菜", "剩菜"],
  medicine: ["感冒药", "退烧药", "肠胃药", "维生素", "创可贴", "眼药水"],
  daily: ["洗发水", "沐浴露", "牙膏", "洗面奶", "防晒霜", "洗衣液"],
  other: ["电池", "纸巾", "垃圾袋", "调味料", "干货"],
};
