import { useEffect, useSyncExternalStore } from "react";
import {
  getItems,
  subscribe,
  addItem as addStored,
  updateItem as updateStored,
  deleteItem as deleteStored,
  loadItems,
} from "./storage";
import { haptic } from "./native";
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

export const addItem: typeof addStored = (...args) => {
  void haptic("success");
  return addStored(...args);
};
export const updateItem: typeof updateStored = (...args) => {
  void haptic("light");
  return updateStored(...args);
};
export const deleteItem: typeof deleteStored = (...args) => {
  void haptic("warning");
  return deleteStored(...args);
};
export { loadItems };
