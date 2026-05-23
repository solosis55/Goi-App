import AsyncStorage from "@react-native-async-storage/async-storage";

const USAGE_KEY = "goi.catalogExerciseUsage.v1";

type UsageEntry = { count: number; lastAt: number };

export type UsageStore = Record<string, UsageEntry>;

async function readStore(): Promise<UsageStore> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UsageStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store: UsageStore): Promise<void> {
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(store));
}

export async function recordCatalogExercisePick(exerciseId: string): Promise<void> {
  const store = await readStore();
  const prev = store[exerciseId];
  store[exerciseId] = {
    count: (prev?.count ?? 0) + 1,
    lastAt: Date.now(),
  };
  await writeStore(store);
}

export async function getCatalogExerciseUsage(): Promise<UsageStore> {
  return readStore();
}
