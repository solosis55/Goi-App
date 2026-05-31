import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCIAL_HUB_COLLAPSED_KEY } from "../constants/storageKeys";

let cachedIds: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

export async function loadSocialCollapsedIds(): Promise<Set<string>> {
  if (cachedIds) return new Set(cachedIds);
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const raw = await AsyncStorage.getItem(SOCIAL_HUB_COLLAPSED_KEY);
    const ids = new Set(raw ? raw.split(",").filter(Boolean) : []);
    cachedIds = ids;
    return new Set(ids);
  })();
  return loadPromise;
}

export async function setSocialSectionCollapsed(id: string, collapsed: boolean): Promise<void> {
  const ids = await loadSocialCollapsedIds();
  if (collapsed) ids.add(id);
  else ids.delete(id);
  cachedIds = new Set(ids);
  await writeSocialCollapsedIds([...ids]);
}

export async function writeSocialCollapsedIds(ids: string[]): Promise<void> {
  cachedIds = new Set(ids);
  await AsyncStorage.setItem(SOCIAL_HUB_COLLAPSED_KEY, ids.join(","));
}

export function primeSocialCollapsedIds(ids: Set<string>): void {
  cachedIds = new Set(ids);
}
