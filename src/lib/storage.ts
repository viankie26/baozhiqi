import type { Item } from "./types";

const KEY = "expiry-tracker-items";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getItems(): Item[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Item[];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function addItem(item: Omit<Item, "id" | "createdAt">): Item {
  const newItem: Item = {
    ...item,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  };
  const items = getItems();
  saveItems([newItem, ...items]);
  return newItem;
}

export function updateItem(id: string, patch: Partial<Item>) {
  const items = getItems().map((it) =>
    it.id === id ? { ...it, ...patch } : it,
  );
  saveItems(items);
}

export function deleteItem(id: string) {
  saveItems(getItems().filter((it) => it.id !== id));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
