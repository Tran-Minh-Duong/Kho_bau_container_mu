export type ChestSlot = 1 | 2 | 3;

export type ParsedCommand =
  | { kind: 'join' }
  | { kind: 'shake' }
  | { kind: 'selectChest'; slot: ChestSlot }
  | { kind: 'joinAndSelect'; slot: ChestSlot }
  | { kind: 'selectAndShake'; slot: ChestSlot };

const PROFANE_TOKENS = [
  'dit', 'dm', 'dcm', 'dkm', 'dmm', 'vcl', 'vl', 'vkl', 'vcc', 'cc', 'cl', 'clm',
  'lon', 'l0n', 'buoi', 'cac', 'cu', 'du', 'duma', 'dume', 'me', 'chich', 'xoac',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'cunt',
];

const EXACT_PROFANE_WORDS = new Set([
  'dm', 'dcm', 'dkm', 'dmm', 'vcl', 'vl', 'vkl', 'vcc', 'cc', 'cl', 'clm',
  'lon', 'l0n', 'cac', 'du', 'dit', 'djt', 'buoi',
  'fuck', 'shit', 'bitch', 'dick', 'cock', 'pussy', 'cunt', 'slut', 'whore', 'asshole', 'nigger', 'nigga',
]);

const SUBSTRING_PROFANE_WORDS = [
  'duma', 'dume', 'ditme', 'ditconme', 'djtme', 'concho', 'matday', 'occho', 'caiconcac', 'cailon',
  'fuck', 'bitch', 'asshole', 'nigger',
];

function stripDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizeProfanityText(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeProfanityText(text);
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (EXACT_PROFANE_WORDS.has(token)) return true;
  }

  const collapsedPunct = normalized.replace(/[._\-*]+/g, '').split(/\s+/).filter(Boolean);
  for (const token of collapsedPunct) {
    if (EXACT_PROFANE_WORDS.has(token)) return true;
  }

  const compact = normalized.replace(/[^a-z0-9]/g, '');
  if (EXACT_PROFANE_WORDS.has(compact)) return true;
  for (const bad of SUBSTRING_PROFANE_WORDS) {
    if (compact.includes(bad)) return true;
  }
  return false;
}

export function sanitizePlayerName(nickname: string, username?: string): string {
  const cleanNick = (nickname || '').replace(/[\r\n\t]+/g, ' ').trim();
  const cleanUser = (username || '').replace(/^@/, '').replace(/[\r\n\t]+/g, ' ').trim();

  if (cleanNick && !containsProfanity(cleanNick)) {
    return cleanNick.slice(0, 22);
  }
  if (cleanUser && !containsProfanity(cleanUser)) {
    return cleanUser.slice(0, 22);
  }
  return 'Thợ Săn Ẩn Danh';
}

export function maskProfanity(text: string): string {
  let out = text;
  for (const word of PROFANE_TOKENS) {
    if (word.length < 3) continue;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    out = out.replace(regex, '***');
  }
  return out;
}

function tokenToSlot(token: string): ChestSlot | null {
  if (/^(1+|r1)$/.test(token)) return 1;
  if (/^(2+|r2)$/.test(token)) return 2;
  if (/^(3+|r3)$/.test(token)) return 3;
  return null;
}

/**
 * Phân tích bình luận từ người xem:
 * Hỗ trợ: `1`, `2`, `3`, `tranh`, `lac` (và dạng mở rộng: `ruong 1`, `chon 2`, `tranh 3`, `1 lac`, `tham gia`).
 */
export function parseCommand(rawComment: string): ParsedCommand | null {
  if (!rawComment) return null;
  const cleaned = stripDiacritics(rawComment)
    .toLowerCase()
    .replace(/[!.,?;:~`"']+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;
  const parts = cleaned.split(' ');

  if (parts.length === 1) {
    const t = parts[0];
    if (t === 'tranh' || t === 'bid' || t === 'thamgia' || t === 'choi') return { kind: 'join' };
    if (t === 'lac' || t === 'shake' || t === 'soi' || t === 'nghe') return { kind: 'shake' };
    const slot = tokenToSlot(t);
    if (slot) return { kind: 'selectChest', slot };
    return null;
  }

  if (parts.length === 2) {
    const [a, b] = parts;
    if ((a === 'tham' && b === 'gia') || (a === 'tranh' && b === 'ruong')) return { kind: 'join' };
    if (a === 'lac' && (b === 'ruong' || b === 'len' || b === 'manh')) return { kind: 'shake' };

    const slotA = tokenToSlot(a);
    const slotB = tokenToSlot(b);
    if ((a === 'ruong' || a === 'chon' || a === 'mo' || a === 'so') && slotB) {
      return { kind: 'selectChest', slot: slotB };
    }
    if (a === 'tranh' && slotB) return { kind: 'joinAndSelect', slot: slotB };
    if (slotA && b === 'tranh') return { kind: 'joinAndSelect', slot: slotA };
    if (a === 'lac' && slotB) return { kind: 'selectAndShake', slot: slotB };
    if (slotA && b === 'lac') return { kind: 'selectAndShake', slot: slotA };
  }

  return null;
}
