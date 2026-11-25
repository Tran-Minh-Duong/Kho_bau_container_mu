import { useEffect, useRef, useState, type ReactNode } from 'react';
import { emitTest, sendControl } from '../live/page';
import type { CustomLootItem, GiftRule } from '../live/types';
import { GAME } from './config';
import { CustomRewardPanel } from './CustomRewardPanel';
import { gameApi, type GameStats } from './frame';
import { GiftManager } from './GiftManager';
import { DISCLAIMER_ITEMS } from './chestConfig';

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN = ['Lan Anh', 'Minh Tuấn', 'Thu Hà', 'Quốc Bảo', 'Ngọc Mai', 'Hoàng Long', 'Gia Huy', 'Khánh Vy', 'Bé Na 💎', 'duyanh99'];
let uid = 0;
const who = () => {
  uid++;
  const nickname = uid % 7 === 0 ? TEN[uid % TEN.length] : `${HO[uid % HO.length]} ${TEN[(uid * 3) % TEN.length]}`;
  return { nickname, username: `test${Date.now().toString(36)}${uid}` };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function GameControls({
  prefs,
  giftRules,
  customLoot,
}: {
  prefs: Record<string, string>;
  giftRules: GiftRule[];
  customLoot: CustomLootItem[];
}) {
  const [count, setCount] = useState('');
  const [mc, setMc] = useState<Record<string, string>>({ ...GAME.mc, ...prefs });
  const [showRules, setShowRules] = useState(false);
  useEffect(() => setMc((m) => ({ ...m, ...prefs })), [prefs]);
  const sim = useRef<(() => void) | null>(null);
  const rulesRef = useRef<GiftRule[]>(giftRules);
  rulesRef.current = giftRules;
  const [simInfo, setSimInfo] = useState('');
  const [stats, setStats] = useState<GameStats | null>(null);
  const refreshStats = () => setStats(gameApi()?.stats() ?? null);
  useEffect(() => {
    refreshStats();
    const timer = setInterval(refreshStats, 600);
    return () => clearInterval(timer);
  }, []);

  const asPlayer = async (s: string, then?: (u: ReturnType<typeof who>) => Promise<void>) => {
    const u = who();
    await emitTest('chat', { ...u, comment: s });
    await then?.(u);
  };

  // Kiểm tra đếm bình luận: gửi 200 comment đủ kiểu và so sánh bộ đếm của game
  const testCount = async () => {
    const api = gameApi();
    if (!api) return setCount('Game chưa tải xong, thử lại sau vài giây.');
    const before = api.stats().cmtTotal;
    const forms = ['1', '2', '3', 'tranh', 'lac', '111', 'ruong 2', 'lắc', 'hay quá', 'mở két vàng đi'];
    const people = Array.from({ length: 40 }, who);
    let sent = 0;
    setCount('Đang gửi 200 comment...');
    for (let i = 0; i < 200; i++) {
      const u = people[i % people.length];
      await emitTest('chat', { ...u, comment: forms[i % forms.length] });
      sent++;
    }
    await sleep(1400);
    const after = gameApi()?.stats().cmtTotal ?? before;
    const got = after - before;
    setCount(`Gửi ${sent} comment, game đếm ${got}. ${got === sent ? 'Khớp toàn bộ comment.' : 'Lệch bộ đếm, kiểm tra lại.'}`);
  };

  const startSim = (kind: 'full' | 'low') => {
    sim.current?.();
    const SCRIPT: [number, number, number, number, string][] =
      kind === 'full'
        ? [
            [0, 14, 60, 0, 'Băng chuyền khởi động, người vào chọn rương'],
            [1.5, 28, 120, 1, 'Cả phòng thả tim lắc rương nghe tiếng'],
            [4, 48, 45, 2, 'ĐỘT KÍCH 5S CUỐI: Giật Két Sắt Rồng Vàng'],
            [8, 22, 160, 1, 'Tủ Bảo Tàng trưng bày, đua Top Đại Gia'],
            [14, 55, 60, 2, 'SÓNG FOMO 2: Tranh siêu rương nghìn xu'],
            [24, 90, 90, 2, 'CAO TRÀO CUỐI PHIÊN: Cướp rương liên hoàn'],
          ]
        : [
            [0, 3, 180, 0, 'Phòng vắng: 2–3 người'],
            [6, 4, 240, 0, 'Chơi nhẹ nhàng'],
            [15, 6, 180, 1, 'Thêm người lắc rương'],
          ];
    const t0 = Date.now();
    const crowd: { u: ReturnType<typeof who>; favSlot: string; at: number; until: number; next: number }[] = [];
    const rushes: [number, number][] = [];
    const fired = new Set<number>();
    let label = '';
    const CMDS = ['1', '2', '3', 'tranh', 'lac'];
    const timer = setInterval(() => {
      const el = (Date.now() - t0) / 1000;
      if (el > 1800) return stop();
      SCRIPT.forEach(([min, n, over, rushLvl, lb], i) => {
        if (fired.has(i) || el < min * 60) return;
        fired.add(i);
        label = lb;
        if (rushLvl > 0) rushes.push([el, el + (rushLvl === 2 ? 90 : 50)]);
        for (let j = 0; j < n; j++) {
          crowd.push({
            u: who(),
            favSlot: String((j % 3) + 1),
            at: el + Math.random() * over,
            until: min >= 24 ? 1e9 : el + 180 + Math.random() * 700,
            next: 0,
          });
        }
      });
      const busy = rushes.some(([a, b]) => el >= a && el <= b) ? 3 : 1;
      let active = 0;
      for (const p of crowd) {
        if (el < p.at || el > p.until) continue;
        active++;
        if (el < p.next) continue;
        p.next = el + (5 + Math.random() * 11) / busy;
        const cmt = Math.random() < 0.35 ? p.favSlot : CMDS[Math.floor(Math.random() * CMDS.length)];
        void emitTest('chat', { ...p.u, comment: cmt });
        if (Math.random() < (busy > 1 ? 0.85 : 0.45)) {
          void emitTest('like', { ...p.u, likeCount: busy > 1 ? 25 + Math.floor(Math.random() * 65) : 5 + Math.floor(Math.random() * 25) });
        }
        const r = Math.random() / busy;
        const pool = rulesRef.current
          .filter((x) => x.enabled && (x.giftId || x.giftName))
          .sort((a, b) => a.diamondCount - b.diamondCount);
        let picked: GiftRule | undefined;
        if (pool.length > 0 && r < 0.032) {
          if (r < 0.021) picked = pool[0];
          else if (r < 0.025) picked = pool[Math.min(1, pool.length - 1)];
          else if (r < 0.0285) picked = pool[Math.min(2, pool.length - 1)];
          else if (r < 0.031) picked = pool[Math.min(3, pool.length - 1)];
          else picked = pool[pool.length - 1];
        }
        if (picked) {
          void emitTest('gift', {
            ...p.u,
            giftName: picked.giftName || picked.title,
            giftId: picked.giftId || 0,
            diamondCount: picked.diamondCount || 1,
            repeatCount: 1,
          });
        }
      }
      setSimInfo(`Phút ${(el / 60).toFixed(1)}/30 · ${active} người đang xem · ${label}`);
    }, 250);
    const stop = () => {
      clearInterval(timer);
      sim.current = null;
      setSimInfo('Đã dừng mô phỏng.');
    };
    sim.current = stop;
  };
  useEffect(() => () => sim.current?.(), []);

  const saveMc = (patch: Record<string, string>) => {
    const next = { ...mc, ...patch };
    setMc(next);
    void sendControl('setPrefs', JSON.stringify(patch));
  };

  return (
    <section className="space-y-4 rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-amber-300">Kho Báu Container Mù · Điều khiển</h2>
        <button
          onClick={() => setShowRules((v) => !v)}
          className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-amber-200 hover:bg-slate-700"
        >
          {showRules ? 'Ẩn lưu ý trách nhiệm' : 'Xem 7 lưu ý & trách nhiệm'}
        </button>
      </div>

      {showRules && (
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300 ring-1 ring-amber-500/30">
          {DISCLAIMER_ITEMS.map((item) => (
            <div key={item.title}>
              <div className="font-semibold text-amber-300">{item.title}</div>
              <p className="text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      )}

      <Row title="Vòng đấu & Nhịp độ">
        <B onClick={() => sendControl('custom', 'round')}>📦 Lên chuyến hàng mới</B>
        <B onClick={() => sendControl('custom', 'session')}>↺ Phiên mới (Xóa Tủ)</B>
        <LeaderboardButton stats={stats} onAfterClick={() => setTimeout(refreshStats, 150)} />
        <B onClick={() => sendControl('custom', 'len:45')}>45s / vòng</B>
        <B onClick={() => sendControl('custom', 'len:60')}>60s / vòng</B>
        <B onClick={() => sendControl('custom', 'len:90')}>90s / vòng</B>
        <span className="self-center text-xs text-slate-500">Chuyển pha:</span>
        <B onClick={() => sendControl('custom', 'phase:scout')}>Lắc soi rương</B>
        <B onClick={() => sendControl('custom', 'phase:auction')}>Đấu giá</B>
        <B onClick={() => sendControl('custom', 'phase:snipe5s')}>⚡ 5 giây cuối</B>
        <B onClick={() => sendControl('custom', 'phase:reveal')}>Mở rương</B>
      </Row>

      <Row title="Đếm bình luận (kiểm tra nhận toàn bộ lệnh & bình luận)">
        <B onClick={testCount}>Kiểm tra đếm bình luận (200 comment)</B>
        {count && <div className="w-full text-sm text-amber-300">{count}</div>}
      </Row>

      <Row title="Người xem giả · Chọn rương, Tranh & Lắc">
        <B onClick={() => asPlayer('1')}>Gõ "1" (Rương 1)</B>
        <B onClick={() => asPlayer('2')}>Gõ "2" (Rương 2)</B>
        <B onClick={() => asPlayer('3')}>Gõ "3" (Rương 3)</B>
        <B onClick={() => asPlayer('tranh')}>Gõ "tranh"</B>
        <B onClick={() => asPlayer('lac')}>Gõ "lac"</B>
        <B onClick={() => asPlayer('tranh', (u) => emitTest('like', { ...u, likeCount: 50 }))}>❤️ +50 tim</B>
        <B onClick={() => asPlayer('lac', (u) => emitTest('like', { ...u, likeCount: 300 }))}>❤️ +300 tim (Soi hết)</B>
        <B onClick={() => asPlayer('tranh', (u) => emitTest('share', u))}>Chia sẻ</B>
        <B onClick={() => asPlayer('tranh', (u) => emitTest('follow', u))}>Theo dõi</B>
      </Row>

      <Row title="Thử Kịch Tính · Cướp Rương &amp; Hiệu Ứng Mở Quà Theo Cấp">
        <B onClick={() => sendControl('custom', 'snipe5s')}>⚡ Thử 5s Giật Rương</B>
        <B onClick={() => sendControl('custom', 'vipChest')}>🐉 Nâng Két Rồng Vàng</B>
        <B onClick={() => sendControl('custom', 'reveal:troll')}>🩴 Cấp Troll</B>
        <B onClick={() => sendControl('custom', 'reveal:common')}>🧭 Cấp Thường</B>
        <B onClick={() => sendControl('custom', 'reveal:rare')}>💰 Cấp Hiếm</B>
        <B onClick={() => sendControl('custom', 'reveal:epic')}>🪙 Cấp Cực Hiếm</B>
        <B onClick={() => sendControl('custom', 'reveal:jackpot')}>👑 Cấp Cực Phẩm</B>
      </Row>

      <CustomRewardPanel
        items={customLoot}
        onSaveItems={async (next) => {
          await fetch('/api/loot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: next }),
          });
        }}
        onTestRevealItem={(item) => {
          void sendControl('custom', `revealCustom:${item.id}`);
        }}
      />

      <GiftManager
        rules={giftRules}
        onSaveRules={async (next) => {
          await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rules: next }),
          });
        }}
        onResetDefaults={async () => {
          await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reset: true }),
          });
        }}
        onTestGift={(rule) => {
          void asPlayer('tranh', (u) =>
            emitTest('gift', {
              ...u,
              giftName: rule.giftName || rule.title,
              giftId: rule.giftId || 0,
              diamondCount: rule.diamondCount || 1,
              repeatCount: 1,
              iconUrl: rule.iconUrl,
            }),
          );
        }}
      />

      <Row title="Mô phỏng phiên LIVE 30 phút">
        <B onClick={() => startSim('full')}>Live đông (giật rương liên hoàn)</B>
        <B onClick={() => startSim('low')}>Live ít người</B>
        <B onClick={() => sim.current?.()}>Dừng</B>
        {simInfo && <div className="w-full text-sm text-amber-300">{simInfo}</div>}
      </Row>

      <Row title="Đồ họa sân khấu">
        <B onClick={() => saveMc({ graphics: 'full' })} on={mc.graphics !== 'lite'}>
          Chuẩn
        </B>
        <B onClick={() => saveMc({ graphics: 'lite' })} on={mc.graphics === 'lite'}>
          Nhẹ (30 FPS)
        </B>
        {stats && (
          <span className="text-xs text-slate-400">
            Xem trước: {stats.fps} FPS · {stats.frameP95 ?? 0} ms p95 · Vòng #{stats.round} · 🏛️ {stats.museumCount} bảo vật ({stats.museumValue.toLocaleString('vi-VN')} xu)
          </span>
        )}
      </Row>

      <Row title="Âm lượng trên live (đổi ngay, lưu cho lần sau)">
        <Vol label="Nhạc nền" value={mc.musicVol} max={1.5} onChange={(v) => saveMc({ musicVol: v })} />
        <Vol label="Hiệu ứng" value={mc.sfxVol} max={1.5} onChange={(v) => saveMc({ sfxVol: v })} />
        <Vol label="Giọng MC" value={mc.mcVol} max={1} onChange={(v) => saveMc({ mcVol: v })} />
      </Row>
    </section>
  );
}

