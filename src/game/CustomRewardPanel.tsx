import { useRef, useState } from 'react';
import type { CustomLootItem, LootRarity } from '../live/types';
import { LOOT_RARITY_TIERS } from './chestConfig';
import { uploadGiftImage } from './imageUpload';

interface CustomRewardPanelProps {
  items: CustomLootItem[];
  onSaveItems: (next: CustomLootItem[]) => Promise<void>;
  onTestRevealItem: (item: CustomLootItem) => void;
}

const RARITY_BADGE: Record<LootRarity, string> = {
  troll: 'bg-lime-500/20 text-lime-300 ring-lime-500/40',
  common: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
  rare: 'bg-sky-500/20 text-sky-300 ring-sky-500/40',
  epic: 'bg-purple-500/20 text-purple-300 ring-purple-500/40',
  legendary: 'bg-amber-500/25 text-amber-300 ring-amber-400/50',
};

const QUICK_EMOJIS = ['🎁', '💎', '👑', '📱', '🧸', '⌚', '🪙', '🩴', '🧧', '🏆'];

export function CustomRewardPanel({ items, onSaveItems, onTestRevealItem }: CustomRewardPanelProps) {
  const [editing, setEditing] = useState<CustomLootItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const commit = async (next: CustomLootItem[]) => {
    setSaving(true);
    try {
      await onSaveItems(next);
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setIsNew(true);
    setEditing({
      id: `loot_${Date.now().toString(36)}`,
      name: '',
      rarity: 'legendary',
      valueXu: 5000,
      icon: '🎁',
      imageUrl: '',
      enabled: true,
    });
  };

  const openEdit = (item: CustomLootItem) => {
    setIsNew(false);
    setEditing({ ...item });
  };

  const saveDraft = (draft: CustomLootItem) => {
    const cleaned: CustomLootItem = {
      ...draft,
      name: draft.name.trim() || 'Quà Bí Ẩn',
      valueXu: Math.max(0, Math.round(Number(draft.valueXu) || 0)),
      icon: draft.icon.trim() || '🎁',
      imageUrl: draft.imageUrl?.trim() || '',
    };
    const next = isNew ? [cleaned, ...items] : items.map((x) => (x.id === cleaned.id ? cleaned : x));
    setEditing(null);
    void commit(next);
  };

  const toggleItem = (id: string) => {
    void commit(items.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  };

  const removeItem = (id: string) => {
    void commit(items.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-3 rounded-xl bg-slate-950/60 p-3.5 ring-1 ring-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100">Kho quà / vật phẩm thủ công trong rương</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Tự thêm quà kèm hình ảnh riêng, chọn cấp bậc độ hiếm để kích hoạt hiệu ứng nổ tung giữa màn hình khi mở rương.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          disabled={saving}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          + Thêm quà thủ công (có ảnh)
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-400">
          Chưa có quà thủ công nào. Bấm <b>+ Thêm quà thủ công (có ảnh)</b> để thêm vật phẩm kèm ảnh tự chọn vào rương &amp; mở thử ngay giữa màn hình.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {items.map((item) => {
            const tierMeta = LOOT_RARITY_TIERS.find((t) => t.id === item.rarity) || LOOT_RARITY_TIERS[2];
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition ${
                  item.enabled ? 'border-slate-700 bg-slate-900/90' : 'border-slate-800 bg-slate-900/40 opacity-60'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 shrink-0 rounded-lg bg-slate-950 object-contain p-0.5 ring-1 ring-slate-700"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-2xl ring-1 ring-slate-700">
                      {item.icon || '🎁'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-100">{item.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className={`rounded px-1.5 py-0.5 font-semibold ring-1 ${RARITY_BADGE[item.rarity]}`}>
                        {tierMeta.label}
                      </span>
                      <span className="font-semibold text-amber-300">{item.valueXu.toLocaleString('vi-VN')} xu</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onTestRevealItem(item)}
                    className="rounded-md bg-amber-500/20 px-2 py-1 font-semibold text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30"
                    title="Mở thử vật phẩm này ngay giữa màn hình"
                  >
                    ▶ Mở thử
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-md bg-slate-800 px-2 py-1 text-slate-200 hover:bg-slate-700"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="rounded-md bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                  >
                    {item.enabled ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-md bg-slate-800 px-2 py-1 text-red-300 hover:bg-red-950/60"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <CustomRewardModal
          draft={editing}
          isNew={isNew}
          onSave={saveDraft}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CustomRewardModal({
  draft,
  isNew,
  onSave,
  onClose,
}: {
  draft: CustomLootItem;
  isNew: boolean;
  onSave: (next: CustomLootItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CustomLootItem>(draft);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const url = await uploadGiftImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="w-full max-w-lg space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-base font-bold text-emerald-300">
            {isNew ? 'Thêm quà thủ công vào rương' : `Sửa quà · ${draft.name}`}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700">
            Đóng ✕
          </button>
        </div>

        <label className="block text-xs text-slate-300">
          Tên quà / vật phẩm
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ví dụ: Túi Mù Labubu, Tai Nghe Gaming, Thỏi Vàng..."
            className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-emerald-500"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-300">
            Cấp bậc độ hiếm (Hiệu ứng mở rương)
            <select
              value={form.rarity}
              onChange={(e) => {
                const rarity = e.target.value as LootRarity;
                const meta = LOOT_RARITY_TIERS.find((t) => t.id === rarity);
                setForm({ ...form, rarity, valueXu: meta?.defaultXu ?? form.valueXu });
              }}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700"
            >
              {LOOT_RARITY_TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-amber-300/90">
              {LOOT_RARITY_TIERS.find((t) => t.id === form.rarity)?.effectHint}
            </span>
          </label>

          <label className="text-xs text-slate-300">
            Giá trị hiển thị (xu)
            <input
              type="number"
              min={0}
              value={form.valueXu}
              onChange={(e) => setForm({ ...form, valueXu: Math.max(0, Number(e.target.value) || 0) })}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700"
            />
          </label>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-950/70 p-3 ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-xl bg-slate-900 object-contain p-1 ring-1 ring-slate-700"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-3xl ring-1 ring-slate-700">
                  {form.icon || '🎁'}
                </div>
              )}
              <div className="text-xs">
                <div className="font-semibold text-slate-100">Hình ảnh vật phẩm</div>
                <div className="text-slate-400">
                  {form.imageUrl ? 'Đang dùng ảnh tùy chỉnh' : 'Đang dùng biểu tượng Emoji'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50"
              >
                {uploading ? 'Đang tải...' : '📁 Tải ảnh từ máy'}
              </button>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>

          <label className="block text-[11px] text-slate-400">
            Hoặc dán link ảnh (https://...)
            <input
              value={form.imageUrl || ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/qua.png"
              className="mt-0.5 w-full rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100 ring-1 ring-slate-700"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Emoji dự phòng:</span>
            {QUICK_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setForm({ ...form, icon: em })}
                className={`rounded-md px-1.5 py-0.5 text-base ${
                  form.icon === em ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          {uploadErr && <div className="text-xs text-rose-400">⚠️ {uploadErr}</div>}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700">
            Hủy
          </button>
          <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400">
            {isNew ? 'Lưu quà vào rương' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
