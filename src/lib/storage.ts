import { supabase } from "@/integrations/supabase/client";
import type { Category, Item } from "./types";

const LOCAL_KEY = "expiry-tracker-items";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

const EMPTY: Item[] = [];
let cache: Item[] = EMPTY;
let loaded = false;
let loading: Promise<void> | null = null;

type Row = {
  id: string;
  name: string;
  category: string;
  expiry_date: string;
  note: string | null;
  used_up: boolean;
  created_at: string;
};

function fromRow(r: Row): Item {
  const item: Item = {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    expiryDate: r.expiry_date,
    createdAt: new Date(r.created_at).getTime(),
    usedUp: r.used_up,
  };
  if (r.note) item.note = r.note;
  return item;
}


function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

function setCache(items: Item[]) {
  cache = sortItems(items);
  emit();
}

/** Returns a stable (cached) reference so useSyncExternalStore can compare snapshots. */
export function getItems(): Item[] {
  return cache;
}

export function isLoaded(): boolean {
  return loaded;
}

/** Reads any records left in this browser from the offline version. */
function readLocalLegacy(): Item[] {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Item[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

async function migrateLegacy(userId: string): Promise<boolean> {
  const legacy = readLocalLegacy();
  if (legacy.length === 0) return false;
  const { error } = await supabase.from("items").insert(
    legacy.map((it) => ({
      user_id: userId,
      name: it.name,
      category: it.category,
      expiry_date: it.expiryDate,
      note: it.note ?? null,
      used_up: !!it.usedUp,
    })),
  );
  if (error) return false;
  localStorage.removeItem(LOCAL_KEY);
  return true;
}

async function fetchAll() {
  const { data, error } = await supabase
    .from("items")
    .select("id,name,category,expiry_date,note,used_up,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  setCache(((data ?? []) as Row[]).map(fromRow));
}

/** Loads the signed-in user's records from the cloud (once per session). */
export function loadItems(force = false): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  if (loading && !force) return loading;
  if (loaded && !force) return Promise.resolve();

  loading = (async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setCache(EMPTY);
      loaded = true;
      return;
    }
    await fetchAll();
    if (cache.length === 0 && (await migrateLegacy(user.id))) {
      await fetchAll();
    }
    loaded = true;
  })().finally(() => {
    loading = null;
  });

  return loading;
}

export function resetItems() {
  loaded = false;
  setCache(EMPTY);
}

export async function addItem(
  item: Omit<Item, "id" | "createdAt">,
): Promise<Item | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      name: item.name,
      category: item.category,
      expiry_date: item.expiryDate,
      note: item.note ?? null,
      used_up: !!item.usedUp,
    })
    .select("id,name,category,expiry_date,note,used_up,created_at")
    .single();

  if (error || !data) return null;
  const created = fromRow(data as Row);
  setCache([created, ...cache]);
  return created;
}

export async function updateItem(id: string, patch: Partial<Item>) {
  const previous = cache;
  setCache(cache.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload["name"] = patch.name;
  if (patch.category !== undefined) payload["category"] = patch.category;
  if (patch.expiryDate !== undefined) payload["expiry_date"] = patch.expiryDate;
  if (patch.note !== undefined) payload["note"] = patch.note ?? null;
  if (patch.usedUp !== undefined) payload["used_up"] = patch.usedUp;

  const { error } = await supabase.from("items").update(payload).eq("id", id);
  if (error) setCache(previous);
}

export async function deleteItem(id: string) {
  const previous = cache;
  setCache(cache.filter((it) => it.id !== id));
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) setCache(previous);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
