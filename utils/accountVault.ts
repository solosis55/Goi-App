import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ACCOUNTS_VAULT_SECURE_KEY, ACCOUNTS_VAULT_STORAGE_KEY } from "../constants/storageKeys";
import type { SafeUser } from "../types/auth";
import { mergeSafeUser } from "./mergeSafeUser";

export type AccountVaultEntry = {
  userId: string;
  token: string;
  user: SafeUser;
};

export type AccountsVault = {
  activeUserId: string;
  accounts: AccountVaultEntry[];
};

export type AccountListItem = {
  userId: string;
  username: string;
  email: string;
  avatarUrl: string;
};

function toListItem(entry: AccountVaultEntry): AccountListItem {
  return {
    userId: entry.userId,
    username: entry.user.username,
    email: entry.user.email,
    avatarUrl: entry.user.avatarUrl,
  };
}

async function readVaultRaw(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(ACCOUNTS_VAULT_STORAGE_KEY);
  }
  try {
    const secured = await SecureStore.getItemAsync(ACCOUNTS_VAULT_SECURE_KEY);
    if (secured) return secured;
  } catch {
    /* SecureStore no disponible */
  }
  return AsyncStorage.getItem(ACCOUNTS_VAULT_STORAGE_KEY);
}

async function writeVaultRaw(json: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(ACCOUNTS_VAULT_STORAGE_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(ACCOUNTS_VAULT_SECURE_KEY, json);
  const legacy = await AsyncStorage.getItem(ACCOUNTS_VAULT_STORAGE_KEY);
  if (legacy) await AsyncStorage.removeItem(ACCOUNTS_VAULT_STORAGE_KEY);
}

async function removeVaultRaw(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(ACCOUNTS_VAULT_STORAGE_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(ACCOUNTS_VAULT_SECURE_KEY);
  } catch {
    /* clave ausente */
  }
  await AsyncStorage.removeItem(ACCOUNTS_VAULT_STORAGE_KEY);
}

function sanitizeEntry(raw: unknown): AccountVaultEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as AccountVaultEntry;
  if (typeof o.userId !== "string" || typeof o.token !== "string" || !o.user) return null;
  return {
    userId: o.userId,
    token: o.token,
    user: mergeSafeUser(o.user),
  };
}

function sanitizeVault(raw: unknown): AccountsVault | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as AccountsVault;
  if (typeof o.activeUserId !== "string" || !Array.isArray(o.accounts)) return null;
  const accounts = o.accounts.map(sanitizeEntry).filter((e): e is AccountVaultEntry => e != null);
  if (accounts.length === 0) return null;
  const activeUserId = accounts.some((a) => a.userId === o.activeUserId)
    ? o.activeUserId
    : accounts[0].userId;
  return { activeUserId, accounts };
}

export async function loadAccountsVault(): Promise<AccountsVault | null> {
  try {
    const raw = await readVaultRaw();
    if (!raw) return null;
    return sanitizeVault(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveAccountsVault(vault: AccountsVault): Promise<void> {
  await writeVaultRaw(JSON.stringify(vault));
}

export async function listStoredAccounts(): Promise<AccountListItem[]> {
  const vault = await loadAccountsVault();
  if (!vault) return [];
  return vault.accounts.map(toListItem);
}

export async function getActiveVaultEntry(): Promise<AccountVaultEntry | null> {
  const vault = await loadAccountsVault();
  if (!vault) return null;
  return vault.accounts.find((a) => a.userId === vault.activeUserId) ?? vault.accounts[0] ?? null;
}

export async function upsertVaultAccount(token: string, user: SafeUser): Promise<AccountsVault> {
  const merged = mergeSafeUser(user);
  const entry: AccountVaultEntry = { userId: merged.id, token, user: merged };
  const existing = await loadAccountsVault();
  let accounts: AccountVaultEntry[];
  if (existing) {
    const idx = existing.accounts.findIndex((a) => a.userId === merged.id);
    if (idx >= 0) {
      accounts = [...existing.accounts];
      accounts[idx] = entry;
    } else {
      accounts = [...existing.accounts, entry];
    }
  } else {
    accounts = [entry];
  }
  const vault: AccountsVault = { activeUserId: merged.id, accounts };
  await saveAccountsVault(vault);
  return vault;
}

export async function setActiveVaultUser(userId: string): Promise<AccountVaultEntry | null> {
  const vault = await loadAccountsVault();
  if (!vault) return null;
  const entry = vault.accounts.find((a) => a.userId === userId);
  if (!entry) return null;
  await saveAccountsVault({ ...vault, activeUserId: userId });
  return entry;
}

export async function removeVaultAccount(userId: string): Promise<AccountsVault | null> {
  const vault = await loadAccountsVault();
  if (!vault) return null;
  const accounts = vault.accounts.filter((a) => a.userId !== userId);
  if (accounts.length === 0) {
    await removeVaultRaw();
    return null;
  }
  const activeUserId =
    vault.activeUserId === userId ? accounts[0].userId : vault.activeUserId;
  const next: AccountsVault = { activeUserId, accounts };
  await saveAccountsVault(next);
  return next;
}

export async function clearAccountsVault(): Promise<void> {
  await removeVaultRaw();
}
