/**
 * Offline wallet — persists tickets + pre-rendered QR data URLs on device.
 * Used at the gate when garden cell service is weak (Fairchild reality).
 */

const STORAGE_KEY = "fairchild-wallet-v1";
const MAX_AGE_MS = 72 * 60 * 60 * 1000;

export type CachedTicket = Record<string, unknown> & {
  id: string;
  qr_code: string;
};

export type CachedWallet = {
  userId: string;
  savedAt: number;
  currentTickets: CachedTicket[];
  pastTickets: CachedTicket[];
  visitCount: number;
  qrByCode: Record<string, string>;
};

export function loadWalletCache(userId: string): CachedWallet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWallet;
    if (parsed.userId !== userId) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWalletCache(payload: Omit<CachedWallet, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const data: CachedWallet = { ...payload, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full — still OK if SW has API cache
  }
}

export function getCachedQrImage(qrCode: string): string | null {
  if (typeof window === "undefined" || !qrCode) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWallet;
    return parsed.qrByCode?.[qrCode] ?? null;
  } catch {
    return null;
  }
}

export async function buildQrCache(
  tickets: CachedTicket[],
  existing: Record<string, string> = {}
): Promise<Record<string, string>> {
  const QRCode = (await import("qrcode")).default;
  const qrByCode = { ...existing };
  const codes = [
    ...new Set(tickets.map((t) => t.qr_code).filter(Boolean)),
  ];
  await Promise.all(
    codes.map(async (code) => {
      if (qrByCode[code]) return;
      qrByCode[code] = await QRCode.toDataURL(code, { width: 512, margin: 2 });
    })
  );
  return qrByCode;
}
