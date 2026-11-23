/* Fondo animado: manchas de luz que se mueven despacio y residuos reciclables
   (hojas, botellas, latas, papel, gotas) flotando. Al tocar la pantalla se apartan.
   window.fondoBurst(x, y) lanza una lluvia de hojas (se usa al acertar). */
{
  const cv = document.getElementById('fondo');
  const ctx = cv.getContext('2d');
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  const oscuro = matchMedia('(prefers-color-scheme: dark)');
  const esOscuro = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : oscuro.matches;
  };

  let W = 0, H = 0, dpr = 1, parts = [], confeti = [], t0 = performance.now(), raf = 0;
  const toque = { x: -999, y: -999, f: 0 };

  /* Formas dibujadas a mano (coordenadas centradas, tamaño ~1) */
  const formas = {
    hoja(c, col) {
      c.fillStyle = col;
      c.beginPath(); c.moveTo(0, -1); c.bezierCurveTo(.75, -.55, .7, .55, 0, 1); c.bezierCurveTo(-.7, .55, -.75, -.55, 0, -1); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .08;
      c.beginPath(); c.moveTo(0, -.8); c.lineTo(0, .9); c.stroke();
    },
    botella(c, col) {
      c.fillStyle = col;
      c.beginPath();
      c.roundRect(-.38, -.35, .76, 1.35, .22); c.fill();
      c.beginPath(); c.moveTo(-.38, -.3); c.quadraticCurveTo(-.36, -.7, -.16, -.78); c.lineTo(.16, -.78); c.quadraticCurveTo(.36, -.7, .38, -.3); c.fill();
      c.fillRect(-.16, -1, .32, .26);
      c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(-.24, -.2, .1, .95);
    },
    lata(c, col) {
      c.fillStyle = col;
      c.beginPath(); c.roundRect(-.45, -.8, .9, 1.6, .14); c.fill();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-.45, -.3, .9, .22);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-.45, -.8, .9, .1);
    },
    papel(c, col) {
      c.fillStyle = col;
      c.beginPath(); c.moveTo(-.6, -.8); c.lineTo(.3, -.8); c.lineTo(.6, -.5); c.lineTo(.6, .8); c.lineTo(-.6, .8); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,130,140,.45)'; c.lineWidth = .08;
      for (let y = -.35; y <= .55; y += .3) { c.beginPath(); c.moveTo(-.4, y); c.lineTo(.4, y); c.stroke(); }
    },
    gota(c, col) {
      c.fillStyle = col;
      c.beginPath(); c.moveTo(0, -1); c.bezierCurveTo(.6, -.2, .7, .3, .7, .45); c.arc(0, .45, .7, 0, Math.PI); c.bezierCurveTo(-.7, .3, -.6, -.2, 0, -1); c.fill();
    },
    reciclar(c, col) {
      c.strokeStyle = col; c.lineWidth = .22; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        c.save(); c.rotate(i * 2.094);
        c.beginPath(); c.arc(0, 0, .7, -1.25, -.15); c.stroke();
        c.fillStyle = col; c.beginPath(); c.moveTo(.75, .05); c.lineTo(.45, -.2); c.lineTo(.95, -.25); c.fill();
        c.restore();
      }
    }
  };
  const paleta = () => esOscuro()
    ? { hoja: ['#30D158', '#5BE37D', '#1E9E45'], botella: ['#64D2FF', '#0A84FF'], lata: ['#AEAEB2', '#FFD60A'], papel: ['#E5E5EA'], gota: ['#64D2FF'], reciclar: ['#30D158'] }
    : { hoja: ['#34C759', '#5BD87A', '#1E9E45'], botella: ['#5AC8FA', '#007AFF'], lata: ['#C7C7CC', '#FFCC00'], papel: ['#FFFFFF'], gota: ['#5AC8FA'], reciclar: ['#34C759'] };
  const tipos = ['hoja', 'hoja', 'hoja', 'botella', 'lata', 'papel', 'gota', 'reciclar'];
  const azar = (a, b) => a + Math.random() * (b - a);
  const elegir = a => a[Math.floor(Math.random() * a.length)];

  function crear(y) {
    const tipo = elegir(tipos);
    return {
      tipo, col: elegir(paleta()[tipo]),
      x: azar(0, W), y: y ?? azar(0, H), z: azar(.5, 1.25),
      s: azar(9, 17), r: azar(0, 6.28), vr: 0, vr0: azar(-.4, .4),
      vy: azar(-12, -26), fase: azar(0, 6.28), amp: azar(8, 26),
      dx: 0, dy: 0, a: azar(.35, .7)
    };
  }

  function tam() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const n = Math.round(Math.min(28, Math.max(14, W * H / 26000)));
    while (parts.length < n) parts.push(crear());
    parts.length = n;
  }

  /* Manchas de luz tipo "aurora" */
  function manchas(t) {
    const d = esOscuro();
    const blobs = [
      [.15 + .08 * Math.sin(t * .00011), .18 + .06 * Math.cos(t * .00013), .55, d ? 'rgba(48,209,88,.22)' : 'rgba(52,199,89,.20)'],
      [.85 + .07 * Math.cos(t * .00009), .35 + .08 * Math.sin(t * .00012), .5, d ? 'rgba(10,132,255,.20)' : 'rgba(0,122,255,.13)'],
      [.35 + .1 * Math.sin(t * .00008), .85 + .05 * Math.cos(t * .0001), .6, d ? 'rgba(255,214,10,.10)' : 'rgba(255,204,0,.14)'],
      [.75 + .06 * Math.sin(t * .00014), .95, .45, d ? 'rgba(48,209,88,.14)' : 'rgba(52,199,89,.12)']
    ];
    for (const [bx, by, br, col] of blobs) {
      const R = Math.max(W, H) * br;
      const g = ctx.createRadialGradient(bx * W, by * H, 0, bx * W, by * H, R);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }

  function dibujar(p, x, y, s, rot, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    formas[p.tipo](ctx, p.col);
    ctx.restore();
  }

  let ultimo = performance.now();
  function cuadro(ahora) {
    const dt = Math.min((ahora - ultimo) / 1000, .05); ultimo = ahora;
    const t = ahora - t0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    manchas(t);
    const scroll = window.scrollY;
    toque.f *= .94;

    for (const p of parts) {
      p.y += p.vy * p.z * dt;
      p.r += p.vr * dt;
      /* Empuje al tocar */
      const px = p.x + Math.sin(t * .0006 + p.fase) * p.amp;
      const py = ((p.y - scroll * .12 * p.z) % (H + 60) + H + 60) % (H + 60) - 30;
      const ddx = px - toque.x, ddy = py - toque.y, dist = Math.hypot(ddx, ddy);
      if (toque.f > .02 && dist < 160) {
        const k = (1 - dist / 160) * toque.f * 900 * dt;
        p.dx += ddx / (dist || 1) * k; p.dy += ddy / (dist || 1) * k;
        p.vr += (Math.random() - .5) * toque.f;
      }
      p.dx *= .95; p.dy *= .95; p.vr += (p.vr0 - p.vr) * .02;
      if (p.y < -H * 4) p.y += H * 4;
      dibujar(p, px + p.dx, py + p.dy, p.s * p.z, p.r, p.a * (p.z / 1.25));
    }

    /* Lluvia de hojas */
    for (let i = confeti.length - 1; i >= 0; i--) {
      const c = confeti[i];
      c.vy += 520 * dt; c.vx *= .985; c.vy *= .985;
      c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; c.vida -= dt;
      if (c.vida <= 0 || c.y > H + 40) { confeti.splice(i, 1); continue; }
      dibujar(c, c.x, c.y, c.s, c.r, Math.min(1, c.vida * 1.5));
    }
    raf = requestAnimationFrame(cuadro);
  }

  function estatico() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    manchas(0);
    for (const p of parts) dibujar(p, p.x, p.y, p.s * p.z, p.r, p.a * .8);
  }

  function arrancar() {
    cancelAnimationFrame(raf);
    if (reducir.matches) { estatico(); return; }
    ultimo = performance.now();
    raf = requestAnimationFrame(cuadro);
  }

  window.fondoBurst = (x = W / 2, y = H / 2, n = 26) => {
    if (reducir.matches) return;
    const pal = paleta();
    for (let i = 0; i < n; i++) {
      const tipo = Math.random() < .75 ? 'hoja' : elegir(['reciclar', 'gota']);
      const ang = azar(-Math.PI * .95, -Math.PI * .05), vel = azar(260, 560);
      confeti.push({ tipo, col: elegir(pal[tipo]), x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, s: azar(7, 13), r: azar(0, 6.28), vr: azar(-8, 8), vida: azar(1.1, 1.8) });
    }
  };

  addEventListener('pointerdown', e => { toque.x = e.clientX; toque.y = e.clientY; toque.f = 1; }, { passive: true });
  addEventListener('resize', () => { tam(); if (reducir.matches) estatico(); });
  document.addEventListener('visibilitychange', () => document.hidden ? cancelAnimationFrame(raf) : arrancar());
  reducir.addEventListener?.('change', arrancar);
  oscuro.addEventListener?.('change', () => { parts.forEach(p => p.col = elegir(paleta()[p.tipo])); if (reducir.matches) estatico(); });

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
  }
  tam();
  arrancar();
}