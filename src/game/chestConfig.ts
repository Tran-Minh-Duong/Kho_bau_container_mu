import type { CustomLootItem, LootRarity } from '../live/types';

export type ChestTierId = 'carton' | 'crate' | 'steel' | 'royal' | 'dragonSafe';

export type { LootRarity, CustomLootItem };

export interface ChestTierSpec {
  id: ChestTierId;
  name: string;
  shortName: string;
  badgeColor: string;
  glowColor: string;
  hint: string;
}

export interface LootItemSpec {
  id: string;
  name: string;
  rarity: LootRarity;
  valueXu: number;
  icon: string;
  imageUrl?: string;
  cluePool: string[];
}

export const LOOT_RARITY_TIERS: { id: LootRarity; label: string; effectHint: string; defaultXu: number }[] = [
  { id: 'troll', label: 'Troll / Hài hước', effectHint: 'Khói xanh + nhạc hài hước', defaultXu: 1 },
  { id: 'common', label: 'Thường', effectHint: 'Hào quang xanh nhẹ', defaultXu: 120 },
  { id: 'rare', label: 'Hiếm', effectHint: '8 tia sáng + sóng xung kích', defaultXu: 500 },
  { id: 'epic', label: 'Cực Hiếm', effectHint: '14 tia tím vàng + tia sét', defaultXu: 1800 },
  { id: 'legendary', label: 'Cực Phẩm Nghìn Xu', effectHint: '20 tia hoàng kim + pháo hoa toàn màn hình', defaultXu: 5000 },
];

const VALID_RARITIES = new Set<string>(LOOT_RARITY_TIERS.map((r) => r.id));

function cleanLootText(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, max);
}

export function cleanCustomImageUrl(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s) return '';
  if (s.startsWith('/img/') || s.startsWith('img/') || /^https?:\/\//i.test(s)) {
    return s.slice(0, 500);
  }
  return '';
}

export function sanitizeCustomLoot(input: unknown): CustomLootItem[] | null {
  if (!Array.isArray(input)) return null;
  const out: CustomLootItem[] = [];
  const seen = new Set<string>();
  for (const rawItem of input.slice(0, 40)) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const raw = rawItem as Record<string, unknown>;
    const rarity: LootRarity = VALID_RARITIES.has(String(raw.rarity)) ? (raw.rarity as LootRarity) : 'rare';
    let id = cleanLootText(raw.id, 48).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || seen.has(id)) id = `loot_${Date.now().toString(36)}_${out.length}`;
    seen.add(id);
    const name = cleanLootText(raw.name, 60) || 'Quà Bí Ẩn';
    const valueXu = Math.max(0, Math.min(1_000_000, Math.round(Number(raw.valueXu) || 0)));
    const icon = cleanLootText(raw.icon, 8) || '🎁';
    const imageUrl = cleanCustomImageUrl(raw.imageUrl);
    out.push({
      id,
      name,
      rarity,
      valueXu,
      icon,
      ...(imageUrl ? { imageUrl } : {}),
      enabled: raw.enabled !== false,
    });
  }
  return out;
}

