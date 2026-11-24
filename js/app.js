{
  /* ---------- Utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bb_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bb_' + k, JSON.stringify(v)); } catch { } }
  };
  const fiesta = el => {
    if (!window.fondoBurst || !el) return;
    const r = el.getBoundingClientRect();
    window.fondoBurst(r.left + r.width / 2, r.top + r.height / 2);
  };
  const vibrar = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch { } };

  const toastEl = $('#toast');
  let toastT;
  const toast = msg => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* Bolsa dibujada en SVG */
  const bagSVG = key => {
    const b = BOLSAS[key];
    const fill = b.color;
    const stroke = key === 'blanca' ? '#C7C7CC' : key === 'negra' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.15)';
    const shine = key === 'negra' ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.35)';
    const mark = key === 'especial'
      ? '<path d="M50 52v18" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="82" r="4.5" fill="#fff"/>'
      : key === 'blanca'
        ? '<path d="M38 74c-6-14 4-26 22-28-2 16-8 26-22 28zm0 0c6-8 12-14 18-20" fill="none" stroke="#30B350" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
        : '';
    return `<svg viewBox="0 0 100 130" aria-hidden="true">
      <path d="M40 30 C34 18 40 8 50 14 C60 8 66 18 60 30" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M38 30 Q50 36 62 30 L66 36 C88 50 94 84 90 108 C88 122 78 126 50 126 C22 126 12 122 10 108 C6 84 12 50 34 36 Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M24 56 C18 74 18 92 22 108" stroke="${shine}" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${mark}
    </svg>`;
  };
  const bagPill = key => {
    const b = BOLSAS[key];
    return `<span class="pill" style="background:${key === 'blanca' ? 'var(--card2)' : b.color};color:${key === 'blanca' ? 'var(--ink)' : b.tinta}">
      <span class="dot" style="background:${b.color}"></span>${b.nombre}</span>`;
  };

  /* ---------- Navegación por pestañas ---------- */
  const titulos = { inicio: 'ProAmbientes', guia: 'Guía', reto: 'Reto', reglas: 'Reglas', seguimiento: 'Seguimiento' };
  const nav = $('#nav');
  /* Modo reciclador: la pestaña Seguimiento solo aparece en los celulares desbloqueados con PIN */
  const esReciclador = () => store.get('modo', '') === 'reciclador';
  const aplicarModo = () => {
    const on = esReciclador();
    document.documentElement.classList.toggle('modo-reciclador', on);
    $('.tabbar a[data-tab=seguimiento]').hidden = !on;
  };
  const mostrar = () => {
    const v = (location.hash || '#inicio').slice(1);
    if (v === 'reciclador') {
      history.replaceState(null, '', location.pathname + (esReciclador() ? '#seguimiento' : '#inicio'));
      if (!esReciclador()) setTimeout(() => abrirPIN(), 300);
      return mostrar();
    }
    let vista = titulos[v] ? v : 'inicio';
    if (vista === 'seguimiento' && !esReciclador()) {
      vista = 'inicio';
      history.replaceState(null, '', location.pathname + '#inicio');
    }
    $$('.view').forEach(s => s.hidden = s.dataset.view !== vista);
    $$('.tabbar a').forEach(a => a.dataset.tab === vista ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    $('#navTitle').textContent = titulos[vista];
    window.scrollTo(0, 0);
    nav.classList.remove('show');
    if (vista === 'reto' && !juego.item) nuevaRonda();
  };
  window.addEventListener('hashchange', mostrar);
  window.addEventListener('scroll', () => nav.classList.toggle('show', window.scrollY > 60), { passive: true });

  /* ---------- INICIO ---------- */
  const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#fecha').textContent = hoy.charAt(0).toUpperCase() + hoy.slice(1);
  const marcaImg = $('#marca');
  marcaImg.onerror = () => marcaImg.hidden = true;
  /* Bienvenida con el logo: una vez por sesión */
  const splash = $('#splash');
  let vista = false;
  try { vista = sessionStorage.getItem('bb_splash'); sessionStorage.setItem('bb_splash', '1'); } catch { }
  if (vista || matchMedia('(prefers-reduced-motion: reduce)').matches) splash.remove();
  else setTimeout(() => { splash.classList.add('fuera'); setTimeout(() => splash.remove(), 600); }, 1700);
  $$('.bag-mini').forEach(el => el.innerHTML = bagSVG(el.dataset.b));

  $('#bagRow').innerHTML = Object.entries(BOLSAS).map(([k, b]) => `
    <button class="bag-card" data-go="${k}" style="background:${k === 'blanca' ? 'var(--card)' : b.color};color:${k === 'blanca' ? 'var(--ink)' : b.tinta}">
      <div class="bag-art">${bagSVG(k)}</div>
      <small>${esc(b.tipo.toUpperCase())}</small>
      <h4>${esc(b.nombre)}</h4>
      <p>${esc(b.resumen)}</p>
    </button>`).join('');
  $('#bagRow').addEventListener('click', e => {
    const c = e.target.closest('[data-go]');
    if (!c) return;
    guiaSel = c.dataset.go;
    renderGuia();
    location.hash = 'guia';
  });

  const q = $('#q'), res = $('#resultados');
  const buscar = txt => {
    const t = norm(txt.trim());
    if (!t) { res.hidden = true; return; }
    const hits = RESIDUOS.filter(r => norm(r.t + ' ' + r.k).includes(t)).slice(0, 8);
    res.hidden = false;
    res.innerHTML = hits.length
      ? hits.map(r => `<div class="row"><span class="row-main">${esc(r.t)}<span class="row-sub">${esc(r.n)}</span></span>${bagPill(r.b)}</div>`).join('')
      : `<div class="row"><span class="row-main">No lo encontramos<span class="row-sub">Hazte la pregunta clave: ¿está limpio, seco y se puede transformar? Si sí, va en la bolsa blanca.</span></span></div>`;
  };
  q.addEventListener('input', () => buscar(q.value));

  const dia = Math.floor(Date.now() / 864e5);
  const tipN = dia % TIPS.length;
  $('#tip').innerHTML = `<span class="num">${tipN + 1}</span><span>${esc(TIPS[tipN])}</span>`;

  /* ---------- GUÍA ---------- */
  let guiaSel = 'blanca';
  const seg = $('#segBolsas');
  seg.innerHTML = Object.entries(BOLSAS).map(([k, b]) =>
    `<button role="tab" data-k="${k}">${k === 'especial' ? 'Especiales' : esc(b.nombre.replace('Bolsa ', '').replace(/^./, c => c.toUpperCase()))}</button>`).join('');
  seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    guiaSel = b.dataset.k;
    renderGuia();
  });
  function renderGuia() {
    $$('button', seg).forEach(b => b.setAttribute('aria-selected', b.dataset.k === guiaSel));
    const b = BOLSAS[guiaSel];
    const extra = RESIDUOS.filter(r => r.b === guiaSel && !b.items.some(i => norm(i).startsWith(norm(r.t).slice(0, 6))));
    $('#guiaBolsa').innerHTML = `
      <div class="bag-hero" style="background:${guiaSel === 'blanca' ? 'var(--card)' : b.color};color:${guiaSel === 'blanca' ? 'var(--ink)' : b.tinta}">
        <div class="bag-art">${bagSVG(guiaSel)}</div>
        <div><small style="font-weight:700;font-size:12px;opacity:.8">${esc(b.tipo.toUpperCase())}</small>
          <h2>${esc(b.nombre)}</h2><p>${esc(b.resumen)}</p>
          <span class="pill" style="background:rgba(127,127,127,.18)">${esc(b.regla)}</span></div>
      </div>
      <h3 class="section">Qué va aquí</h3>
      <div class="list inset">${b.items.map(i => `<div class="row"><span class="dot" style="background:${b.color}"></span><span class="row-main">${esc(i)}</span></div>`).join('')}</div>
      ${extra.length ? `<h3 class="section">También</h3><div class="list inset">${extra.map(r => `<div class="row"><span class="row-main">${esc(r.t)}<span class="row-sub">${esc(r.n)}</span></span></div>`).join('')}</div>` : ''}`;
  }

  /* Ayudante: la pregunta clave con switches */
  const preguntas = [
    { id: 'limpio', t: '¿Está limpio?', s: 'Sin comida, grasa ni líquidos' },
    { id: 'seco', t: '¿Está seco?', s: 'Escurrido, sin agua' },
    { id: 'transf', t: '¿Se puede volver a transformar?', s: 'Plástico, cartón, papel, metal, vidrio, Tetra Pak' }
  ];
  $('#helper').innerHTML = preguntas.map(p => `
    <label class="row"><span class="row-main">${p.t}<span class="row-sub">${p.s}</span></span>
    <input type="checkbox" class="switch" data-p="${p.id}"></label>`).join('');
  const veredicto = () => {
    const ok = $$('#helper input').every(i => i.checked);
    const n = $$('#helper input').filter(i => i.checked).length;
    $('#veredicto').innerHTML = ok
      ? `<div class="bag-art">${bagSVG('blanca')}</div><div><b>Va en la bolsa blanca</b><span>Perfecto, el reciclador lo puede aprovechar.</span></div>`
      : `<div class="bag-art">${bagSVG(n === 0 ? 'negra' : 'blanca')}</div><div><b>${n === 0 ? 'Probablemente va en la negra' : 'Todavía no está listo'}</b><span>${n === 0 ? 'Si es comida o cáscaras, va en la verde. Si es pila, bombillo o medicamento, a un punto posconsumo.' : 'Enjuágalo y escúrrelo. Si no se puede transformar, no va en la blanca.'}</span></div>`;
  };
  $('#helper').addEventListener('change', () => {
    vibrar(8); veredicto();
    if ($$('#helper input').every(i => i.checked)) fiesta($('#veredicto'));
  });

  /* ---------- REGLAS ---------- */
  $('#reglasList').innerHTML = REGLAS.map((r, i) => `
    <details class="rule" ${i === 0 ? 'open' : ''}>
      <summary><span class="n">${i + 1}</span><span><h4>${esc(r.titulo)}</h4><small>${esc(r.corto)}</small></span><svg class="chev"><use href="#i-chev"/></svg></summary>
      <p>${esc(r.texto)}</p>
    </details>`).join('');
  $('#tipsList').innerHTML = TIPS.map(t => `<div class="row"><span class="row-ico" style="background:var(--green)">✓</span><span class="row-main">${esc(t)}</span></div>`).join('');

  /* ---------- RETO (juego) ---------- */
  const RONDAS = 10;
  const juego = { ronda: 0, puntos: 0, racha: 0, aciertos: 0, item: null, mazo: [], resp: false };
  let mejor = store.get('mejor', 0);
  const renderStats = () => {
    $('#retoStats').innerHTML = `
      <div class="stat"><b>${juego.puntos}</b><span>Puntos</span></div>
      <div class="stat"><b>${juego.racha}</b><span>Racha</span></div>
      <div class="stat"><b>${mejor}</b><span>Récord</span></div>`;
  };
  const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function nuevaRonda() {
    if (juego.ronda === 0) { juego.mazo = barajar(RESIDUOS).slice(0, RONDAS); juego.puntos = 0; juego.racha = 0; juego.aciertos = 0; }
    if (juego.ronda >= RONDAS) return finJuego();
    juego.item = juego.mazo[juego.ronda];
    juego.resp = false;
    renderStats();
    $('#game').innerHTML = `
      <div class="item-card">
        <p class="lbl">Ronda ${juego.ronda + 1} de ${RONDAS} · ¿Dónde va?</p>
        <h2>${esc(juego.item.t)}</h2>
        <div class="progress"><i style="width:${juego.ronda / RONDAS * 100}%"></i></div>
      </div>
      <div class="choices">${Object.entries(BOLSAS).map(([k, b]) => `
        <button class="choice" data-k="${k}" style="background:${k === 'blanca' ? 'var(--card)' : b.color};color:${k === 'blanca' ? 'var(--ink)' : b.tinta}">
          <span class="bag-art">${bagSVG(k)}</span>${k === 'especial' ? 'Posconsumo' : esc(b.nombre)}</button>`).join('')}
      </div>
      <div id="fb"></div>`;
  }
  $('#game').addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (c && !juego.resp) {
      juego.resp = true;
      const ok = c.dataset.k === juego.item.b;
      c.classList.add(ok ? 'ok' : 'bad');
      if (!ok) $(`.choice[data-k="${juego.item.b}"]`).classList.add('ok');
      if (ok) { juego.aciertos++; juego.racha++; juego.puntos += 10 + Math.min(juego.racha - 1, 5) * 2; vibrar(15); fiesta(c); }
      else { juego.racha = 0; vibrar([30, 40, 30]); }
      renderStats();
      $('#fb').innerHTML = `<div class="feedback">
        <span class="badge" style="background:${ok ? 'var(--green)' : 'var(--red)'}">${ok ? '✓' : '✕'}</span>
        <div><b>${ok ? '¡Correcto!' : 'Va en: ' + esc(BOLSAS[juego.item.b].nombre)}</b><span>${esc(juego.item.n)}</span></div>
      </div><button class="btn primary" id="sig">${juego.ronda + 1 >= RONDAS ? 'Ver resultado' : 'Siguiente'}</button>`;
      return;
    }
    if (e.target.closest('#sig')) { juego.ronda++; nuevaRonda(); }
    if (e.target.closest('#otra')) { juego.ronda = 0; nuevaRonda(); }
  });
  function finJuego() {
    if (juego.puntos > mejor) { mejor = juego.puntos; store.set('mejor', mejor); setTimeout(() => fiesta($('.score')), 150); }
    renderStats();
    const a = juego.aciertos;
    const msg = `Acertaste ${a} de ${RONDAS}. ` + (a >= 8 ? 'Eres un aliado del reciclador.' : a >= 5 ? 'Vas bien, repasa la guía.' : 'Repasa la guía y vuelve a intentarlo.');
    $('#game').innerHTML = `<div class="item-card end">
      <p class="lbl">Tu puntaje</p><div class="score">${juego.puntos}</div><p>${msg}</p></div>
      <button class="btn primary" id="otra">Jugar otra vez</button>
      <a class="btn" href="#guia">Repasar la guía</a>`;
    juego.item = { fin: true };
  }

  /* ---------- SEGUIMIENTO ---------- */
  let visitas = store.get('visitas', []);
  const nombre = $('#recNombre'), sector = $('#recSector');
  nombre.value = store.get('nombre', '');
  sector.value = store.get('sector', '');
  nombre.addEventListener('input', () => store.set('nombre', nombre.value));
  sector.addEventListener('input', () => store.set('sector', sector.value));

  const RES = { cumple: { t: 'Cumple', c: 'var(--green)' }, parcial: { t: 'Cumple parcial', c: 'var(--orange)' }, no: { t: 'No cumple', c: 'var(--red)' } };
  const autoResultado = ch => {
    const n = CHEQUEOS.filter(c => ch[c.id]).length;
    return n === CHEQUEOS.length ? 'cumple' : n >= 2 ? 'parcial' : 'no';
  };
  const fechaCorta = iso => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  const dirTexto = h => [h.direccion || 'Sin dirección', h.casa].filter(Boolean).join(' · ');
  const fallos = ch => CHEQUEOS.filter(c => !ch[c.id]);

  /* Pestañas Visitas / Viviendas */
  let segVista = 'visitas';
  $('#segSeg').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    segVista = b.dataset.k;
    renderSeguimiento();
  });

  function renderSeguimiento() {
    $$('#segSeg button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === segVista));
    const tot = visitas.length;
    const cnt = { cumple: 0, parcial: 0, no: 0 };
    visitas.forEach(v => cnt[v.resultado]++);
    const pct = k => tot ? Math.round(cnt[k] / tot * 100) : 0;
    $('#resumen').innerHTML = `
      <div class="ring"><b>${tot}</b><span>Visitas</span></div>
      <div class="ring c"><b>${cnt.cumple}</b><span>Cumple</span></div>
      <div class="ring p"><b>${cnt.parcial}</b><span>Parcial</span></div>
      <div class="ring n"><b>${cnt.no}</b><span>No cumple</span></div>
      ${tot ? `<div style="grid-column:1/-1"><div class="bar"><i style="width:${pct('cumple')}%;background:var(--green)"></i><i style="width:${pct('parcial')}%;background:var(--orange)"></i><i style="width:${pct('no')}%;background:var(--red)"></i></div></div>` : ''}`;

    const f = norm($('#qSeg').value.trim());
    $('#qSeg').placeholder = segVista === 'visitas' ? 'Buscar dirección' : 'Buscar vivienda';
    if (segVista === 'viviendas') return renderViviendas(f);

    const lista = visitas.filter(v => !f || norm(v.direccion + ' ' + v.casa + ' ' + v.obs).includes(f)).sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (!lista.length) {
      $('#visitas').innerHTML = `<div class="empty"><div class="bag-art">${bagSVG('blanca')}</div>${tot ? 'Sin resultados para esa búsqueda.' : 'Aún no hay visitas. Toca <b>+</b> para registrar la primera casa.'}</div>`;
      return;
    }
    const grupos = {};
    lista.forEach(v => (grupos[v.fecha.slice(0, 10)] ||= []).push(v));
    $('#visitas').innerHTML = Object.entries(grupos).map(([d, vs]) => `
      <p class="visit-date">${esc(fechaCorta(vs[0].fecha))}</p>
      <div class="list inset">${vs.map(v => `
        <button class="row" data-id="${v.id}">
          <span class="dot" style="background:${RES[v.resultado].c};border:0"></span>
          <span class="row-main">${esc(dirTexto(v))}
            <span class="row-sub">${RES[v.resultado].t}${v.obs ? ' · ' + esc(v.obs) : ''}</span></span>
          <svg class="chev"><use href="#i-chev"/></svg>
        </button>`).join('')}</div>`).join('');
  }

  function renderViviendas(f) {
    const hs = Insignias.viviendas(visitas)
      .filter(h => !f || norm(h.direccion + ' ' + h.casa).includes(f))
      .sort((a, b) => b.racha - a.racha || b.cumple - a.cumple);
    const leyenda = `<div class="niveles">${NIVELES.map(n => `
      <div class="nivel">${Insignias.insigniaMini(n, 46)}<b>${n.nombre}</b><span>${n.racha} ${n.racha === 1 ? 'visita' : 'seguidas'}</span></div>`).join('')}</div>
      <p class="hint">Cada visita que cumple suma a la racha. "Cumple parcial" la mantiene y "No cumple" la reinicia.</p>`;
    if (!hs.length) {
      $('#visitas').innerHTML = leyenda + `<div class="empty">${visitas.length ? 'Sin resultados para esa búsqueda.' : 'Cuando registres visitas, aquí verás cada vivienda con su insignia.'}</div>`;
      return;
    }
    $('#visitas').innerHTML = leyenda + `<div class="list inset">${hs.map(h => `
      <button class="row viv" data-k="${esc(h.clave)}">
        ${Insignias.insigniaMini(h.nivel, 44)}
        <span class="row-main">${esc(dirTexto(h))}
          <span class="row-sub">${h.nivel ? h.nivel.nombre : 'Sin insignia'} · racha ${h.racha} · ${h.visitas.length} ${h.visitas.length === 1 ? 'visita' : 'visitas'}</span></span>
        <span class="dot" style="background:${RES[h.ultima.resultado].c};border:0" title="Última visita"></span>
        <svg class="chev"><use href="#i-chev"/></svg>
      </button>`).join('')}</div>`;
  }

  $('#qSeg').addEventListener('input', renderSeguimiento);
  $('#visitas').addEventListener('click', e => {
    const r = e.target.closest('[data-id]');
    if (r) return abrirVisita(visitas.find(v => v.id === r.dataset.id));
    const h = e.target.closest('[data-k].viv');
    if (h) abrirVivienda(h.dataset.k);
  });
  $('#nuevo').addEventListener('click', () => abrirVisita());

  /* Hoja modal */
  const sheet = $('#sheet'), backdrop = $('#backdrop');
  const abrirSheet = html => { sheet.onclick = sheet.onchange = sheet.oninput = null; $('#sheetBody').innerHTML = html; sheet.hidden = backdrop.hidden = false; sheet.scrollTop = 0; document.body.style.overflow = 'hidden'; };
  const cerrarSheet = () => { sheet.hidden = backdrop.hidden = true; document.body.style.overflow = ''; };
  backdrop.addEventListener('click', cerrarSheet);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) cerrarSheet(); });

  const retroHTML = ch => {
    const fs = fallos(ch);
    if (!fs.length) return '';
    return `<div class="retro">${fs.map(c => `
      <div class="retro-item"><span class="retro-n">!</span><div><b>${esc(RETRO[c.id].titulo)}</b><span>${esc(RETRO[c.id].texto)}</span></div></div>`).join('')}</div>`;
  };

  function abrirVisita(v) {
    const nueva = !v;
    v = v || { id: Date.now().toString(36), fecha: new Date().toISOString(), direccion: '', casa: '', ch: {}, resultado: 'no', obs: '', manual: false };
    let manual = v.manual;
    const dirs = [...new Set(visitas.map(x => x.direccion).filter(Boolean))];
    abrirSheet(`
      <div class="sheet-head"><button class="link" data-a="cancelar">Cancelar</button><h3>${nueva ? 'Nueva visita' : 'Editar visita'}</h3><button class="link bold" data-a="guardar">Guardar</button></div>
      <div class="list inset">
        <label class="row field"><span class="row-main" style="flex:none;width:96px">Dirección</span><input id="fDir" value="${esc(v.direccion)}" placeholder="Calle 10 # 5-20" list="dirList" autocomplete="off"></label>
        <label class="row field"><span class="row-main" style="flex:none;width:96px">Casa / apto</span><input id="fCasa" value="${esc(v.casa)}" placeholder="Apto 301"></label>
      </div>
      <datalist id="dirList">${dirs.map(d => `<option value="${esc(d)}">`).join('')}</datalist>
      <p class="hint" id="fViv"></p>
      <p class="label">Chequeo</p>
      <div class="list inset">${CHEQUEOS.map(c => `
        <label class="row"><span class="row-main">${c.label}${c.sub ? `<span class="row-sub">${c.sub}</span>` : ''}</span>
        <input type="checkbox" class="switch" data-c="${c.id}" ${v.ch[c.id] ? 'checked' : ''}></label>`).join('')}</div>
      <p class="label">Resultado final</p>
      <div class="result-seg">${Object.entries(RES).map(([k, r]) => `<button data-r="${k}" aria-pressed="${v.resultado === k}">${r.t}</button>`).join('')}</div>
      <p class="hint" id="fHint">${manual ? 'Elegido a mano.' : 'Se calcula solo con el chequeo. Puedes cambiarlo.'}</p>
      <div id="fRetro"></div>
      <p class="label">Observaciones</p>
      <textarea id="fObs" placeholder="Ej: dejó vidrio sin envolver">${esc(v.obs)}</textarea>
      ${nueva ? '' : '<button class="btn danger" data-a="borrar">Eliminar visita</button>'}`);

    const marcar = r => $$('.result-seg button', sheet).forEach(b => b.setAttribute('aria-pressed', b.dataset.r === r));
    const leerCh = () => Object.fromEntries($$('[data-c]', sheet).map(i => [i.dataset.c, i.checked]));
    let resultado = v.resultado;
    if (nueva) { resultado = autoResultado({}); marcar(resultado); }

    /* Muestra la retroalimentación en vivo y la insignia actual de esa vivienda */
    const pintarRetro = () => {
      $('#fRetro').innerHTML = resultado === 'cumple' ? '' :
        `<p class="label">Retroalimentación para la vivienda</p>${retroHTML(leerCh()) || '<p class="hint">Marca en el chequeo lo que no cumplió para ver los consejos.</p>'}`;
    };
    const pintarViv = () => {
      const k = Insignias.clave({ direccion: $('#fDir').value, casa: $('#fCasa').value });
      const h = Insignias.viviendas(visitas.filter(x => x.id !== v.id)).find(x => x.clave === k);
      $('#fViv').innerHTML = h ? `Vivienda conocida: ${h.nivel ? '<b>' + h.nivel.nombre + '</b>' : 'sin insignia'} · racha ${h.racha}` : '';
    };
    pintarRetro(); pintarViv();

    sheet.oninput = e => { if (e.target.id === 'fDir' || e.target.id === 'fCasa') pintarViv(); };
    sheet.onchange = e => {
      if (e.target.dataset.c) {
        if (!manual) { resultado = autoResultado(leerCh()); marcar(resultado); }
        vibrar(8); pintarRetro();
      }
    };
    sheet.onclick = e => {
      const r = e.target.closest('[data-r]');
      if (r) { resultado = r.dataset.r; manual = true; marcar(resultado); $('#fHint').textContent = 'Elegido a mano.'; pintarRetro(); return; }
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'cancelar') cerrarSheet();
      if (a === 'guardar') {
        const nuevaDir = { direccion: $('#fDir').value.trim(), casa: $('#fCasa').value.trim() };
        const k = Insignias.clave(nuevaDir);
        const antes = Insignias.viviendas(visitas).find(h => h.clave === k);
        Object.assign(v, nuevaDir, { ch: leerCh(), resultado, obs: $('#fObs').value.trim(), manual });
        if (nueva) visitas.push(v);
        store.set('visitas', visitas);
        const despues = Insignias.viviendas(visitas).find(h => h.clave === k);
        renderSeguimiento(); vibrar(15);
        const subio = despues.nivel && (!antes || !antes.nivel || NIVELES.indexOf(despues.nivel) > NIVELES.indexOf(antes.nivel));
        if (resultado !== 'cumple') abrirRetro(v, antes, despues);
        else if (subio) abrirLogro(despues);
        else { cerrarSheet(); toast('Visita guardada'); fiesta($('#resumen')); }
      }
      if (a === 'borrar') {
        if (e.target.dataset.confirm) {
          visitas = visitas.filter(x => x.id !== v.id);
          store.set('visitas', visitas);
          cerrarSheet(); renderSeguimiento(); toast('Visita eliminada');
        } else { e.target.dataset.confirm = '1'; e.target.textContent = 'Toca otra vez para confirmar'; }
      }
    };
  }

  /* Mensaje para la vivienda (WhatsApp o copiar) */
  function mensajeRetro(v, h) {
    const fs = fallos(v.ch);
    let t = `Hola, somos el equipo de reciclaje${sector.value ? ' del sector ' + sector.value : ''}. ` +
      `Hoy revisamos el material de su vivienda (${dirTexto(v)}) y el resultado fue: ${RES[v.resultado].t}.\n\n`;
    if (fs.length) t += 'Para la próxima le recomendamos:\n' + fs.map(c => `- ${RETRO[c.id].titulo}: ${RETRO[c.id].texto}`).join('\n') + '\n\n';
    if (v.obs) t += `Observación: ${v.obs}\n\n`;
    const s = h && h.sig;
    t += s ? `Con ${s.racha - h.racha} ${s.racha - h.racha === 1 ? 'visita' : 'visitas'} seguidas que cumplan, su hogar gana la insignia "${s.nombre}". ` : '';
    t += 'Gracias por apoyar el trabajo del reciclador.';
    return t;
  }
  const abrirWA = txt => {
    const a = document.createElement('a');
    a.href = 'https://wa.me/?text=' + encodeURIComponent(txt);
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  };

  function abrirRetro(v, antes, h) {
    const perdio = v.resultado === 'no' && antes && antes.racha > 0;
    const msg = mensajeRetro(v, h);
    abrirSheet(`
      <div class="sheet-head"><span></span><h3>Retroalimentación</h3><button class="link bold" data-a="ok">Listo</button></div>
      <div class="retro-hero ${v.resultado}">
        <span class="retro-big">${v.resultado === 'no' ? '✕' : '!'}</span>
        <div><b>${RES[v.resultado].t}</b><span>${esc(dirTexto(v))}</span></div>
      </div>
      ${perdio ? `<p class="aviso">La vivienda perdió su racha de ${antes.racha} ${antes.racha === 1 ? 'visita' : 'visitas'}${antes.nivel ? ' y la insignia ' + antes.nivel.nombre : ''}. La puede recuperar en las próximas visitas.</p>` : ''}
      <p class="label">Qué debe mejorar</p>
      ${retroHTML(v.ch) || '<p class="hint">No se marcó ningún chequeo fallido. Revisa las observaciones.</p>'}
      ${h && h.sig ? `<div class="card meta">${Insignias.insigniaMini(h.sig, 52)}<div><b>Próxima insignia: ${h.sig.nombre}</b><span>Le faltan ${h.sig.racha - h.racha} ${h.sig.racha - h.racha === 1 ? 'visita' : 'visitas'} seguidas que cumplan.</span></div></div>` : ''}
      <button class="btn primary" data-a="wa"><svg><use href="#i-share"/></svg>Enviar consejos por WhatsApp</button>
      <button class="btn" data-a="copiar"><svg><use href="#i-copy"/></svg>Copiar mensaje</button>`);
    sheet.onclick = async e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'ok') { cerrarSheet(); toast('Visita guardada'); }
      if (a === 'wa') abrirWA(msg);
      if (a === 'copiar') { try { await navigator.clipboard.writeText(msg); toast('Mensaje copiado'); } catch { toast('No se pudo copiar'); } }
    };
  }

  async function abrirLogro(h) {
    const logo = await Insignias.logo();
    abrirSheet(`
      <div class="sheet-head"><span></span><h3>¡Nueva insignia!</h3><button class="link bold" data-a="ok">Listo</button></div>
      <div class="logro">
        <div class="sticker">${Insignias.sticker(h, logo)}</div>
        <p class="logro-t">${esc(dirTexto(h))} ganó la insignia <b>${h.nivel.nombre}</b></p>
        <p class="hint" style="text-align:center">${h.sig ? `Siguiente: ${h.sig.nombre} con ${h.sig.racha} visitas seguidas.` : 'Llegó al nivel más alto.'}</p>
      </div>
      <button class="btn primary" data-a="png"><svg><use href="#i-down"/></svg>Descargar sticker</button>`);
    setTimeout(() => fiesta($('.sticker')), 200);
    sheet.onclick = async e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'ok') cerrarSheet();
      if (a === 'png') descargarSticker(h);
    };
  }

  async function descargarSticker(h) {
    try {
      const r = await Insignias.exportar(h);
      if (r === 'descargado') toast('Sticker descargado');
      if (r === 'compartido') toast('Sticker listo');
    } catch { toast('No se pudo generar el sticker'); }
  }

  async function abrirVivienda(k) {
    const h = Insignias.viviendas(visitas).find(x => x.clave === k);
    if (!h) return;
    const logo = await Insignias.logo();
    const prog = h.sig ? Math.round(h.racha / h.sig.racha * 100) : 100;
    abrirSheet(`
      <div class="sheet-head"><span></span><h3>Vivienda</h3><button class="link bold" data-a="ok">Listo</button></div>
      <h2 class="viv-t">${esc(dirTexto(h))}</h2>
      ${h.nivel
        ? `<div class="sticker">${Insignias.sticker(h, logo)}</div>`
        : `<div class="card meta">${Insignias.insigniaMini(null, 52)}<div><b>Todavía sin insignia</b><span>Con una visita que cumpla gana la insignia Semilla.</span></div></div>`}
      <div class="card">
        <div class="prog-row"><b>Racha actual: ${h.racha}</b><span>Mejor: ${h.mejor}</span></div>
        <div class="bar"><i style="width:${prog}%;background:${(h.sig || h.nivel || NIVELES[0]).color}"></i></div>
        <span class="hint" style="margin:0">${h.sig ? `Faltan ${h.sig.racha - h.racha} para ${h.sig.nombre}` : 'Nivel máximo alcanzado'}</span>
      </div>
      ${h.nivel ? '<button class="btn primary" data-a="png"><svg><use href="#i-down"/></svg>Descargar sticker para imprimir</button>' : ''}
      <p class="label">Historial</p>
      <div class="list inset">${h.visitas.slice().reverse().map(v => `
        <button class="row" data-id="${v.id}"><span class="dot" style="background:${RES[v.resultado].c};border:0"></span>
        <span class="row-main">${RES[v.resultado].t}<span class="row-sub">${esc(fechaCorta(v.fecha))}${v.obs ? ' · ' + esc(v.obs) : ''}</span></span>
        <svg class="chev"><use href="#i-chev"/></svg></button>`).join('')}</div>
      <button class="btn" data-a="nueva"><svg><use href="#i-plus"/></svg>Registrar visita aquí</button>`);
    sheet.onclick = e => {
      const r = e.target.closest('[data-id]');
      if (r) return abrirVisita(visitas.find(v => v.id === r.dataset.id));
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'ok') cerrarSheet();
      if (a === 'png') descargarSticker(h);
      if (a === 'nueva') {
        abrirVisita();
        $('#fDir').value = h.direccion; $('#fCasa').value = h.casa;
        $('#fDir').dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
  }


  /* Exportar: mismas columnas que la hoja de SEGUIMIENTO */
  const tabla = sep => {
    const si = b => b ? 'Sí' : 'No';
    const cab = ['N°', 'Fecha', 'Reciclador', 'Sector', 'Dirección', 'Casa / apto', 'Saca bolsa blanca o marcada', 'Material limpio y seco', 'Aplastado / desarmado', 'Sin cortopunzantes sueltos', 'Resultado final', 'Observaciones', 'Insignia actual'];
    const ins = new Map(Insignias.viviendas(visitas).map(h => [h.clave, h.nivel ? h.nivel.nombre : 'Sin insignia']));
    const filas = visitas.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map((v, i) => [
      i + 1, new Date(v.fecha).toLocaleDateString('es-CO'), nombre.value, sector.value, v.direccion, v.casa,
      si(v.ch.blanca), si(v.ch.limpio), si(v.ch.aplastado), si(v.ch.seguro), RES[v.resultado].t, v.obs, ins.get(Insignias.clave(v))]);
    const cel = x => sep === ';' ? `"${String(x).replace(/"/g, '""')}"` : String(x).replace(/[\t\n]/g, ' ');
    return [cab, ...filas].map(f => f.map(cel).join(sep)).join('\r\n');
  };
  $('#exportar').addEventListener('click', () => {
    if (!visitas.length) return toast('No hay visitas para exportar');
    try {
      const blob = new Blob(['﻿' + tabla(';')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `seguimiento-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Archivo descargado');
    } catch { toast('No se pudo descargar; usa Copiar tabla'); }
  });
  $('#copiar').addEventListener('click', async () => {
    if (!visitas.length) return toast('No hay visitas para copiar');
    try { await navigator.clipboard.writeText(tabla('\t')); toast('Tabla copiada, pégala en Excel'); }
    catch { toast('No se pudo copiar'); }
  });
  $('#whatsapp').addEventListener('click', () => {
    const tot = visitas.length;
    if (!tot) return toast('No hay visitas para enviar');
    const c = k => visitas.filter(v => v.resultado === k).length;
    const txt = `Seguimiento reciclaje${sector.value ? ' - ' + sector.value : ''}\n` +
      `${nombre.value ? 'Reciclador: ' + nombre.value + '\n' : ''}` +
      `Casas visitadas: ${tot}\nCumple: ${c('cumple')}\nCumple parcial: ${c('parcial')}\nNo cumple: ${c('no')}`;
    abrirWA(txt);
  });

  /* ---------- PIN del reciclador ---------- */
  function abrirPIN() {
    let pin = '';
    const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'borrar'];
    abrirSheet(`
      <div class="sheet-head"><button class="link" data-a="cancelar">Cancelar</button><h3>Modo reciclador</h3><span style="width:70px"></span></div>
      <div class="pin">
        <img src="${MARCA.logo}" alt="" class="pin-logo">
        <p class="pin-t">Ingresa el código de ProAmbientes</p>
        <div class="pin-dots" id="pinDots">${'<i></i>'.repeat(RECICLADOR.pin.length)}</div>
        <div class="keypad">${teclas.map(t => t === '' ? '<span></span>'
          : t === 'borrar' ? '<button data-k="borrar" aria-label="Borrar"><svg viewBox="0 0 24 24"><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m12 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
          : `<button data-k="${t}">${t}</button>`).join('')}</div>
      </div>`);
    const pintar = () => $$('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    sheet.onclick = e => {
      if (e.target.closest('[data-a=cancelar]')) return cerrarSheet();
      const k = e.target.closest('[data-k]')?.dataset.k;
      if (!k) return;
      vibrar(6);
      $('#pinDots').classList.remove('error');
      pin = k === 'borrar' ? pin.slice(0, -1) : (pin + k).slice(0, RECICLADOR.pin.length);
      pintar();
      if (pin.length < RECICLADOR.pin.length) return;
      if (pin === RECICLADOR.pin) {
        store.set('modo', 'reciclador');
        aplicarModo();
        cerrarSheet();
        toast('Modo reciclador activado');
        location.hash = 'seguimiento';
        setTimeout(() => fiesta($('#resumen')), 400);
      } else {
        const dots = $('#pinDots');
        dots.classList.remove('error'); void dots.offsetWidth; dots.classList.add('error');
        vibrar([40, 50, 40]);
        setTimeout(() => { pin = ''; pintar(); }, 450);
      }
    };
  }

  /* Mantener presionado el logo 3 segundos abre el PIN */
  let presion;
  const soltar = () => { clearTimeout(presion); marcaImg.classList.remove('presionando'); };
  marcaImg.addEventListener('pointerdown', () => {
    marcaImg.classList.add('presionando');
    presion = setTimeout(() => {
      soltar(); vibrar(20);
      if (esReciclador()) location.hash = 'seguimiento'; else abrirPIN();
    }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => marcaImg.addEventListener(ev, soltar));
  marcaImg.addEventListener('contextmenu', e => e.preventDefault());

  /* Salir del modo reciclador (los registros no se borran) */
  $('#salirModo').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.lastChild.textContent = 'Toca otra vez para confirmar'; return; }
    delete b.dataset.confirm; b.lastChild.textContent = 'Salir del modo reciclador';
    store.set('modo', '');
    aplicarModo();
    location.hash = 'inicio';
    toast('Modo ciudadano');
  });

  /* Infografía */
  $('#verInfo').addEventListener('click', () => abrirSheet(`
    <div class="sheet-head"><span></span><h3>Infografía</h3><button class="link bold" data-close>Listo</button></div>
    <img src="assets/infografia.jpg" alt="Infografía: Reciclaje adecuado, ayuda al reciclador" loading="lazy">`));
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) cerrarSheet(); });

  /* ---------- Inicio ---------- */
  renderGuia();
  veredicto();
  renderSeguimiento();
  aplicarModo();
  mostrar();

  /* Funciona sin internet (service worker) */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
}