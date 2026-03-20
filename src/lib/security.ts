import { Goal, Lending, Notification, Transaction, UserStats } from '../types';
import { auth } from './firebase';

const SECURITY_KEYS = {
  KEYRING: 'mcp_security_keyring',
  SEALED_VAULTS: 'mcp_sealed_vaults',
  INTEGRITY_CHAIN: 'mcp_integrity_chain',
} as const;

const DATA_KEYS = {
  TRANSACTIONS: 'mcp_transactions',
  GOALS: 'mcp_goals',
  LENDING: 'mcp_lending',
  STATS: 'mcp_stats',
  SETTINGS: 'mcp_settings',
  NOTIFICATIONS: 'mcp_notifications',
} as const;

interface KeyringRecord {
  uid: string;
  publicKey: string;
  privateKey: string;
  publicKeyFingerprint: string;
  createdAt: string;
}

interface IntegrityRecord {
  id: string;
  uid: string;
  action: string;
  timestamp: string;
  payloadHash: string;
  previousHash: string;
  chainHash: string;
}

export interface SecurityIdentitySummary {
  publicKeyFingerprint: string;
  createdAt: string;
}

export interface SealedVaultRecord {
  uid: string;
  createdAt: string;
  encryptedPayload: string;
  iv: string;
  wrappedUserKey: string;
  wrappedAdminKey?: string;
  snapshotHash: string;
  publicKeyFingerprint: string;
}

export interface IntegrityVerificationResult {
  valid: boolean;
  recordCount: number;
  currentHash: string;
  lastChainHash: string | null;
  lastAction: string | null;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function getCurrentUid() {
  return auth.currentUser?.uid ?? null;
}

type BiometricAuthModule = typeof import('capacitor-biometric-authentication');

let biometricAuthPromise: Promise<BiometricAuthModule | null> | null = null;

async function loadBiometricAuth() {
  if (!biometricAuthPromise) {
    biometricAuthPromise = import('capacitor-biometric-authentication')
      .catch((error) => {
        console.warn('Biometric plugin is unavailable in this environment.', error);
        return null;
      });
  }

  return biometricAuthPromise;
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Invalid security payload for ${key}.`, error);
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function bufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
    .join(',')}}`;
}

async function sha256Base64(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return bufferToBase64(digest);
}

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getUserTransactions(uid: string) {
  return readJson<Transaction[]>(DATA_KEYS.TRANSACTIONS, []).filter((transaction) => transaction.uid === uid);
}

function getUserGoals(uid: string) {
  return readJson<Goal[]>(DATA_KEYS.GOALS, []).filter((goal) => goal.uid === uid);
}

function getUserLending(uid: string) {
  return readJson<Lending[]>(DATA_KEYS.LENDING, []).filter((entry) => entry.uid === uid);
}

function getUserNotifications(uid: string) {
  return readJson<Notification[]>(DATA_KEYS.NOTIFICATIONS, []).filter(
    (notification) => notification.uid === uid,
  );
}

function getUserStats(uid: string) {
  const statsMap = readJson<Record<string, UserStats>>(DATA_KEYS.STATS, {});
  return statsMap[uid] ?? null;
}

function getUserSettings() {
  return readJson<Record<string, unknown>>(DATA_KEYS.SETTINGS, {});
}

function buildSnapshot(uid: string) {
  return {
    transactions: getUserTransactions(uid),
    goals: getUserGoals(uid),
    lending: getUserLending(uid),
    notifications: getUserNotifications(uid),
    stats: getUserStats(uid),
    settings: getUserSettings(),
  };
}

function getKeyring() {
  return readJson<KeyringRecord[]>(SECURITY_KEYS.KEYRING, []);
}

function getIntegrityChain() {
  return readJson<IntegrityRecord[]>(SECURITY_KEYS.INTEGRITY_CHAIN, []);
}

function getSealedVaults() {
  return readJson<SealedVaultRecord[]>(SECURITY_KEYS.SEALED_VAULTS, []);
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

async function importPublicKey(publicKey: string) {
  return crypto.subtle.importKey(
    'spki',
    base64ToArrayBuffer(publicKey),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  );
}

async function importPrivateKey(privateKey: string) {
  return crypto.subtle.importKey(
    'pkcs8',
    base64ToArrayBuffer(privateKey),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt'],
  );
}

export async function canUseBiometricLock() {
  try {
    const biometricAuth = await loadBiometricAuth();
    if (!biometricAuth?.default) {
      return false;
    }

    const result: unknown = await biometricAuth.default.isAvailable();
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'object' && result !== null && 'available' in result) {
      return Boolean((result as { available?: boolean }).available);
    }
    return false;
  } catch (error) {
    console.warn('Biometric availability check failed:', error);
    return false;
  }
}

export async function requestBiometricUnlock(reason: string) {
  try {
    const biometricAuth = await loadBiometricAuth();
    if (!biometricAuth?.default) {
      return false;
    }

    const result = await biometricAuth.default.authenticate({
      reason,
      fallbackButtonTitle: 'Use device passcode',
      cancelButtonTitle: 'Cancel',
    });
    return result.success;
  } catch (error) {
    console.warn('Biometric authentication failed:', error);
    return false;
  }
}

export async function ensureUserSecurityIdentity(): Promise<SecurityIdentitySummary | null> {
  const uid = getCurrentUid();
  if (!uid || !isBrowser()) return null;

  const existing = getKeyring().find((entry) => entry.uid === uid);
  if (existing) {
    return {
      publicKeyFingerprint: existing.publicKeyFingerprint,
      createdAt: existing.createdAt,
    };
  }

  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const publicKey = bufferToBase64(await crypto.subtle.exportKey('spki', keyPair.publicKey));
  const privateKey = bufferToBase64(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey));
  const publicKeyFingerprint = (await sha256Hex(publicKey)).slice(0, 24);
  const createdAt = new Date().toISOString();

