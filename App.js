const $ = s => document.querySelector(s);
const main = $('#main');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cls = d => d.kat === 'Urologi' ? 'uro' : '';
const link = s => esc(s).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

let F = 'Semua', Q = '';

/* ---------- Tema ---------- */
(function () {
  let t = null;
  try { t = localStorage.getItem('tema'); } catch (e) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  $('#tema').onclick = () => {
    t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('tema', t); } catch (e) {}
  };
})();

/* ---------- Kartu penyakit ---------- */
const kartu = d => `<a class="card ${cls(d)}" href="#/penyakit/${d.id}">
  <span class="tag ${cls(d)}">${d.kat}</span><h3>${esc(d.judul)}</h3><p>${esc(d.ciri)}</p></a>`;

function cari() {
  const q = Q.trim().toLowerCase();
  return DATA.filter(d => (F === 'Semua' || d.kat === F) &&
    (!q || (d.judul + ' ' + d.ciri + ' ' + d.bagian.map(b => b.items.map(i => i.l + ' ' + i.x).join(' ')).join(' ')).toLowerCase().includes(q)));
}

/* ---------- Beranda ---------- */
function home() {
  main.innerHTML = `<div class="wrap">
  <section class="hero">
    <h1>Belajar penyakit ginjal dan saluran kemih, satu topik satu halaman</h1>
    <p>Ringkasan 25 penyakit blok Genitourinari. Tiap penyakit dibagi enam bagian yang sama, jadi mudah dibandingkan dan dihafal.</p>
    <form class="search" id="fh" role="search">
      <input type="search" id="qh" placeholder="Cari penyakit, gejala, atau obat (mis. BPH, hematuria)" aria-label="Cari materi">
      <button class="btn" type="submit">Cari</button>
    </form>
  </section>
  <div class="two">
    <a class="card big" href="#/penyakit" data-f="Nefrologi"><span class="tag">Bagian A</span><h2>Nefrologi</h2><p>9 topik penyakit ginjal: ISK, GNAPS, sindrom nefrotik, AKI, PGK, dan lainnya.</p></a>
    <a class="card big uro" href="#/penyakit" data-f="Urologi"><span class="tag uro">Bagian B</span><h2>Urologi</h2><p>16 topik saluran kemih dan genitalia pria: batu, BPH, kanker, torsio testis, dan lainnya.</p></a>
  </div>
  <div class="two">
    <a class="card big" href="#/latihan"><h2>Latihan soal</h2><p>Tebak penyakit dari ciri khasnya. 10 soal acak setiap kali main.</p></a>
    <a class="card big" href="#/pustaka"><h2>Daftar pustaka</h2><p>Semua rujukan gaya APA edisi 7 yang dipakai dalam materi.</p></a>
  </div>
  <p class="note">Sebelum dipakai untuk tugas, cek ulang sitasi (halaman, DOI, dan edisi terbaru), terutama pedoman EAU yang mungkin sudah terbit edisi baru.</p>
  </div>`;
  $('#fh').onsubmit = e => { e.preventDefault(); Q = $('#qh').value; F = 'Semua'; location.hash = '#/penyakit'; };
  main.querySelectorAll('[data-f]').forEach(a => a.onclick = () => { F = a.dataset.f; Q = ''; });
}

/* ---------- Daftar penyakit ---------- */
function list() {
  main.innerHTML = `<div class="wrap">
  <h1>Daftar penyakit</h1>
  <div class="search"><input type="search" id="q" value="${esc(Q)}" placeholder="Cari penyakit, gejala, atau obat" aria-label="Cari materi"></div>
  <div class="chips" role="group" aria-label="Filter bagian">${['Semua', 'Nefrologi', 'Urologi'].map(k => `<button class="chip" aria-pressed="${k === F}" data-k="${k}">${k}</button>`).join('')}</div>
  <p id="jml" aria-live="polite"></p><div class="grid" id="g"></div></div>`;
  const isi = () => {
    const r = cari();
    $('#jml').textContent = r.length + ' topik ditemukan';
    $('#g').innerHTML = r.length ? r.map(kartu).join('') : '<p class="empty">Tidak ada hasil. Coba kata kunci lain atau pilih filter "Semua".</p>';
  };
  $('#q').oninput = e => { Q = e.target.value; isi(); };
  main.querySelectorAll('.chip').forEach(b => b.onclick = () => {
    F = b.dataset.k;
    main.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    isi();
  });
  isi();
}