export function LeaderboardButton({ stats, onAfterClick }: { stats?: GameStats | null; onAfterClick?: () => void }) {
  const [polled, setPolled] = useState<GameStats | null>(null);
  const sync = () => setPolled(gameApi()?.stats() ?? null);
  useEffect(() => {
    if (stats !== undefined) return;
    sync();
    const timer = setInterval(sync, 500);
    return () => clearInterval(timer);
  }, [stats]);
  const s = stats !== undefined ? stats : polled;
  const pinned = !!s?.leaderboardPinned;
  const open = !!s?.leaderboardOpen;
  const label = !s ? '🏛️ Tủ Bảo Tàng' : pinned ? '✕ Đóng Tủ' : open ? '📌 Giữ Tủ' : '🏛️ Tủ Bảo Tàng';
  const action = !s ? 'toggleLeaderboard' : pinned ? 'hideLeaderboard' : 'showLeaderboard';
  return (
    <B
      onClick={() => {
        void sendControl('custom', action).then(() => {
          onAfterClick?.();
          if (stats === undefined) setTimeout(sync, 150);
        });
      }}
      on={pinned}
    >
      {label}
    </B>
  );
}

export type ViewMode = 'game' | 'both' | 'panel';
export function ViewSwitch({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const opts: [ViewMode, string][] = [
    ['game', 'Chỉ game'],
    ['both', 'Game + bảng điều khiển'],
    ['panel', 'Chỉ bảng điều khiển'],
  ];
  return (
    <div className="flex gap-1 rounded-xl bg-slate-900/90 p-1 ring-1 ring-slate-700 backdrop-blur">
      {opts.map(([m, label]) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === m ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Vol({ label, value, max, onChange }: { label: string; value: string; max: number; onChange: (v: string) => void }) {
  return (
    <label className="flex w-full items-center gap-3 text-sm">
      <span className="w-36 shrink-0">{label}</span>
      <input type="range" min="0" max={max} step="0.05" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      <span className="w-12 text-right tabular-nums">{Math.round(Number(value) * 100)}%</span>
    </label>
  );
}

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs text-slate-400">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function B({ children, onClick, on }: { children: ReactNode; onClick: () => void; on?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-3 py-2 text-sm font-medium ${on ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`}>
      {children}
    </button>
  );
}
