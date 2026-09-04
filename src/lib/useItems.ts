import { useEffect, useSyncExternalStore } from "react";
import {
  getItems,
  subscribe,
  addItem,
  updateItem,
  deleteItem,
  loadItems,
} from "./storage";
import type { Item } from "./types";

const empty: Item[] = [];

export function useItems(): Item[] {
  useEffect(() => {
    void loadItems();
  }, []);
  return useSyncExternalStore(subscribe, getItems, () => empty);
}

export function useItemById(id: string): Item | undefined {
  const items = useItems();
  return items.find((it) => it.id === id);
}

export { addItem, updateItem, deleteItem, loadItems };
