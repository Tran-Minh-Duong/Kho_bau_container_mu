# Kho Báu Container Mù — Đấu Giá Cướp Rương

Game tương tác cho buổi TikTok LIVE theo tâm lý mở hộp mù (Blind Box) và tranh giành phút chót. Băng chuyền chạy qua các kiện hàng/rương khóa kín đủ hạng (từ **Thùng Carton Móp Méo** đến **Két Sắt Rồng Vàng VIP**), bên trong có thể là **Ngọc Tỷ Rồng Vàng nghìn xu** hoặc… **Đôi Dép Tổ Ong Huyền Thoại**.

## Cơ chế tương tác

- **Comment (`1` / `2` / `3`, `tranh`, `lac`)**:
  - `1`, `2`, `3`: Chọn rương muốn đưa lên bục đấu giá.
  - `tranh`: Đăng ký tham gia phiên tranh rương.
  - `lac`: Góp lực lắc rương nghe tiếng động.
- **Thả tim (`❤️`)**: Cả phòng cùng thả tim để làm rương rung lắc và kích hoạt máy quét âm thanh hé lộ gợi ý mơ hồ về độ hiếm bên trong.
- **Quà tặng (`🎁`)**: Tính theo từng vòng đấu để đẩy giá giành quyền Top 1, soi gợi ý ngay (**Bó hoa hồng**), nâng cấp thẳng lên **Két Sắt Rồng Vàng** (**Cún Corgi**), hoặc **giật rương của Top 1 ở 5 giây đếm ngược cuối** (tự động gia hạn chống snipe thêm tới 5 giây, tối đa 3 lần).
- **Mở rương & Tủ Bảo Tàng (`🏛️`)**: Hiện vật mở được bung lớn giữa màn hình với hiệu ứng theo cấp độ hiếm (`troll` -> `legendary`) và trưng bày vào Tủ Bảo Tàng gắn tên & avatar người sở hữu suốt buổi LIVE. Có thể thêm vật phẩm + ảnh tùy chỉnh ngay trên bảng điều khiển.

## ⚠️ Lưu ý & Trách nhiệm

1. **Đồ hoạ và vật phẩm là mô phỏng giải trí**: Rương, két sắt và bảo vật chỉ là đồ họa trong game, không phải hiện vật thật.
2. **Không dùng game để cá cược hay trao thưởng**: Game chỉ trưng bày tên & avatar người thắng lên Tủ Bảo Tàng cho vui, không quy đổi tiền mặt hoặc giải thưởng.
3. **Tiền quà là thu nhập của người live**: Việc kê khai, nộp thuế do chủ kênh tự tìm hiểu theo quy định hiện hành.
4. **Kết nối và giọng đọc dùng công cụ không chính thức**: Sử dụng `tiktok-live-connector` và `msedge-tts` / Google TTS / VieNeu cục bộ.
5. **Bộ lọc từ tục không bắt được hết**: Chỉ nhận từ khóa lệnh hợp lệ (`1`, `2`, `3`, `tranh`, `lac`) và lọc tên nhạy cảm, MC không đọc tự do bình luận người xem.
6. **Cấu hình quà tặng**: Chỉnh trực tiếp trong mục **Quà đấu giá & cướp rương** trên bảng điều khiển hoặc sửa `src/game/gifts.ts`, `src/game/chestConfig.ts`.
7. **Dùng game là bạn tự chịu trách nhiệm**: Mã nguồn chia sẻ nguyên trạng, không kèm cam kết pháp lý.

---

## Chạy game & Cấu trúc dự án

### Chạy
- **Xem thử nhanh (không cần internet / không cần cài thư viện)**: Bấm đúp `XEM-DEMO.bat`.
- **Chạy bản LIVE đầy đủ**: Cài Node.js (LTS), bấm đúp `BAT-LIVE.bat`. Lần đầu tự cài thư viện, xong tự mở trang điều khiển tại `http://localhost:3000`.
- **TikTok LIVE Studio**: Thêm nguồn Browser/Link `http://lvh.me:3000/?view=stage`, khổ `1080×1920`.

### Cấu trúc
- `public/game.html`, `public/stage-visuals.js`: Sân khấu 1080×1920 (băng chuyền, lắc rương, đấu giá 5s cuối, Tủ Bảo Tàng, âm thanh & giọng MC).
- `public/img/game/`, `public/sound/`: Biểu tượng quà TikTok và hiệu ứng âm thanh `.wav`.
- `src/game/`: Nối sự kiện TikTok (`useGame.ts`), cấu hình rương & bảo vật (`chestConfig.ts`), phân tích lệnh (`commandParser.ts`), quản lý quà (`GiftManager.tsx`, `gifts.ts`), nút điều khiển (`GameControls.tsx`).
- `src/live/`, `server.ts`: Kết nối TikTok LIVE SSE, TTS `/api/tts`, bảng điều khiển `Dashboard.tsx`, `BAT-LIVE.bat`.
- `tools/`: `demo-server.cjs` và kiểm thử trình duyệt headless `test_browser_headless.cjs`.