  writeJson(SECURITY_KEYS.KEYRING, [
    ...getKeyring().filter((entry) => entry.uid !== uid),
    { uid, publicKey, privateKey, publicKeyFingerprint, createdAt },
  ]);

  return { publicKeyFingerprint, createdAt };
}

export async function getCurrentUserSecurityIdentity() {
  const uid = getCurrentUid();
  if (!uid) return null;
  return getKeyring().find((entry) => entry.uid === uid) ?? null;
}

export async function sealCurrentUserVault() {
  const uid = getCurrentUid();
  if (!uid || !isBrowser()) return null;

  const identity = await ensureUserSecurityIdentity();
  const keyringEntry = getKeyring().find((entry) => entry.uid === uid);
  if (!identity || !keyringEntry) return null;

  const snapshot = buildSnapshot(uid);
  const snapshotJson = stableStringify(snapshot);
  const snapshotHash = await sha256Base64(snapshotJson);

  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedPayload = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(snapshotJson),
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const userPublicKey = await importPublicKey(keyringEntry.publicKey);
  const wrappedUserKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    userPublicKey,
    rawAesKey,
  );

  const adminPublicKey = import.meta.env.VITE_ADMIN_PUBLIC_KEY;
  let wrappedAdminKey: string | undefined;

  if (adminPublicKey) {
    try {
      const importedAdminKey = await importPublicKey(adminPublicKey);
      const adminWrappedKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        importedAdminKey,
        rawAesKey,
      );
      wrappedAdminKey = bufferToBase64(adminWrappedKey);
    } catch (error) {
      console.warn('Admin public key wrapping failed:', error);
    }
  }

  const sealedVault: SealedVaultRecord = {
    uid,
    createdAt: new Date().toISOString(),
    encryptedPayload: bufferToBase64(encryptedPayload),
    iv: bufferToBase64(iv.buffer),
    wrappedUserKey: bufferToBase64(wrappedUserKey),
    wrappedAdminKey,
    snapshotHash,
    publicKeyFingerprint: identity.publicKeyFingerprint,
  };

  writeJson(SECURITY_KEYS.SEALED_VAULTS, [
    ...getSealedVaults().filter((entry) => entry.uid !== uid),
    sealedVault,
  ]);

  return sealedVault;
}

