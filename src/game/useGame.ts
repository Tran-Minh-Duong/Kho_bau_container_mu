import { useCallback, useRef } from 'react';
import { containsBanned } from '../live/bannedWords';
import { detectWish, makePicker, WishLimiter } from '../live/chatter';
import { speakableName } from '../live/names';
import { useLiveEvents } from '../live/useLiveEvents';
import { GAME } from './config';
import { sanitizePlayerName } from './commandParser';
import { gameApi } from './frame';

export function useGame() {
  const wishLimiter = useRef(new WishLimiter(GAME.wishPerUserMs, GAME.wishGlobalMs));
  const pick = useRef(makePicker());

  const live = useLiveEvents({
    onSpeakerChange: (active) => {
      gameApi()?.setSpeaker(active);
    },

    onChat: (ev) => {
      const api = gameApi();
      const safeName = sanitizePlayerName(ev.nickname, ev.username);
      const spoken = speakableName(ev.nickname);
      api?.event({
        type: 'comment',
        user: ev.username,
        name: safeName,
        spokenName: spoken,
        text: ev.comment,
        avatar: ev.avatar,
      });

      if (!containsBanned(ev.comment)) {
        const topic = detectWish(ev.comment);
        if (topic && spoken !== 'bạn' && wishLimiter.current.allow(ev.username)) {
          const line = pick.current(GAME.wishReplies[topic])?.(spoken);
          if (line) api?.sayText(line, 1);
        }
      }
    },

    onGift: (ev) => {
      const safeName = sanitizePlayerName(ev.nickname, ev.username);
      const spoken = speakableName(ev.nickname);
      gameApi()?.event({
        type: 'gift',
        user: ev.username,
        name: safeName,
        spokenName: spoken,
        giftName: ev.giftName,
        giftId: ev.giftId,
        coins: ev.diamondCount,
        count: ev.repeatCount,
        avatar: ev.avatar,
      });
    },

    onLike: (ev) => {
      gameApi()?.event({
        type: 'like',
        user: ev.username,
        name: sanitizePlayerName(ev.nickname, ev.username),
        count: ev.likeCount,
        avatar: ev.avatar,
      });
    },

    onFollow: (ev) => {
      gameApi()?.event({
        type: 'follow',
        user: ev.username,
        name: sanitizePlayerName(ev.nickname, ev.username),
        spokenName: speakableName(ev.nickname),
        avatar: ev.avatar,
      });
    },

    onShare: (ev) => {
      gameApi()?.event({
        type: 'share',
        user: ev.username,
        name: sanitizePlayerName(ev.nickname, ev.username),
        spokenName: speakableName(ev.nickname),
        avatar: ev.avatar,
      });
    },

    onMember: (ev) => {
      gameApi()?.event({
        type: 'member',
        user: ev.username,
        name: sanitizePlayerName(ev.nickname, ev.username),
        spokenName: speakableName(ev.nickname),
        avatar: ev.avatar,
      });
    },

    onControl: (ev) => {
      const api = gameApi();
      if (!api) return;
      if (ev.action === 'speak' && ev.text) api.sayText(ev.text, 5);
      else if (ev.action === 'reset') api.newSession();
      else if (ev.action === 'setRate' && ev.text) api.setMc({ mcSpeed: ev.text });
      else if (ev.action === 'setVoice' && (ev.text === 'M' || ev.text === 'F')) {
        api.setMc({ mcVoice: ev.text === 'F' ? 'Hoài My' : 'Nam Minh' });
      } else if (ev.action === 'setPrefs' && ev.text) {
        try {
          const parsed = JSON.parse(ev.text) as Record<string, string>;
          api.setMc(parsed);
        } catch {
          // Bỏ qua JSON sai định dạng
        }
      } else if (ev.action === 'custom' && ev.text) {
        if (ev.text === 'session') api.newSession();
        else if (ev.text === 'round') api.newRound();
        else if (ev.text.startsWith('len:')) {
          const sec = Number(ev.text.slice(4));
          if (sec > 0) api.setRoundLength(sec);
        } else if (ev.text.startsWith('phase:')) {
          const phase = ev.text.slice(6) as 'conveyor' | 'scout' | 'auction' | 'snipe5s' | 'reveal';
          api.jumpPhase(phase);
        } else if (ev.text === 'vipChest') {
          api.forceVipChest();
        } else if (ev.text === 'snipe5s') {
          api.testSnipe5s();
        } else if (ev.text.startsWith('revealCustom:')) {
          api.testRevealCustom?.(ev.text.slice('revealCustom:'.length));
        } else if (ev.text.startsWith('reveal:')) {
          const kind = ev.text.slice(7) as 'jackpot' | 'troll' | 'common' | 'rare' | 'epic';
          api.testReveal(kind);
        } else if (ev.text === 'toggleLeaderboard') {
          api.toggleLeaderboard?.();
        } else if (ev.text === 'showLeaderboard') {
          api.toggleLeaderboard?.(true);
        } else if (ev.text === 'hideLeaderboard') {
          api.toggleLeaderboard?.(false);
        }
      }
    },

    onGiftsChange: (rules) => {
      gameApi()?.setGifts?.(rules);
    },

    onLootChange: (items) => {
      gameApi()?.setLoot?.(items);
    },
  });

  const syncFrame = useCallback(() => {
    const api = gameApi();
    if (!api) return;
    api.setSpeaker(live.isSpeaker);
    api.setMc({ ...GAME.mc, mcVoice: live.voiceWho === 'F' ? 'Hoài My' : 'Nam Minh', ...live.prefs });
    api.setGifts?.(live.giftRules);
    api.setLoot?.(live.customLoot);
  }, [live.isSpeaker, live.voiceWho, live.prefs, live.giftRules, live.customLoot]);

  return { ...live, syncFrame };
}
