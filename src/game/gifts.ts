import type { GiftRule, GiftTierId } from '../live/types';

export interface TierMeta {
  id: GiftTierId;
  label: string;
  defaultCount: number;
  isBig: boolean;
  fallbackIcon: string;
}

export const GIFT_TIERS: TierMeta[] = [
  { id: 'bidSmall', label: 'Đẩy Giá Cơ Bản', defaultCount: 1, isBig: false, fallbackIcon: '/img/game/gift_rose.webp' },
  { id: 'shakeBid', label: 'Lắc Soi Rương & Đẩy Giá', defaultCount: 1, isBig: false, fallbackIcon: '/img/game/gift_rosa.webp' },
  { id: 'bidMid', label: 'Đấu Giá Đột Kích', defaultCount: 1, isBig: true, fallbackIcon: '/img/game/gift_doughnut.webp' },
  { id: 'snipeBoost', label: 'Giật Rương 5s Cuối (+20%)', defaultCount: 1, isBig: true, fallbackIcon: '/img/game/gift_cap.webp' },
  { id: 'vipSteal', label: 'Nâng Cấp Két Rồng Vàng', defaultCount: 1, isBig: true, fallbackIcon: '/img/game/gift_corgi.webp' },
];

export const GIFT_TIER_MAP: Record<GiftTierId, TierMeta> = Object.fromEntries(
  GIFT_TIERS.map((t) => [t.id, t]),
) as Record<GiftTierId, TierMeta>;

/** Bảng Việt hóa các quà tặng TikTok phổ biến (vẫn giữ alias tiếng Anh để khớp sự kiện LIVE). */
const TIKTOK_GIFT_NAMES_VI: Record<string, string> = {
  rose: 'Hoa hồng',
  rosa: 'Bó hoa hồng',
  doughnut: 'Bánh vòng',
  donut: 'Bánh vòng',
  cap: 'Mũ lưỡi trai',
  corgi: 'Cún Corgi',
  tiktok: 'Logo TikTok',
  gg: 'Chúc mừng GG',
  'ice cream cone': 'Kem ốc quế',
  'heart me': 'Tim ủng hộ',
  'finger heart': 'Bắn tim',
  'hand heart': 'Tim đôi tay',
  heart: 'Trái tim',
  perfume: 'Nước hoa',
  swan: 'Thiên nga',
  'paper crane': 'Hạc giấy',
  'love you': 'Yêu thương',
  confetti: 'Pháo giấy',
  'mishka bear': 'Gấu Mishka',
  'hand wave': 'Vẫy tay chào',
  'hat and mustache': 'Mũ & Ria mép',
  sunglasses: 'Kính râm',
  necklace: 'Vòng cổ',
  train: 'Tàu hỏa',
  'sports car': 'Siêu xe thể thao',
  'whale diving': 'Cá voi lặn biển',
  'money gun': 'Súng bắn xu',
  galaxy: 'Dải ngân hà',
  castle: 'Lâu đài',
  universe: 'Vũ trụ TikTok',
  'tiktok universe': 'Vũ trụ TikTok',
  lion: 'Sư tử',
  phoenix: 'Phượng hoàng',
  dragon: 'Rồng thần',
  crown: 'Vương miện',
};

export function toVietnameseGiftName(rawName: string): string {
  const clean = String(rawName || '').trim();
  if (!clean) return 'Quà tặng';
  const mapped = TIKTOK_GIFT_NAMES_VI[clean.toLowerCase()];
  return mapped || clean;
}

