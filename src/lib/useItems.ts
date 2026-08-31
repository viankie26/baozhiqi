import { useSyncExternalStore } from "react";
import { getItems, subscribe, addItem, updateItem, deleteItem, saveItems } from "./storage";
import type { Item } from "./types";

const empty: Item[] = [];

export function useItems(): Item[] {
  return useSyncExternalStore(subscribe, getItems, () => empty);
}

export function useItemActions() {
  return { addItem, updateItem, deleteItem, saveItems };
}
