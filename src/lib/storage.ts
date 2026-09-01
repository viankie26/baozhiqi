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

const EMPTY: Item[] = [];
let cache: Item[] | null = null;

function read(): Item[] {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed as Item[];
  } catch {
    return EMPTY;
  }
}

/** Returns a stable (cached) reference so useSyncExternalStore can compare snapshots. */
export function getItems(): Item[] {
  if (cache === null) cache = read();
  return cache;
}

export function saveItems(items: Item[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(items));
  cache = items;
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
