(() => {
  'use strict';

  const CHEST_SRCS = {
    carton: 'img/game/chest_carton.png',
    crate: 'img/game/chest_crate.png',
    steel: 'img/game/chest_steel.png',
    royal: 'img/game/chest_royal.png',
    dragonSafe: 'img/game/chest_dragon.png',
  };

  const SPRITE_TEX = {};
  for (const [tier, src] of Object.entries(CHEST_SRCS)) {
    const img = new Image();
    const entry = { img, ready: false };
    img.onload = () => { entry.ready = true; };
    img.src = src + '?v=2';
    SPRITE_TEX[tier] = entry;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  /**
   * Vẽ 5 hạng kiện hàng / rương mù bằng sprite minh họa 3D chất lượng cao,
   * kèm hiệu ứng rung lắc vật lý, hào quang lửa rồng, tia sáng mở khóa và tia quét âm thanh.
   */
  function drawContainer(ctx, opts) {
    const {
      tier = 'carton',
      x = 0,
      y = 0,
      scale = 1,
      shake = 0,
      openAmt = 0,
      now = 0,
      selected = false,
      activeAuction = false,
      snipeAlert = false,
      clueLevel = 0,
    } = opts;

    ctx.save();
    ctx.translate(x, y);

    // Vật lý rung lắc khi thả tim hoặc gõ lac
    if (shake > 0.01) {
      const ang = Math.sin(now * 40) * 0.12 * shake;
      const hop = -Math.abs(Math.sin(now * 30)) * 13 * shake;
      ctx.translate(Math.sin(now * 54) * 6 * shake, hop);
      ctx.rotate(ang);
    }

    ctx.scale(scale, scale);

    // Bóng đổ tiếp xúc trên băng chuyền
    ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
    ctx.beginPath();
    ctx.ellipse(0, 74, 96, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hào quang bệ chọn / lửa rồng / ma pháp hoàng gia
    if (selected || activeAuction || tier === 'dragonSafe' || tier === 'royal') {
      const pulse = 0.72 + Math.sin(now * (snipeAlert ? 12 : 4)) * 0.28;
      const glowCol = snipeAlert
        ? `rgba(239, 68, 68, ${0.46 * pulse})`
        : tier === 'dragonSafe'
          ? `rgba(245, 158, 11, ${0.48 * pulse})`
          : tier === 'royal'
            ? `rgba(168, 85, 247, ${0.42 * pulse})`
            : tier === 'steel'
              ? `rgba(56, 189, 248, ${0.32 * pulse})`
              : `rgba(251, 191, 36, ${0.26 * pulse})`;
      const rg = ctx.createRadialGradient(0, 12, 16, 0, 12, 146);
      rg.addColorStop(0, glowCol);
      rg.addColorStop(0.65, glowCol.replace(/[\d.]+\)$/, '0.14)'));
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(0, 12, 146, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lửa & đốm sáng đặc trưng cho Két Rồng Vàng & Rương Hoàng Gia
    if (tier === 'dragonSafe') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const phase = (now * 1.4 + i * 0.37) % 1;
        const fx = Math.sin(i * 2.1 + now * 3) * 76;
        const fy = 58 - phase * 145;
        const fr = (1 - phase) * 26 + 6;
        const fg = ctx.createRadialGradient(fx, fy, 1, fx, fy, fr);
        fg.addColorStop(0, `rgba(254, 240, 138, ${0.42 * (1 - phase)})`);
        fg.addColorStop(0.5, `rgba(249, 115, 22, ${0.28 * (1 - phase)})`);
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (tier === 'royal') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const phase = (now * 0.9 + i * 0.43) % 1;
        const sx = Math.cos(i * 1.9 + now * 1.6) * 82;
        const sy = 40 - phase * 125;
        ctx.fillStyle = i % 2 === 0
          ? `rgba(216, 180, 254, ${0.85 * (1 - phase)})`
          : `rgba(253, 224, 71, ${0.8 * (1 - phase)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 + (1 - phase) * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Luồng sáng mở rương khi Reveal
    if (openAmt > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beamCol = tier === 'dragonSafe' || tier === 'royal' ? '253, 224, 71' : '125, 211, 252';
      const lg = ctx.createLinearGradient(0, 20, 0, -195);
      lg.addColorStop(0, `rgba(${beamCol}, ${0.9 * openAmt})`);
      lg.addColorStop(0.55, `rgba(${beamCol}, ${0.38 * openAmt})`);
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(-54, 0);
      ctx.lineTo(-120 * openAmt - 32, -195);
      ctx.lineTo(120 * openAmt + 32, -195);
      ctx.lineTo(54, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const tex = SPRITE_TEX[tier];
    if (tex && tex.ready) {
      // Hoạt ảnh nảy bùng nổ khi mở rương
      const openPop = openAmt > 0 ? 1 + Math.sin(Math.min(1, openAmt) * Math.PI) * 0.14 : 1;
      const sx = openAmt > 0 ? 1 + openAmt * 0.06 : 1;
      const sy = openPop;
      const size = tier === 'dragonSafe' ? 204 : tier === 'royal' ? 196 : 186;

      ctx.save();
      ctx.scale(sx, sy);
      if (openAmt > 0.15) {
        ctx.shadowColor = tier === 'dragonSafe' || tier === 'royal' ? '#fde047' : '#38bdf8';
        ctx.shadowBlur = 24 * openAmt;
      }
      ctx.drawImage(tex.img, -size / 2, -size / 2 - 6, size, size);

      // Tia sáng chói ở khe mở khi bùng phát bảo vật
      if (openAmt > 0.08) {
        ctx.globalCompositeOperation = 'lighter';
        const burstG = ctx.createRadialGradient(0, -10, 4, 0, -10, 88 * openAmt);
        burstG.addColorStop(0, `rgba(255, 255, 255, ${0.9 * openAmt})`);
        burstG.addColorStop(0.45, `rgba(253, 224, 71, ${0.55 * openAmt})`);
        burstG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = burstG;
        ctx.beginPath();
        ctx.arc(0, -10, 88 * openAmt, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Fallback vector trong tích tắc trước khi ảnh tải xong
      ctx.fillStyle = tier === 'dragonSafe' ? '#eab308' : tier === 'royal' ? '#7e22ce' : tier === 'steel' ? '#0284c7' : '#a16207';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      roundRectPath(ctx, -74, -56, 148, 118, 14);
      ctx.fill();
      ctx.stroke();
    }

    // Tia quét âm thanh khi người xem thả tim / gõ lac
    if (clueLevel > 0 && openAmt < 0.05) {
      ctx.save();
      const scanY = Math.sin(now * 4.5) * 62;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-88, scanY);
      ctx.lineTo(88, scanY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  window.StageVisuals = { drawContainer, SPRITE_TEX };
})();
