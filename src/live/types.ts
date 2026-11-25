export interface LiveStatus {
  isConnected: boolean;
  isConnecting: boolean;
  username: string;
  roomId: string;
  viewerCount: number;
  totalLikes: number;
  error?: string;
  stages: number;
}

export interface ChatEvent {
  username: string;
  nickname: string;
  comment: string;
  avatar: string;
  timestamp: number;
}

export interface GiftEvent {
  username: string;
  nickname: string;
  giftName: string;
  giftId: number;
  diamondCount: number;
  repeatCount: number;
  avatar: string;
  timestamp: number;
}

export interface ViewerEvent {
  username: string;
  nickname: string;
  avatar: string;
  timestamp: number;
}

export interface LikeEvent {
  username: string;
  nickname: string;
  avatar?: string;
  likeCount: number;
  totalLikes: number;
}

export interface ControlEvent {
  action: 'speak' | 'setRate' | 'reset' | 'setName' | 'setVoice' | 'setTheme' | 'setPrefs' | 'custom';
  text?: string;
}

export type GiftTierId = 'bidSmall' | 'shakeBid' | 'bidMid' | 'snipeBoost' | 'vipSteal';

export type LootRarity = 'troll' | 'common' | 'rare' | 'epic' | 'legendary';

export interface CustomLootItem {
  id: string;
  name: string;
  rarity: LootRarity;
  valueXu: number;
  icon: string;
  imageUrl?: string;
  enabled: boolean;
}

export interface GiftRule {
  id: string;
  title: string;
  description: string;
  tier: GiftTierId;
  count: number;
  enabled: boolean;
  giftId: number | null;
  giftName: string;
  aliases?: string[];
  diamondCount: number;
  iconUrl: string;
}

export interface TikTokCatalogGift {
  id: number;
  name: string;
  diamondCount: number;
  iconUrl: string;
  describe?: string;
}
