import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "goi:blockedUserIds";

export async function getBlockedUserIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function blockUser(userId: string): Promise<void> {
  const ids = await getBlockedUserIds();
  if (ids.includes(userId)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([...ids, userId]));
}

export async function unblockUser(userId: string): Promise<void> {
  const ids = await getBlockedUserIds();
  await AsyncStorage.setItem(KEY, JSON.stringify(ids.filter((id) => id !== userId)));
}