/** 5 quà mặc định cho Đấu Giá Cướp Rương (hiển thị tiếng Việt, giữ alias khớp TikTok). */
export const DEFAULT_GIFT_RULES: GiftRule[] = [
  {
    id: 'gift_bid_small',
    title: 'Đẩy Giá Nhanh',
    description: 'Cộng xu đấu giá vào rương đang mở và tung pháo hoa giành Top 1.',
    tier: 'bidSmall',
    count: 1,
    enabled: true,
    giftId: 5655,
    giftName: 'Hoa hồng',
    aliases: ['Rose'],
    diamondCount: 1,
    iconUrl: '/img/game/gift_rose.webp',
  },
  {
    id: 'gift_shake_bid',
    title: 'Lắc & Soi Rương',
    description: 'Cộng xu đấu giá + lắc mạnh rương, hé lộ ngay 1 gợi ý mật về bảo vật bên trong.',
    tier: 'shakeBid',
    count: 1,
    enabled: true,
    giftId: 8913,
    giftName: 'Bó hoa hồng',
    aliases: ['Rosa', 'Hoa hồng tươi', 'Quà cấp 2', 'Kem', 'Tim'],
    diamondCount: 10,
    iconUrl: '/img/game/gift_rosa.webp',
  },
  {
    id: 'gift_bid_mid',
    title: 'Đột Kích Đấu Giá',
    description: 'Cộng lực xu lớn bứt tốc lên Top 1 kèm sóng xung kích và banner toàn màn hình.',
    tier: 'bidMid',
    count: 1,
    enabled: true,
    giftId: 5879,
    giftName: 'Bánh vòng',
    aliases: ['Doughnut', 'Donut', 'Bánh rán'],
    diamondCount: 30,
    iconUrl: '/img/game/gift_doughnut.webp',
  },
  {
    id: 'gift_snipe_boost',
    title: 'Đòn Giật 5 Giây Cuối',
    description: 'Tăng +20% uy lực đấu giá khi thả ở 5 giây đếm ngược cuối để giật rương Top 1!',
    tier: 'snipeBoost',
    count: 1,
    enabled: true,
    giftId: 6104,
    giftName: 'Mũ lưỡi trai',
    aliases: ['Cap', 'Mũ', 'Nón kết'],
    diamondCount: 99,
    iconUrl: '/img/game/gift_cap.webp',
  },
  {
    id: 'gift_vip_dragon',
    title: 'Nâng Cấp Két Rồng Vàng',
    description: 'Biến rương hiện tại thành Két Sắt Rồng Vàng VIP + mở Đại Cổng Hoàng Kim xướng danh!',
    tier: 'vipSteal',
    count: 1,
    enabled: true,
    giftId: 6267,
    giftName: 'Cún Corgi',
    aliases: ['Corgi', 'Chó Corgi'],
    diamondCount: 299,
    iconUrl: '/img/game/gift_corgi.webp',
  },
];

const VALID_TIERS = new Set<string>(GIFT_TIERS.map((t) => t.id));

function cleanIconUrl(raw: unknown, tier: GiftTierId): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s) return GIFT_TIER_MAP[tier].fallbackIcon;
  if (s.startsWith('/img/') || s.startsWith('img/') || /^https?:\/\//i.test(s)) {
    return s.slice(0, 400);
  }
  return GIFT_TIER_MAP[tier].fallbackIcon;
}

function cleanText(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, max);
}

/** Chuẩn hóa danh sách quà trước khi lưu server hoặc phát xuống stage. */
export function sanitizeGiftRules(input: unknown): GiftRule[] | null {
  if (!Array.isArray(input)) return null;
  const out: GiftRule[] = [];
  const seenIds = new Set<string>();
  for (const item of input.slice(0, 40)) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    const tier: GiftTierId = VALID_TIERS.has(String(raw.tier)) ? (raw.tier as GiftTierId) : 'bidSmall';
    let id = cleanText(raw.id, 48).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || seenIds.has(id)) id = `gift_${Date.now().toString(36)}_${out.length}`;
    seenIds.add(id);

    const giftIdNum = raw.giftId === null || raw.giftId === undefined || raw.giftId === '' ? null : Number(raw.giftId);
    const giftId = giftIdNum !== null && Number.isFinite(giftIdNum) && giftIdNum > 0 ? Math.round(giftIdNum) : null;
    const count = Math.max(1, Math.min(20, Math.round(Number(raw.count) || GIFT_TIER_MAP[tier].defaultCount)));
    const diamondCount = Math.max(0, Math.min(1_000_000, Math.round(Number(raw.diamondCount) || 0)));
    const aliases = Array.isArray(raw.aliases)
      ? raw.aliases.map((a) => cleanText(a, 40)).filter(Boolean).slice(0, 8)
      : [];

    out.push({
      id,
      title: cleanText(raw.title, 60) || GIFT_TIER_MAP[tier].label,
      description: cleanText(raw.description, 160),
      tier,
      count,
      enabled: raw.enabled !== false,
      giftId,
      giftName: cleanText(raw.giftName, 60),
      aliases,
      diamondCount,
      iconUrl: cleanIconUrl(raw.iconUrl, tier),
    });
  }
  return out;
}

export function cloneDefaultGifts(): GiftRule[] {
  return DEFAULT_GIFT_RULES.map((r) => ({ ...r, aliases: [...(r.aliases || [])] }));
}