export const CHEST_TIERS: Record<ChestTierId, ChestTierSpec> = {
  carton: {
    id: 'carton',
    name: 'Thùng Carton Móp Méo',
    shortName: 'Carton Móp',
    badgeColor: '#d97706',
    glowColor: '#fbbf24',
    hint: 'Vỏ ngoài rách nát nhưng biết đâu chủ cũ bỏ quên đồ hiệu?',
  },
  crate: {
    id: 'crate',
    name: 'Thùng Gỗ Niêm Phong',
    shortName: 'Thùng Gỗ',
    badgeColor: '#b45309',
    glowColor: '#f59e0b',
    hint: 'Kiện hàng cảng biển đóng đinh kín mít, lắc lên nghe rất lạ.',
  },
  steel: {
    id: 'steel',
    name: 'Container Thép Công Nghiệp',
    shortName: 'Container Thép',
    badgeColor: '#0284c7',
    glowColor: '#38bdf8',
    hint: 'Container niêm phong thép dày, tín hiệu kim loại phản hồi mạnh.',
  },
  royal: {
    id: 'royal',
    name: 'Rương Báu Hoàng Gia',
    shortName: 'Rương Hoàng Gia',
    badgeColor: '#9333ea',
    glowColor: '#c084fc',
    hint: 'Khảm đá quý lấp lánh, phát ra âm thanh vang dội.',
  },
  dragonSafe: {
    id: 'dragonSafe',
    name: 'Két Sắt Rồng Vàng VIP',
    shortName: 'Két Rồng Vàng',
    badgeColor: '#eab308',
    glowColor: '#fde047',
    hint: 'Két sắt tối thượng khóa 3 tầng, cơ hội nổ bảo vật nghìn xu!',
  },
};

export const LOOT_POOL: LootItemSpec[] = [
  {
    id: 'dep_to_ong',
    name: 'Đôi Dép Tổ Ong Huyền Thoại',
    rarity: 'troll',
    valueXu: 1,
    icon: '🩴',
    cluePool: [
      'Lắc nghe tiếng "bẹp bẹp" rất nhẹ… hơi nghi là đồ cao su 👀',
      'Âm thanh mềm xốp, không giống tiếng kim loại chút nào!',
    ],
  },
  {
    id: 'banh_trang',
    name: 'Bịch Bánh Tráng Trộn Để Quên',
    rarity: 'troll',
    valueXu: 5,
    icon: '🥡',
    cluePool: [
      'Tiếng sột soạt như bao bì nilon… hay là giấy gói hàng?',
      'Kiện hàng nhẹ tênh, lắc nghe lạo xạo rất nhanh!',
    ],
  },
  {
    id: 've_so_cu',
    name: 'Xấp Vé Số Trật Hôm Qua',
    rarity: 'troll',
    valueXu: 2,
    icon: '🎫',
    cluePool: [
      'Nghe tiếng giấy cọ xát sột soạt, không thấy vật nặng.',
      'Rất nhẹ! Chỉ có tiếng loạt xoạt khe khẽ bên trong.',
    ],
  },
  {
    id: 'la_ban',
    name: 'La Bàn Hải Tặc Cổ',
    rarity: 'common',
    valueXu: 120,
    icon: '🧭',
    cluePool: [
      'Có vật tròn bằng đồng lăn lóc bên trong!',
      'Nghe tiếng kim loại va chạm nhẹ rất thanh.',
    ],
  },
  {
    id: 'tui_xu',
    name: 'Túi Tiền Vàng Cảng Biển',
    rarity: 'rare',
    valueXu: 380,
    icon: '💰',
    cluePool: [
      'Tiếng leng keng rủng rỉnh! Rất nhiều đồng nhỏ va vào nhau!',
      'Âm thanh kim loại dày đặc khi lắc mạnh!',
    ],
  },
  {
    id: 'dong_ho',
    name: 'Đồng Hồ Cơ Hoàng Kim',
    rarity: 'rare',
    valueXu: 650,
    icon: '⌚',
    cluePool: [
      'Nghe tiếng tích tắc mơ hồ kèm khung thép nặng!',
      'Tín hiệu phản xạ ánh vàng lấp ló qua khe quét!',
    ],
  },
  {
    id: 'thoi_vang',
    name: 'Thỏi Vàng 9999 Nguyên Khối',
    rarity: 'epic',
    valueXu: 1500,
    icon: '🪙',
    cluePool: [
      'Nặng trịch! Lắc muốn gãy tay mà vật bên trong chỉ dịch nhích nhẹ!',
      'Âm trầm đục cực nặng — dấu hiệu của kim loại quý nguyên khối!',
    ],
  },
  {
    id: 'kim_cuong',
    name: 'Viên Kim Cương Đại Dương',
    rarity: 'epic',
    valueXu: 2400,
    icon: '💎',
    cluePool: [
      'Phát ra tiếng ngân trong veo như pha lê khi rung lắc!',
      'Máy quét báo tia khúc xạ xanh lam cực mạnh!',
    ],
  },
  {
    id: 'vuong_mien',
    name: 'Vương Miện Long Hoàng',
    rarity: 'legendary',
    valueXu: 5000,
    icon: '👑',
    cluePool: [
      'BÁO ĐỘNG CỰC PHẨM! Tiếng đá quý + vàng ròng vang dội cả phòng!',
      'Tần số cộng hưởng hoàng kim cực đại! Rương này không tầm thường!',
    ],
  },
  {
    id: 'ngoc_ty',
    name: 'Ngọc Tỷ Rồng Vàng Nghìn Xu',
    rarity: 'legendary',
    valueXu: 8888,
    icon: '🐉',
    cluePool: [
      'RUNG CHUYỂN BĂNG CHUYỀN! Có luồng năng lượng rồng bên trong!',
      'Âm vang uy lực nghìn xu! Ai giữ Top 1 rương này chắc chắn đổi đời!',
    ],
  },
];