/* ---------- Detail penyakit ---------- */
function detail(id) {
  const i = DATA.findIndex(d => d.id == id);
  if (i < 0) return main.innerHTML = '<div class="wrap empty"><p>Topik tidak ditemukan.</p><a class="btn" href="#/penyakit">Kembali ke daftar</a></div>';
  const d = DATA[i], p = DATA[i - 1], n = DATA[i + 1];
  document.title = d.judul + ' — Nefro-Uro Belajar';
  main.innerHTML = `<div class="wrap narrow">
  <a href="#/penyakit">← Semua penyakit</a>
  <p style="margin-top:14px"><span class="tag ${cls(d)}">${d.kat}</span></p>
  <h1>${d.id}. ${esc(d.judul)}</h1>
  <div class="ciri ${cls(d)}"><b>Ciri khas</b>${esc(d.ciri)}</div>
  <div class="ctl"><button class="btn ghost" id="buka">Buka semua</button><button class="btn ghost" id="tutup">Tutup semua</button><button class="btn ghost" onclick="print()">Cetak</button></div>
  ${d.bagian.map((b, k) => `<details ${k === 0 ? 'open' : ''}><summary>${'ABCDEF'[k]}. ${esc(b.t)}</summary><div class="body">
    <ul class="pts">${b.items.map((it, j) => `<li><span class="k" aria-hidden="true">${'abcdefg'[j]}</span>${it.l ? `<strong>${esc(it.l)}:</strong> ` : ''}${esc(it.x)}</li>`).join('')}</ul>
    ${b.src ? `<p class="src">Sumber: ${esc(b.src)}</p>` : ''}</div></details>`).join('')}
  <div class="pn">${p ? `<a class="btn ghost" href="#/penyakit/${p.id}">← ${esc(p.judul.split(':')[0].split('(')[0])}</a>` : '<span></span>'}${n ? `<a class="btn ghost" href="#/penyakit/${n.id}">${esc(n.judul.split(':')[0].split('(')[0])} →</a>` : ''}</div></div>`;
  const all = o => main.querySelectorAll('details').forEach(x => x.open = o);
  $('#buka').onclick = () => all(true);
  $('#tutup').onclick = () => all(false);
}

/* ---------- Latihan soal ---------- */
let qz;
function quiz() { qz = { q: shuffle(DATA).slice(0, 10), i: 0, s: 0 }; soal(); }
function soal() {
  if (qz.i >= qz.q.length) {
    main.innerHTML = `<div class="wrap narrow center"><h1>Skor kamu ${qz.s} dari ${qz.q.length}</h1>
    <p>${qz.s >= 8 ? 'Sangat baik!' : qz.s >= 5 ? 'Lumayan. Ulangi untuk memperkuat hafalan.' : 'Buka lagi materinya, lalu coba ulang.'}</p>
    <button class="btn" id="re">Main lagi</button> <a class="btn ghost" href="#/penyakit">Belajar materi</a></div>`;
    $('#re').onclick = quiz;
    return;
  }
  const c = qz.q[qz.i], o = shuffle([c, ...shuffle(DATA.filter(d => d !== c)).slice(0, 3)]);
  main.innerHTML = `<div class="wrap narrow"><h1>Latihan soal</h1>
  <p>Soal ${qz.i + 1} dari ${qz.q.length}. Ciri khas berikut milik penyakit apa?</p>
  <p class="bq">${esc(c.ciri)}</p>
  <div class="opts">${o.map(d => `<button class="opt" data-id="${d.id}">${esc(d.judul)}</button>`).join('')}</div>
  <div id="fb" aria-live="polite"></div></div>`;
  main.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const ok = b.dataset.id == c.id;
    if (ok) qz.s++;
    main.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.id == c.id) x.classList.add('ok'); });
    if (!ok) b.classList.add('bad');
    $('#fb').innerHTML = `<p class="fb ${ok ? 'ok' : 'bad'}">${ok ? 'Benar!' : 'Belum tepat. Jawabannya: ' + esc(c.judul)}</p>
      <button class="btn" id="nx">${qz.i + 1 < qz.q.length ? 'Soal berikutnya' : 'Lihat skor'}</button> <a class="btn ghost" href="#/penyakit/${c.id}">Pelajari topik ini</a>`;
    $('#nx').onclick = () => { qz.i++; soal(); };
    $('#nx').focus();
  });
}

/* ---------- Pustaka ---------- */
function pustaka() {
  main.innerHTML = `<div class="wrap narrow"><h1>Daftar pustaka</h1>
  <p>Gaya APA edisi 7. Cek ulang halaman, DOI, dan edisi terbaru sebelum dikutip di tugasmu.</p>
  <ol class="refs">${REFS.map(r => `<li>${link(r)}</li>`).join('')}</ol></div>`;
}

/* ---------- Router ---------- */
function route() {
  const [p, id] = location.hash.replace(/^#\/?/, '').split('/');
  document.title = 'Nefro-Uro Belajar — Materi Blok Genitourinari';
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === (p || '')));
  if (p === 'penyakit') id ? detail(id) : list();
  else if (p === 'latihan') quiz();
  else if (p === 'pustaka') pustaka();
  else home();
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();