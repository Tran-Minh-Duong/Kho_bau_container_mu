export interface GameStats {
  round: number;
  phase: 'conveyor' | 'scout' | 'auction' | 'reveal';
  timeLeft: number;
  snipeMode: boolean;
  snipeCount: number;
  shakeMeter: number;
  cluesRevealed: number;
  selectedSlot: 1 | 2 | 3;
  activeChestTier: string;
  topBidder: { name: string; bidXu: number; avatar: string } | null;
  roundGiftXu?: number;
  votes: [number, number, number];
  museumCount: number;
  museumValue: number;
  players: number;
  cmtTotal: number;
  likesTotal: number;
  fps: number;
  frameP95?: number;
  graphics?: 'full' | 'lite';
  leaderboardOpen?: boolean;
  leaderboardPinned?: boolean;
}

export interface GameApi {
  event(ev: Record<string, unknown>): { handled?: boolean; slot?: number | null; joined?: boolean };
  sayText(text: string, prio?: number): void;
  stopVoice(): void;
  setSpeaker(on: boolean): void;
  setMc(prefs: Record<string, string>): void;
  setGifts?(rules: unknown[]): void;
  setLoot?(items: unknown[]): void;
  setRoundLength(sec: number): void;
  jumpPhase(phase: 'conveyor' | 'scout' | 'auction' | 'snipe5s' | 'reveal'): void;
  newSession(): void;
  newRound(): void;
  forceVipChest(): void;
  testSnipe5s(): void;
  testReveal(outcome?: 'jackpot' | 'troll' | 'common' | 'rare' | 'epic'): void;
  testRevealCustom?(lootId: string): void;
  toggleLeaderboard?(force?: boolean): void;
  phase(): 'conveyor' | 'scout' | 'auction' | 'reveal';
  stats(): GameStats;
}

export const frame: { el: HTMLIFrameElement | null } = { el: null };

export const gameApi = (): GameApi | null =>
  ((frame.el?.contentWindow as unknown as { GAME_API?: GameApi } | null)?.GAME_API) ?? null;