export const DISCLAIMER_ITEMS: readonly { title: string; body: string }[] = [
  {
    title: '1. Đồ hoạ, rương và bảo vật là mô phỏng giải trí.',
    body: 'Kiện hàng, két sắt, vật phẩm mở ra (Vương Miện, Ngọc Tỷ, Dép Tổ Ong...) và Tủ Bảo Tàng đều là đồ họa mô phỏng giải trí trong game, không phải hiện vật thật hay phần thưởng quy đổi.',
  },
  {
    title: '2. Không dùng game để cá cược hay trao thưởng.',
    body: 'Game chỉ dùng để tương tác vui vẻ, trưng bày tên và avatar người thắng đấu giá lên Tủ Bảo Tàng suốt buổi live. Nếu chủ kênh tự ý tổ chức cá cược hoặc đổi thưởng bằng tiền/hiện vật, hành vi đó có thể vi phạm pháp luật và chủ kênh tự chịu hoàn toàn trách nhiệm.',
  },
  {
    title: '3. Tiền quà là thu nhập của bạn.',
    body: 'Quà người xem tặng để đấu giá giành quyền mở rương là thu nhập của người live. Việc kê khai và thực hiện nghĩa vụ thuế do bạn tự tìm hiểu theo quy định hiện hành.',
  },
  {
    title: '4. Kết nối và giọng đọc dùng công cụ không chính thức.',
    body: 'Game đọc sự kiện phòng live và tạo giọng MC qua các công cụ bên ngoài (Edge/Google/VieNeu), không phải API chính thức của TikTok, Microsoft hay Google và có thể ngừng hoạt động bất kỳ lúc nào.',
  },
  {
    title: '5. Bộ lọc từ tục không bắt được hết.',
    body: 'Game chỉ nhận các từ khoá lệnh hợp lệ (1, 2, 3, tranh, lac) và lọc tên hiển thị nhạy cảm, MC không bao giờ đọc nguyên văn bình luận tự do. Chủ kênh vẫn cần tự kiểm soát nội dung phòng live.',
  },
  {
    title: '6. Cấu hình quà tặng mặc định.',
    body: 'Các mức quà tặng (Hoa hồng, Bó hoa hồng, Bánh vòng, Mũ lưỡi trai, Cún Corgi...) có thể chỉnh sửa trực tiếp trong mục Quà Đấu Giá hoặc file src/game/gifts.ts và src/game/chestConfig.ts.',
  },
  {
    title: '7. Dùng game là bạn tự chịu trách nhiệm.',
    body: 'Mã nguồn chia sẻ nguyên trạng, không kèm cam kết pháp lý hay bồi thường thiệt hại phát sinh trong quá trình sử dụng.',
  },
];
