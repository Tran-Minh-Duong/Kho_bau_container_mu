const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '../public');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/game.html' : pathname));
  const type = types[path.extname(file)];
  if (req.method !== 'GET' || !file.startsWith(root + path.sep) || !type) {
    res.writeHead(404).end();
    return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/game.html?mute=1&embed=1`;
  console.log(`Server listening on ${url}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve(__dirname, 'tmp-chrome');
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + tmpDir,
    '--window-size=1080,1920',
    '--remote-debugging-port=9223',
    url,
  ];

  console.log('Launching Headless Chrome...');
  const chrome = spawn(chromePath, chromeArgs, { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9223/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.url.includes('game.html')) || tabs[0];
    if (!pageTab || !pageTab.webSocketDebuggerUrl) {
      throw new Error('No debugger websocket found');
    }

    const WebSocket = globalThis.WebSocket;
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const runtimeErrors = [];
    await send('Runtime.enable');
    await send('Console.enable');
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        runtimeErrors.push(data.params.exceptionDetails?.text || 'Runtime exception');
      }
    });

    await send('Page.enable');
    await send('Page.navigate', { url });

    for (let i = 0; i < 20; i++) {
      const check = await send('Runtime.evaluate', { expression: 'typeof window.GAME_API === "object" && window.GAME_API !== null' });
      if (check?.result?.value === true) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    const evalResult = await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const report = [];
        const api = window.GAME_API;
        if (!api) return { ok: false, error: 'window.GAME_API is missing' };

        const matchHeader = document.getElementById('matchHeaderRow');
        const clock = document.getElementById('clock');
        const joinRow = document.getElementById('joinRow');
        const museumCabinet = document.getElementById('museumCabinet');
        const giftRows = document.getElementById('giftRows');

        report.push({ check: 'matchHeaderRow exists', pass: !!matchHeader });
        report.push({ check: 'clock exists', pass: !!clock && clock.textContent.includes(':') });
        report.push({ check: 'joinRow shows 1/2/3, tranh, lac', pass: !!joinRow && joinRow.textContent.includes('1 / 2 / 3') && joinRow.textContent.includes('tranh') && joinRow.textContent.includes('lac') });
        report.push({ check: 'museumCabinet exists', pass: !!museumCabinet });
        report.push({
          check: 'giftRows populated with Vietnamese TikTok gift names',
          pass: !!giftRows && giftRows.children.length === 5 && giftRows.textContent.includes('Hoa hồng') && giftRows.textContent.includes('Bó hoa hồng') && giftRows.textContent.includes('Bánh vòng') && giftRows.textContent.includes('Mũ lưỡi trai') && giftRows.textContent.includes('Cún Corgi'),
          got: giftRows?.textContent,
        });

        // Test 2: Scout phase & comments (1/2/3, tranh, lac) + likes
        api.jumpPhase('scout');
        await new Promise((r) => setTimeout(r, 150));
        api.event({ type: 'comment', user: 'u1', name: 'Lan Anh', text: '2' });
        api.event({ type: 'comment', user: 'u2', name: 'Minh Tuấn', text: '2' });
        api.event({ type: 'comment', user: 'u3', name: 'Bé Na', text: 'tranh' });
        api.event({ type: 'comment', user: 'u4', name: 'Quốc Bảo', text: 'lac' });
        api.event({ type: 'like', user: 'u2', name: 'Minh Tuấn', count: 160 });
        await new Promise((r) => setTimeout(r, 200));

        let st = api.stats();
        report.push({ check: 'Comment counter exact (4 comments)', pass: st.cmtTotal === 4, got: st.cmtTotal });
        report.push({ check: 'Votes on chest #2 == 2', pass: st.votes[1] === 2, got: st.votes[1] });
        report.push({ check: 'Shake meter increased & clue revealed', pass: st.shakeMeter > 50 && st.cluesRevealed >= 1, got: { shake: st.shakeMeter, clues: st.cluesRevealed } });

        return { ok: true, report };
      })()`,
      returnByValue: true,
    });

    // Capture Scout Phase screenshot showing the 3 chests on the conveyor belt
    const scoutShot = await send('Page.captureScreenshot', { format: 'png' });
    if (scoutShot?.data) {
      fs.writeFileSync(path.resolve(__dirname, 'stage_scout_screenshot.png'), Buffer.from(scoutShot.data, 'base64'));
      console.log('Captured 3-chest scout screenshot to tools/stage_scout_screenshot.png');
    }

    const evalPhase2 = await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const report = [];
        const api = window.GAME_API;

        // Test 3: Auction & 5s last-second snipe steal
        api.jumpPhase('auction');
        api.event({ type: 'gift', user: 'u1', name: 'Lan Anh', giftName: 'Bánh vòng', giftId: 5879, coins: 30, count: 1 });
        await new Promise((r) => setTimeout(r, 120));
        st = api.stats();
        report.push({ check: 'Top 1 is Lan Anh (30 xu)', pass: st.topBidder?.name === 'Lan Anh' && st.topBidder?.bidXu === 30, got: st.topBidder });

        api.jumpPhase('snipe5s');
        await new Promise((r) => setTimeout(r, 100));
        api.event({ type: 'gift', user: 'u2', name: 'Minh Tuấn', giftName: 'Mũ lưỡi trai', giftId: 6104, coins: 99, count: 1 });
        await new Promise((r) => setTimeout(r, 150));
        st = api.stats();
        report.push({ check: 'Snipe steal extended clock & changed Top 1 to Minh Tuấn', pass: st.snipeCount === 1 && st.topBidder?.name === 'Minh Tuấn' && st.topBidder?.bidXu >= 99, got: st });

        // Test 4: VIP Cún Corgi upgrades chest to dragonSafe
        api.event({ type: 'gift', user: 'u3', name: 'Bé Na', giftName: 'Cún Corgi', giftId: 6267, coins: 299, count: 1 });
        await new Promise((r) => setTimeout(r, 150));
        st = api.stats();
        report.push({ check: 'Cún Corgi upgrades chest to dragonSafe & Bé Na Top 1', pass: st.activeChestTier === 'dragonSafe' && st.topBidder?.name === 'Bé Na', got: st });

        // Test 5: Reveal Jackpot -> Center Showcase (legendary) & pinned to Museum Cabinet
        api.testReveal('jackpot');
        await new Promise((r) => setTimeout(r, 750));
        st = api.stats();
        const museumGrid = document.getElementById('museumGrid');
        const centerOverlay = document.getElementById('centerRevealOverlay');
        report.push({
          check: 'Center reveal overlay active with legendary tier',
          pass: !!centerOverlay && centerOverlay.classList.contains('on') && centerOverlay.getAttribute('data-rarity') === 'legendary',
        });
        report.push({ check: 'Museum has 1 item & Bé Na owner', pass: st.museumCount === 1 && museumGrid.textContent.includes('Bé Na') && museumGrid.textContent.includes('Ngọc Tỷ'), got: st.museumCount });

        // Test 6: Per-round gift reset check (topHunters + giftPodium reset while museum keeps previous round item)
        const roundBeforeNew = st.round;
        api.newRound();
        api.toggleLeaderboard(true);
        await new Promise((r) => setTimeout(r, 80));
        st = api.stats();
        const topHuntersTextAfterReset = document.getElementById('topHunters')?.textContent || '';
        const giftPodiumTextAfterReset = document.getElementById('giftPodium')?.textContent || '';
        api.toggleLeaderboard(false);
        report.push({
          check: 'Gifts reset cleanly per round while museum keeps Round 1 item',
          pass: st.round === roundBeforeNew + 1 && st.roundGiftXu === 0 && st.topBidder === null && st.museumCount === 1 && !topHuntersTextAfterReset.includes('Bé Na') && !giftPodiumTextAfterReset.includes('Bé Na'),
          got: { round: st.round, roundGiftXu: st.roundGiftXu, topBidder: st.topBidder, museumCount: st.museumCount },
        });

        // Test 7: Continuous heavy gift spam (250 back-to-back gifts across 20 viewers)
        api.jumpPhase('auction');
        const tSpam0 = performance.now();
        let expectedRoundXu = 0;
        for (let i = 0; i < 250; i++) {
          const idx = (i % 20) + 1;
          const isDonut = i % 15 === 0;
          const coins = isDonut ? 30 : 1;
          expectedRoundXu += coins;
          api.event({
            type: 'gift',
            user: 'spammer_' + idx,
            name: 'Spammer ' + idx,
            giftName: isDonut ? 'Bánh vòng' : 'Hoa hồng',
            giftId: isDonut ? 5879 : 5655,
            coins,
            count: 1,
          });
        }
        const spamDispatchMs = Number((performance.now() - tSpam0).toFixed(2));
        await new Promise((r) => setTimeout(r, 120));
        st = api.stats();
        const topHuntersAfterSpam = document.getElementById('topHunters')?.textContent || '';
        report.push({
          check: '250 continuous gifts processed with zero loss & low latency',
          pass: st.roundGiftXu === expectedRoundXu && spamDispatchMs < 150 && topHuntersAfterSpam.includes('Spammer'),
          got: { expectedRoundXu, gotXu: st.roundGiftXu, spamDispatchMs, topBidder: st.topBidder, fps: st.fps, frameP95: st.frameP95 },
        });

        // Test 8: Custom Image Reward reveal + Museum Cabinet
        api.event({ type: 'gift', user: 'u4', name: 'Quốc Bảo', giftName: 'Cún Corgi', giftId: 6267, coins: 299, count: 1 });
        api.setLoot([{ id: 'custom_1', name: 'Corgi Hoàng Kim', rarity: 'epic', valueXu: 2500, icon: '🐶', imageUrl: 'img/game/gift_corgi.webp', enabled: true }]);
        api.testRevealCustom('custom_1');
        await new Promise((r) => setTimeout(r, 950));
        st = api.stats();
        const revVisualImg = document.querySelector('#revVisual img');
        report.push({
          check: 'Center reveal shows custom image & epic tier',
          pass: !!centerOverlay && centerOverlay.getAttribute('data-rarity') === 'epic' && !!revVisualImg && revVisualImg.getAttribute('src').includes('gift_corgi.webp'),
        });
        report.push({ check: 'Museum has 2 items including custom reward', pass: st.museumCount === 2 && museumGrid.textContent.includes('Corgi Hoàng Kim') && museumGrid.textContent.includes('Quốc Bảo'), got: st.museumCount });

        // Test 9: Screenshot stage check before modal, then modal toggle & reset
        return { ok: true, report };
      })()`,
      returnByValue: true,
    });

    const combinedReport = [...(evalResult.result.value?.report || []), ...(evalPhase2.result.value?.report || [])];
    console.log('\n--- BROWSER EVALUATION RESULTS ---');
    console.log(JSON.stringify({ ok: evalResult.result.value?.ok && evalPhase2.result.value?.ok, report: combinedReport }, null, 2));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshot?.data) {
      fs.writeFileSync(path.resolve(__dirname, 'stage_screenshot.png'), Buffer.from(screenshot.data, 'base64'));
      console.log('Captured stage screenshot to tools/stage_screenshot.png');
    }

    // Verify modal & clean reset after screenshot
    const resetRes = await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const api = window.GAME_API;
        api.toggleLeaderboard(true);
        await new Promise((r) => setTimeout(r, 100));
        const modalOpen = document.getElementById('result').classList.contains('on');
        api.newSession();
        await new Promise((r) => setTimeout(r, 120));
        const st = api.stats();
        return { modalOpen, museumReset: st.museumCount === 0 && st.round === 1 };
      })()`,
      returnByValue: true,
    });
    console.log('Modal & Reset check:', JSON.stringify(resetRes.result.value));

    const value = { ok: evalResult.result.value?.ok && evalPhase2.result.value?.ok, report: combinedReport };
    if (!value.ok) process.exit(1);
    const failed = value.report.filter((r) => !r.pass);
    if (failed.length > 0 || !resetRes.result.value?.modalOpen || !resetRes.result.value?.museumReset || runtimeErrors.length > 0) {
      console.error('Failed checks or runtime errors:', { failed, reset: resetRes.result.value, runtimeErrors });
      process.exit(1);
    }

    console.log('\n✓ ALL IN-BROWSER TESTS PASSED PERFECTLY!');
    try { ws.onerror = null; ws.close(); } catch {}
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    try { chrome.kill(); } catch {}
    try { server.closeAllConnections?.(); server.close(); } catch {}
    setTimeout(() => {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      process.exit(process.exitCode || 0);
    }, 250);
  }
});
