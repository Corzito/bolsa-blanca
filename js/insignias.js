/* Insignias por vivienda y stickers para imprimir o compartir. */
const Insignias = (() => {
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9#]+/g, ' ').trim();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clave = v => norm(v.direccion) + '|' + norm(v.casa);

  /* Nivel según la racha actual */
  const nivelDe = racha => [...NIVELES].reverse().find(n => racha >= n.racha) || null;
  const siguiente = racha => NIVELES.find(n => racha < n.racha) || null;

  /* Agrupa las visitas por vivienda y calcula racha e insignia */
  function viviendas(visitas) {
    const mapa = new Map();
    visitas.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach(v => {
      const k = clave(v);
      if (!mapa.has(k)) mapa.set(k, { clave: k, direccion: v.direccion, casa: v.casa, visitas: [], racha: 0, mejor: 0, cumple: 0 });
      const h = mapa.get(k);
      h.visitas.push(v);
      h.direccion = v.direccion; h.casa = v.casa;
      if (v.resultado === 'cumple') { h.racha++; h.cumple++; }
      else if (v.resultado === 'no') h.racha = 0;
      h.mejor = Math.max(h.mejor, h.racha);
    });
    return [...mapa.values()].map(h => {
      h.nivel = nivelDe(h.racha);
      h.sig = siguiente(h.racha);
      h.ultima = h.visitas[h.visitas.length - 1];
      return h;
    });
  }

  /* Íconos de cada nivel (caja de 160 x 160) */
  function icono(id, c, o) {
    const tierra = `<path d="M20 140 Q80 118 140 140 Z" fill="${o}" opacity=".35"/>`;
    if (id === 'semilla') return tierra + `
      <ellipse cx="80" cy="122" rx="22" ry="14" fill="${o}"/>
      <path d="M80 112 C80 92 80 80 80 70" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M80 82 C62 80 54 66 56 54 C70 54 80 64 80 82Z" fill="${c}"/>`;
    if (id === 'brote') return tierra + `
      <path d="M80 136 C80 110 80 84 80 52" stroke="${o}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M80 92 C52 92 36 72 38 50 C62 50 80 66 80 92Z" fill="${c}"/>
      <path d="M80 74 C104 74 120 54 118 30 C94 30 80 48 80 74Z" fill="${c}"/>
      <path d="M80 92 L50 58 M80 74 L108 40" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`;
    if (id === 'arbol') return tierra + `
      <rect x="71" y="88" width="18" height="50" rx="6" fill="${o}"/>
      <circle cx="80" cy="58" r="36" fill="${c}"/>
      <circle cx="50" cy="80" r="24" fill="${c}"/>
      <circle cx="110" cy="80" r="24" fill="${c}"/>
      <circle cx="66" cy="46" r="10" fill="#fff" opacity=".28"/>`;
    return `
      <path d="M80 14 L134 34 V76 C134 110 110 134 80 146 C50 134 26 110 26 76 V34 Z" fill="${c}"/>
      <path d="M80 14 L134 34 V76 C134 110 110 134 80 146 Z" fill="${o}" opacity=".25"/>
      <path d="M80 116 C52 104 54 70 92 54 C100 86 96 108 80 116Z" fill="#fff"/>
      <path d="M80 116 C82 94 86 74 92 54" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  }
  const insigniaMini = (nivel, size = 44) => {
    if (!nivel) return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-hidden="true"><circle cx="80" cy="80" r="76" fill="none" stroke="#C7C7CC" stroke-width="6" stroke-dasharray="14 10"/></svg>`;
    return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-hidden="true"><circle cx="80" cy="80" r="78" fill="${nivel.color}" opacity=".18"/><g transform="translate(16 14) scale(.8)">${icono(nivel.id, nivel.color, nivel.oscuro)}</g></svg>`;
  };

  /* Sticker circular (600 x 600) */
  let uid = 0;
  function sticker(h, logoURL) {
    const n = h.nivel || NIVELES[0];
    const id = 'st' + (++uid);
    const f = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
    const dir = [h.direccion, h.casa].filter(Boolean).join(' · ') || 'Vivienda';
    const anio = new Date().getFullYear();
    const pie = (MARCA.nombre || 'Separación en la fuente') + ' · ' + anio;
    const logo = logoURL
      ? `<image href="${logoURL}" x="215" y="88" width="170" height="86" preserveAspectRatio="xMidYMid meet"/>`
      : `<g transform="translate(278 98) scale(.09)"><path d="M164 192 Q164 170 186 170 L326 170 Q348 170 348 192 L364 382 Q366 408 340 408 L172 408 Q146 408 148 382 Z" fill="${n.color}"/><path d="M216 170 Q216 110 256 110 Q296 110 296 170" fill="none" stroke="${n.color}" stroke-width="22"/></g>`;
    const estrellas = NIVELES.map((x, i) => {
      const on = h.racha >= x.racha;
      return `<circle cx="${246 + i * 36}" cy="472" r="10" fill="${on ? n.color : '#E5E5EA'}"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
      <defs>
        <path id="${id}a" d="M70 300 A230 230 0 0 1 530 300"/>
        <path id="${id}b" d="M58 300 A242 242 0 0 0 542 300"/>
        <radialGradient id="${id}g" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2F7F2"/></radialGradient>
      </defs>
      <circle cx="300" cy="300" r="296" fill="${n.oscuro}"/>
      <circle cx="300" cy="300" r="286" fill="${n.color}"/>
      <circle cx="300" cy="300" r="214" fill="url(#${id}g)"/>
      <circle cx="300" cy="300" r="214" fill="none" stroke="#fff" stroke-width="8"/>
      <text font-family="${f}" font-size="34" font-weight="800" fill="#fff" letter-spacing="4">
        <textPath href="#${id}a" startOffset="50%" text-anchor="middle">HOGAR QUE RECICLA BIEN</textPath></text>
      <text font-family="${f}" font-size="22" font-weight="700" fill="#fff" letter-spacing="2" dominant-baseline="hanging">
        <textPath href="#${id}b" startOffset="50%" text-anchor="middle">${esc(pie.toUpperCase())}</textPath></text>
      <circle cx="40" cy="300" r="8" fill="#fff"/><circle cx="560" cy="300" r="8" fill="#fff"/>
      ${logo}
      <g transform="translate(220 170)">${icono(n.id, n.color, n.oscuro)}</g>
      <text x="300" y="368" text-anchor="middle" font-family="${f}" font-size="52" font-weight="800" fill="${n.oscuro}">${esc(n.nombre.toUpperCase())}</text>
      <text x="300" y="402" text-anchor="middle" font-family="${f}" font-size="24" font-weight="600" fill="#3A3A3C">${esc(n.lema)}</text>
      <text x="300" y="440" text-anchor="middle" font-family="${f}" font-size="21" fill="#6E6E73">${esc(dir.length > 34 ? dir.slice(0, 33) + '…' : dir)}</text>
      ${estrellas}
    </svg>`;
  }

  /* Logo como data URL para poder meterlo en el PNG */
  let logoCache;
  async function logo() {
    if (logoCache !== undefined) return logoCache;
    try {
      const r = await fetch(MARCA.logo);
      if (!r.ok) throw 0;
      const b = await r.blob();
      logoCache = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); });
    } catch { logoCache = null; }
    return logoCache;
  }

  /* Convierte el sticker en PNG y lo comparte o descarga */
  async function exportar(h) {
    const svg = sticker(h, await logo());
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = url; });
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1200;
    cv.getContext('2d').drawImage(img, 0, 0, 1200, 1200);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png'));
    const nombre = 'sticker-' + norm(h.direccion || 'vivienda').replace(/[#\s]+/g, '-').slice(0, 30) + '.png';
    const file = new File([blob], nombre, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Sticker Hogar que recicla bien' }); return 'compartido'; }
      catch (e) { if (e.name === 'AbortError') return 'cancelado'; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    return 'descargado';
  }

  return { clave, viviendas, nivelDe, siguiente, icono, insigniaMini, sticker, logo, exportar, norm };
})();