export async function verifyCurrentUserVaultSeal() {
  const uid = getCurrentUid();
  if (!uid || !isBrowser()) return null;

  const keyringEntry = getKeyring().find((entry) => entry.uid === uid);
  const sealedVault = getSealedVaults().find((entry) => entry.uid === uid);
  if (!keyringEntry || !sealedVault) return null;

  const privateKey = await importPrivateKey(keyringEntry.privateKey);
  const rawAesKey = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    base64ToArrayBuffer(sealedVault.wrappedUserKey),
  );
  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawAesKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(sealedVault.iv)) },
    aesKey,
    base64ToArrayBuffer(sealedVault.encryptedPayload),
  );
  const plaintext = new TextDecoder().decode(decrypted);
  const recalculatedHash = await sha256Base64(plaintext);

  return {
    valid: recalculatedHash === sealedVault.snapshotHash,
    snapshotHash: sealedVault.snapshotHash,
    createdAt: sealedVault.createdAt,
  };
}

export async function appendIntegrityEvent(action: string) {
  const uid = getCurrentUid();
  if (!uid || !isBrowser()) return;

  const snapshot = buildSnapshot(uid);
  const payloadHash = await sha256Base64(stableStringify(snapshot));
  const chain = getIntegrityChain().filter((entry) => entry.uid === uid);
  const previousHash = chain.at(-1)?.chainHash ?? 'GENESIS';
  const timestamp = new Date().toISOString();
  const chainHash = await sha256Base64(`${previousHash}|${payloadHash}|${action}|${timestamp}`);

  writeJson(SECURITY_KEYS.INTEGRITY_CHAIN, [
    ...getIntegrityChain().filter((entry) => entry.uid !== uid),
    ...chain,
    {
      id: createId('integrity'),
      uid,
      action,
      timestamp,
      payloadHash,
      previousHash,
      chainHash,
    },
  ]);
}

export async function verifyIntegrityChainForCurrentUser(): Promise<IntegrityVerificationResult> {
  const uid = getCurrentUid();
  if (!uid || !isBrowser()) {
    return {
      valid: false,
      recordCount: 0,
      currentHash: '',
      lastChainHash: null,
      lastAction: null,
    };
  }

  const chain = getIntegrityChain().filter((entry) => entry.uid === uid);
  const currentHash = await sha256Base64(stableStringify(buildSnapshot(uid)));

  let previousHash = 'GENESIS';
  let valid = true;

  for (const record of chain) {
    const expected = await sha256Base64(
      `${previousHash}|${record.payloadHash}|${record.action}|${record.timestamp}`,
    );

    if (expected !== record.chainHash || record.previousHash !== previousHash) {
      valid = false;
      break;
    }

    previousHash = record.chainHash;
  }

  if (chain.length > 0 && chain.at(-1)?.payloadHash !== currentHash) {
    valid = false;
  }

  return {
    valid,
    recordCount: chain.length,
    currentHash,
    lastChainHash: chain.at(-1)?.chainHash ?? null,
    lastAction: chain.at(-1)?.action ?? null,
  };
}

export async function clearSecurityArtifactsForCurrentUser(uid: string) {
  if (!isBrowser()) return;

  writeJson(
    SECURITY_KEYS.KEYRING,
    getKeyring().filter((entry) => entry.uid !== uid),
  );
  writeJson(
    SECURITY_KEYS.SEALED_VAULTS,
    getSealedVaults().filter((entry) => entry.uid !== uid),
  );
  writeJson(
    SECURITY_KEYS.INTEGRITY_CHAIN,
    getIntegrityChain().filter((entry) => entry.uid !== uid),
  );
}
