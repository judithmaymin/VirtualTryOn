
const $ = (id) => document.getElementById(id);
const AUTH_USERS_KEY = 'vt_users_v1';
const AUTH_SESSION_KEY = 'vt_session_v1';
const WARDROBE_KEY = 'vt_wardrobe_v1';

// Al abrir o recargar la app, siempre se cierra la sesión activa.
// Los usuarios registrados se conservan, pero nadie queda iniciado automáticamente.
localStorage.removeItem(AUTH_SESSION_KEY);
let pendingAction = null;
let authMode = 'login';
let currentOutfit = { title: '', desc: '', img: '', garmentUrl: '', store: '' };

const HERO_CLOTHES = {
    default: {
        label: 'Camiseta base',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#67e8f9"/><stop offset="1" stop-color="#2563eb"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#00f2ff" flood-opacity=".35"/></filter></defs><path filter="url(#s)" d="M78 54l32-18h40l32 18 42 34-31 39-18-15v102H85V112l-18 15-31-39 42-34z" fill="url(#g)" stroke="rgba(255,255,255,.75)" stroke-width="5"/><path d="M108 37c6 19 38 19 44 0" fill="none" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round"/><path d="M91 126h78M91 150h78" stroke="rgba(255,255,255,.25)" stroke-width="6" stroke-linecap="round"/></svg>`
    },
    'Urban Techwear': {
        label: 'Chaqueta techwear',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0f172a"/><stop offset=".55" stop-color="#155e75"/><stop offset="1" stop-color="#22d3ee"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="14" stdDeviation="11" flood-color="#00f2ff" flood-opacity=".36"/></filter></defs><path filter="url(#s)" d="M82 50l33-18h30l33 18 40 52-34 28-12-19v105H88V111l-12 19-34-28 40-52z" fill="url(#g)" stroke="rgba(255,255,255,.65)" stroke-width="5"/><path d="M130 42v170M101 91h58M105 124h50M102 159h55" stroke="#cffafe" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/><path d="M111 35c4 22 34 22 38 0" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/></svg>`
    },
    'Minimalist Noir': {
        label: 'Abrigo minimal noir',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#020617"/><stop offset=".55" stop-color="#27272a"/><stop offset="1" stop-color="#7c3aed"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="14" stdDeviation="11" flood-color="#7c3aed" flood-opacity=".36"/></filter></defs><path filter="url(#s)" d="M82 48l32-18h32l32 18 34 56-29 27-11-18 26 104H62l26-104-11 18-29-27 34-56z" fill="url(#g)" stroke="rgba(255,255,255,.65)" stroke-width="5"/><path d="M128 47l-25 168M132 47l25 168" stroke="#e9d5ff" stroke-opacity=".45" stroke-width="5"/><path d="M110 31c5 24 35 24 40 0" fill="none" stroke="#c4b5fd" stroke-width="8" stroke-linecap="round"/></svg>`
    },
    'Active Flow': {
        label: 'Set deportivo',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#22c55e"/><stop offset=".55" stop-color="#14b8a6"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="14" stdDeviation="11" flood-color="#22c55e" flood-opacity=".32"/></filter></defs><path filter="url(#s)" d="M85 57l29-21h32l29 21 34 38-28 31-14-18v83H93v-83l-14 18-28-31 34-38z" fill="url(#g)" stroke="rgba(255,255,255,.7)" stroke-width="5"/><path d="M94 139h72M105 82l25 29 25-29" stroke="#ecfeff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/><path d="M96 204h68" stroke="#052e16" stroke-opacity=".35" stroke-width="18" stroke-linecap="round"/></svg>`
    },
    'Cyber Sunset': {
        label: 'Outfit cyber sunset',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f97316"/><stop offset=".45" stop-color="#ec4899"/><stop offset="1" stop-color="#7c3aed"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="14" stdDeviation="11" flood-color="#ec4899" flood-opacity=".42"/></filter></defs><path filter="url(#s)" d="M80 53l35-18h30l35 18 39 46-31 35-14-22v101H86V112l-14 22-31-35 39-46z" fill="url(#g)" stroke="rgba(255,255,255,.7)" stroke-width="5"/><path d="M88 105c34 20 50 20 84 0M96 144c28 17 41 17 68 0M112 37c4 21 32 21 36 0" stroke="#fdf2f8" stroke-opacity=".7" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="130" cy="76" r="8" fill="#00f2ff" opacity=".85"/></svg>`
    }
};

const GARMENT_TYPE_OPTIONS = [
    'camiseta','camisa','blusa','top','sudadera','jersey','chaqueta','abrigo','americana','vestido','mono','falda','pantalón','jeans','shorts','legging','chándal','bikini','bañador','pijama','zapatillas','botas','sandalias','tacones','bolso','gorra','bufanda'
];

const GARMENT_TYPE_LABELS = {
    'camiseta':'Camiseta','camisa':'Camisa','blusa':'Blusa','top':'Top','sudadera':'Sudadera','jersey':'Jersey','chaqueta':'Chaqueta','abrigo':'Abrigo','americana':'Americana / blazer','vestido':'Vestido','mono':'Mono','falda':'Falda','pantalón':'Pantalón','jeans':'Jeans','shorts':'Shorts','legging':'Leggings','chándal':'Chándal','bikini':'Bikini','bañador':'Bañador','pijama':'Pijama','zapatillas':'Zapatillas','botas':'Botas','sandalias':'Sandalias','tacones':'Tacones','bolso':'Bolso','gorra':'Gorra','bufanda':'Bufanda'
};

function getGarmentTypeLabel(type){
    return GARMENT_TYPE_LABELS[type] || 'Prenda';
}

function inferGarmentType(data = {}) {
    const explicit = (data.garmentType || '').toLowerCase();
    if (explicit && GARMENT_TYPE_OPTIONS.includes(explicit)) return explicit;
    const raw = `${data.garmentUrl || ''} ${data.description || ''} ${data.outfit || ''}`.toLowerCase();
    const checks = [
        ['vestido',['vestido','dress']],
        ['mono',['mono','jumpsuit']],
        ['falda',['falda','skirt']],
        ['pantalón',['pantalon','pantalón','trouser']],
        ['jeans',['jean','denim']],
        ['shorts',['short','bermuda']],
        ['legging',['legging','malla']],
        ['chaqueta',['chaqueta','jacket']],
        ['abrigo',['abrigo','coat']],
        ['americana',['americana','blazer']],
        ['sudadera',['sudadera','hoodie','sweatshirt']],
        ['jersey',['jersey','sueter','suéter','knit']],
        ['camisa',['camisa','shirt']],
        ['blusa',['blusa','blouse']],
        ['top',['top','crop']],
        ['bikini',['bikini']],
        ['bañador',['bañador','banador','swimsuit']],
        ['pijama',['pijama','pyjama','pajama']],
        ['zapatillas',['zapatillas','sneaker','tenis']],
        ['botas',['bota','boot']],
        ['sandalias',['sandalia','sandal']],
        ['tacones',['tacon','tacón','heel']],
        ['bolso',['bolso','bag','purse']],
        ['gorra',['gorra','cap']],
        ['bufanda',['bufanda','scarf']],
        ['chándal',['chandal','chándal','tracksuit']]
    ];
    for (const [type, words] of checks) {
        if (words.some(word => raw.includes(word))) return type;
    }
    return 'camiseta';
}

function createGarmentSilhouetteSvg(type = 'camiseta', color = '#67e8f9') {
    const stroke = 'rgba(255,255,255,.78)';
    const base = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260">
      <defs>
        <linearGradient id="garGlow" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${color}"/>
          <stop offset="1" stop-color="#2563eb"/>
        </linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#00f2ff" flood-opacity=".28"/></filter>
      </defs>
      __SHAPE__
    </svg>`;

    const map = {
      'camiseta': `<path filter="url(#shadow)" d="M78 54l32-18h40l32 18 42 34-31 39-18-15v102H85V112l-18 15-31-39 42-34z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M108 37c6 19 38 19 44 0" fill="none" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round"/>`,
      'camisa': `<path filter="url(#shadow)" d="M80 50l34-18h32l34 18 36 50-28 26-18-18v108H90V108l-18 18-28-26 36-50z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M130 38v176M111 38c4 18 34 18 38 0" fill="none" stroke="#e0f2fe" stroke-width="7" stroke-linecap="round"/>`,
      'blusa': `<path filter="url(#shadow)" d="M78 62c16-18 38-28 52-28s36 10 52 28l24 40-24 16-18-14-10 108H106L96 104l-18 14-24-16 24-40z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'top': `<path filter="url(#shadow)" d="M95 68c10-18 25-28 35-28s25 10 35 28l14 38-14 12-16-10-8 74h-22l-8-74-16 10-14-12 14-38z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'sudadera': `<path filter="url(#shadow)" d="M76 58l34-18h40l34 18 30 32-22 34-22-12v102H90V112l-22 12-22-34 30-32z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><rect x="112" y="128" width="36" height="26" rx="10" fill="rgba(255,255,255,.18)"/>`,
      'jersey': `<path filter="url(#shadow)" d="M82 56l34-20h28l34 20 28 38-22 28-16-10v102H92V112l-16 10-22-28 28-38z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M106 42c6 18 42 18 48 0" fill="none" stroke="#e0f2fe" stroke-width="7"/>`,
      'chaqueta': `<path filter="url(#shadow)" d="M82 50l33-18h30l33 18 40 52-34 28-12-19v105H88V111l-12 19-34-28 40-52z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M130 42v170" stroke="#cffafe" stroke-opacity=".55" stroke-width="5"/>`,
      'abrigo': `<path filter="url(#shadow)" d="M82 42l32-16h32l32 16 34 56-29 27-11-18 26 110H62l26-110-11 18-29-27 34-56z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M128 41l-25 176M132 41l25 176" stroke="#e0f2fe" stroke-opacity=".4" stroke-width="5"/>`,
      'americana': `<path filter="url(#shadow)" d="M84 54l30-18h32l30 18 32 46-28 28-16-18v102H96V110l-16 18-28-28 32-46z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M130 42v170" stroke="#e0f2fe" stroke-opacity=".35" stroke-width="5"/>`,
      'vestido': `<path filter="url(#shadow)" d="M108 38c7 16 37 16 44 0l28 22 18 142c-42 22-94 22-136 0L80 60l28-22z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M96 108h68M90 150h80" stroke="rgba(255,255,255,.22)" stroke-width="6" stroke-linecap="round"/>`,
      'mono': `<path filter="url(#shadow)" d="M102 34c6 20 50 20 56 0l20 24-6 58-16 90h-26l-8-66-8 66H88l-16-90-6-58 20-24z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'falda': `<path filter="url(#shadow)" d="M92 70h76l24 128c-40 18-84 18-124 0L92 70z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><rect x="88" y="52" width="84" height="24" rx="8" fill="rgba(255,255,255,.18)"/>`,
      'pantalón': `<path filter="url(#shadow)" d="M88 48h84l-8 68-16 102h-26l-8-72-8 72H80L64 116l24-68z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'jeans': `<path filter="url(#shadow)" d="M88 48h84l-8 68-16 102h-26l-8-72-8 72H80L64 116l24-68z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M130 48v44M96 96h68" stroke="rgba(255,255,255,.25)" stroke-width="5"/>`,
      'shorts': `<path filter="url(#shadow)" d="M86 54h88l-6 52-16 54h-28l-8-28-8 28H80l-16-54-6-52z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'legging': `<path filter="url(#shadow)" d="M98 42h64l-4 48-14 126h-24l-14-126-4-48z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'chándal': `<g filter="url(#shadow)"><path d="M76 58l34-18h40l34 18 30 32-22 34-22-12v70H90v-70l-22 12-22-34 30-32z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M98 148h64l-4 28-14 42h-24l-14-42-4-28z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/></g>`,
      'bikini': `<g filter="url(#shadow)"><path d="M92 84l38-34 38 34-16 16-22-18-22 18-16-16z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M92 146c18-16 58-16 76 0l-12 46H104l-12-46z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/></g>`,
      'bañador': `<path filter="url(#shadow)" d="M108 42c4 14 40 14 44 0l14 26-8 118c-18 10-38 10-56 0L94 68l14-26z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'pijama': `<g filter="url(#shadow)"><path d="M84 54l30-16h32l30 16 24 38-18 22-18-12v74H96v-74l-18 12-18-22 24-38z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M98 176h64l-4 22-14 20h-24l-14-20-4-22z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/></g>`,
      'zapatillas': `<g filter="url(#shadow)"><path d="M38 148h74l28 24c12 0 22 8 22 18v10H30v-16c0-20 10-36 28-36z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M148 148h74l28 24c12 0 22 8 22 18v10H140v-16c0-20 10-36 28-36z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/></g>`,
      'botas': `<g filter="url(#shadow)"><path d="M60 56h46v96l12 20v28H38v-28l22-20z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M154 56h46v96l12 20v28h-80v-28l22-20z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/></g>`,
      'sandalias': `<g filter="url(#shadow)"><path d="M34 170h90c18 0 28 10 28 22v8H34z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M140 170h90c18 0 28 10 28 22v8H140z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M56 152h42M162 152h42" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round"/></g>`,
      'tacones': `<g filter="url(#shadow)"><path d="M44 168h70l20 22v12H42v-8l22-26z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M146 168h70l20 22v12h-92v-8l22-26z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M102 192l-8 28M204 192l-8 28" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round"/></g>`,
      'bolso': `<path filter="url(#shadow)" d="M74 96h112l10 96H64l10-96z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M96 98c0-28 14-42 34-42s34 14 34 42" fill="none" stroke="#e0f2fe" stroke-width="8"/>`,
      'gorra': `<path filter="url(#shadow)" d="M58 138c0-44 30-72 72-72s72 28 72 72H58z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path d="M128 138h80c0 24-18 38-44 38h-36z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`,
      'bufanda': `<path filter="url(#shadow)" d="M104 28h42v116c0 20-12 32-32 32h-10V28z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/><path filter="url(#shadow)" d="M144 98h30v110h-42V118c0-12 4-20 12-20z" fill="url(#garGlow)" stroke="${stroke}" stroke-width="5"/>`
    };

    return base.replace('__SHAPE__', map[type] || map['camiseta']);
}

function garmentTypeToDataUri(type = 'camiseta', color = '#67e8f9') {
    return svgToDataUri(createGarmentSilhouetteSvg(type, color));
}

function garmentColorToHex(color) {
    if (color === 'purple') return '#8b5cf6';
    if (color === 'black') return '#1f2937';
    return '#67e8f9';
}

function svgToDataUri(svg){
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function changeHeroClothing(outfitName='default'){
    const item = HERO_CLOTHES[outfitName] || HERO_CLOTHES.default;
    const img = $('hero-clothing');
    const label = $('hero-clothing-label');
    if (!img) return;
    img.classList.add('changing');
    setTimeout(()=>{
        img.src = svgToDataUri(item.svg);
        img.alt = item.label;
        if (label) label.innerText = item.label;
        img.classList.remove('changing');
    }, 160);
}

let selectedColor = 'cyan';
let lastAvatarPrompt = '';
let lastAvatarDataUrl = '';
const AI_AVATAR_ENDPOINT = null; // Ejemplo: '/api/generate-avatar'
let demoInterval = null;
let demoCompletionTimeout = null;
let demoAutoCloseTimeout = null;
let demoIsRunning = false;

function getUsers(){ return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]'); }
function saveUsers(users){ localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users)); }
function getSession(){ return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null'); }
function setSession(user){ localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username:user.username, name:user.name || user.username })); changeHeroClothing();
updateAuthUI(); renderWardrobe(); }
function logout(){ localStorage.removeItem(AUTH_SESSION_KEY); changeHeroClothing();
updateAuthUI(); renderWardrobe(); showToast('Sesión cerrada'); }
function isLoggedIn(){ return Boolean(getSession()); }

function updateAuthUI(){
    const session = getSession();
    const nav = $('auth-nav');
    const heroMessage = $('auth-hero-message');

    if (heroMessage) {
        if (session) {
            heroMessage.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-green-500/15 flex items-center justify-center text-xl">✅</div><div><p class="text-white font-black text-sm">Ya puedes empezar a probar</p><p class="text-slate-400 text-xs leading-relaxed mt-1">Sesión iniciada como <span class="text-cyan-300 font-bold">${escapeHtml(session.name)}</span>. Pega un enlace de prenda y genera tu avatar con IA.</p></div>`;
        } else {
            heroMessage.innerHTML = `<div class="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-xl">✨</div><div><p class="text-white font-black text-sm">Empieza en menos de un minuto</p><p class="text-slate-400 text-xs leading-relaxed mt-1">Solo necesitas una cuenta para desbloquear el probador y guardar tus looks.</p></div>`;
        }
    }

    if (!nav) return;
    if (session) {
        nav.innerHTML = `<button type="button" id="download-app-btn" class="hidden sm:inline-flex bg-white/10 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-white/20 transition uppercase tracking-widest">App</button><button type="button" onclick="openWardrobeOrLogin()" class="hidden sm:inline-flex bg-cyan-500/10 text-cyan-300 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-cyan-500/20 transition uppercase tracking-widest">Armario</button><div class="user-pill"><span>Hola, ${escapeHtml(session.name)}</span><button type="button" onclick="logout()">Salir</button></div>`;
    } else {
        nav.innerHTML = `<button type="button" id="download-app-btn" class="hidden sm:inline-flex bg-white/10 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-white/20 transition uppercase tracking-widest">App</button><button type="button" onclick="openWardrobeOrLogin()" class="hidden sm:inline-flex bg-cyan-500/10 text-cyan-300 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-cyan-500/20 transition uppercase tracking-widest">Armario</button><button type="button" id="login-nav-btn" onclick="openAuthModal('login')" class="bg-white text-black px-7 py-2.5 rounded-full font-bold text-xs hover:bg-cyan-400 transition uppercase tracking-widest">Iniciar sesión</button>`;
    }
    const dl = $('download-app-btn');
    if (dl) dl.addEventListener('click', openDownloadModal);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

function openAuthModal(mode='login', action=null){
    authMode = mode; pendingAction = action; switchAuthMode(mode);
    $('auth-modal')?.classList.add('active'); document.body.style.overflow = 'hidden';
}
function closeAuthModal(){ $('auth-modal')?.classList.remove('active'); document.body.style.overflow = 'auto'; clearAuthError(); }
function switchAuthMode(mode){
    authMode = mode;
    $('login-tab')?.classList.toggle('active', mode === 'login');
    $('register-tab')?.classList.toggle('active', mode === 'register');
    $('name-field')?.classList.toggle('hidden', mode !== 'register');
    if ($('auth-title')) $('auth-title').innerText = mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
    if ($('auth-subtitle')) $('auth-subtitle').innerText = mode === 'login' ? 'Accede para poder probar ropa y generar looks con IA.' : 'Regístrate para desbloquear el probador virtual.';
    if ($('auth-submit')) $('auth-submit').innerText = mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
    clearAuthError();
}
function showAuthError(msg){ const el=$('auth-error'); if(!el)return; el.innerText=msg; el.classList.remove('hidden'); }
function clearAuthError(){ $('auth-error')?.classList.add('hidden'); }

document.addEventListener('submit', (e)=>{
    if (e.target?.id !== 'auth-form') return;
    e.preventDefault();
    updateHeroUI();
    const username = $('auth-username').value.trim().toLowerCase();
    const password = $('auth-password').value;
    const name = $('auth-name')?.value.trim() || username;
    if (!username || !password) return showAuthError('Introduce usuario y contraseña.');
    if (password.length < 6) return showAuthError('La contraseña debe tener al menos 6 caracteres.');
    const users = getUsers();
    if (authMode === 'register') {
        if (users.some(u => u.username === username)) return showAuthError('Ese usuario ya existe.');
        const user = { username, password, name, createdAt: new Date().toISOString() };
        users.push(user); saveUsers(users); setSession(user); closeAuthModal(); showToast('Cuenta creada'); runPendingAction();
    } else {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return showAuthError('Usuario o contraseña incorrectos. Puedes registrarte.');
        setSession(user); closeAuthModal(); showToast('Sesión iniciada'); runPendingAction();
    }
});
function runPendingAction(){ const action = pendingAction; pendingAction = null; if (typeof action === 'function') setTimeout(action, 150); }
function requireLogin(action){ if (isLoggedIn()) return action(); openAuthModal('login', action); showToast('Inicia sesión para probar'); }

function startProtectedTryOn(){ requireLogin(()=>scrollToSection('probador')); }
function requireLoginOpenEditor(title, desc, img){ changeHeroClothing('default'); requireLogin(()=>openEditor(title, desc, img)); }
function requireLoginOpenUniversalTryOn(){ requireLogin(()=>openEditor('Probador universal', 'Pega el enlace de cualquier prenda online para probarla con IA.', '')); }

// Partículas
const particleContainer = $('particles');
if (particleContainer) {
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        const size = Math.random() * 4 + 2 + 'px'; p.style.width = size; p.style.height = size;
        p.style.top = Math.random()*100+'%'; p.style.left = Math.random()*100+'%';
        p.style.setProperty('--duration', (Math.random()*4+3)+'s'); p.style.animationDelay = Math.random()*5+'s';
        particleContainer.appendChild(p);
    }
}

const demoOverlay = $('demo-overlay'), demoStatus = $('demo-status'), demoMainText = $('demo-main-text'), demoProgressBar = $('demo-progress-bar');
const demoSteps = [
    { status:'Mapeando entorno 3D...', text:'Ponte frente a la cámara...', progress:20 },
    { status:'Calibrando biometría...', text:'Detectando dimensiones...', progress:45 },
    { status:'Generando nube de puntos...', text:'Renderizando outfit...', progress:75 },
    { status:'Holograma sincronizado.', text:'¡Estás impecable!', progress:100 }
];
function resetDemoTimers(){
    clearInterval(demoInterval);
    clearTimeout(demoCompletionTimeout);
    clearTimeout(demoAutoCloseTimeout);
    demoInterval = null;
    demoCompletionTimeout = null;
    demoAutoCloseTimeout = null;
}
function resetDemoUI(){
    if (!demoOverlay) return;
    demoOverlay.style.background = 'black';
    if (demoStatus) demoStatus.innerText = 'Sincronizando Biometría...';
    if (demoMainText) {
        demoMainText.style.color = 'white';
        demoMainText.innerText = 'Iniciando Try On...';
    }
    if (demoProgressBar) demoProgressBar.style.width = '0%';
}
function startDemo(){
    if(!demoOverlay)return;
    resetDemoTimers();
    resetDemoUI();
    demoIsRunning = true;
    demoOverlay.style.display='flex';
    document.body.style.overflow='hidden';
    let step=0;
    demoInterval=setInterval(()=>{
        if(!demoIsRunning) return;
        if(step<demoSteps.length){
            demoStatus.innerText=demoSteps[step].status;
            demoMainText.innerText=demoSteps[step].text;
            demoProgressBar.style.width=demoSteps[step].progress+'%';
            step++;
        } else {
            clearInterval(demoInterval);
            demoInterval = null;
            demoCompletionTimeout=setTimeout(()=>{
                if(!demoIsRunning) return;
                demoOverlay.style.background='white';
                demoMainText.style.color='black';
                demoMainText.innerText='ESCANEO COMPLETADO';
                demoAutoCloseTimeout=setTimeout(()=>stopDemo(false),1500);
            },800);
        }
    },1200);
}
function stopDemo(showAbortMessage = true){
    if(!demoOverlay)return;
    const wasRunning = demoIsRunning;
    demoIsRunning = false;
    resetDemoTimers();
    demoOverlay.style.display='none';
    resetDemoUI();
    document.body.style.overflow='auto';
    if (showAbortMessage && wasRunning) showToast('Escaneo abortado');
}

const modal = $('outfit-editor'), modalTitle = $('modal-title'), modalDesc = $('modal-desc'), modalImg = $('modal-img');
function openEditor(title, desc, img){
    currentOutfit = {
        title: 'Prenda online',
        desc: 'Prenda obtenida desde enlace de referencia',
        img: img || '',
        garmentUrl: '',
        store: ''
    };

    if (modalTitle) modalTitle.innerText = 'Probador universal';
    if (modalDesc) {
        modalDesc.innerText = 'Pega el enlace de la prenda que quieres probar. Puede ser de Zara o de cualquier otra tienda online.';
    }

    const linkInput = $('garment-link');
    if (linkInput) {
        linkInput.value = '';
        linkInput.placeholder = 'Ej: https://www.zara.com/es/...';
    }

    clearGarmentLinkError();
    updateGarmentLinkPreview('');
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeEditor(){ modal?.classList.remove('active'); document.body.style.overflow='auto'; }

function openWardrobeOrLogin(){
    if (!isLoggedIn()) {
        openAuthModal('login', () => scrollToSection('armario'));
        showToast('Inicia sesión para acceder a tu armario');
        return;
    }
    scrollToSection('armario');
}
function scrollToSection(sectionId){
    if (sectionId === 'armario' && !isLoggedIn()) {
        openAuthModal('login', () => scrollToSection('armario'));
        showToast('Inicia sesión para acceder a tu armario');
        return;
    }
    const s=$(sectionId);
    if(s) s.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('.nav-link[data-target]').forEach(link=>link.addEventListener('click',()=>scrollToSection(link.dataset.target)));
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const trackSections = ['probador','tecnologia','beneficios'].map($).filter(Boolean);
if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting) navLinks.forEach(l=>l.classList.toggle('active', l.dataset.target===entry.target.id)); }); }, {threshold:.35});
    trackSections.forEach(s=>navObs.observe(s));
}
const revealObs = new IntersectionObserver(entries=>entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.1});
document.querySelectorAll('section, main > div').forEach(el=>{ el.classList.add('scroll-reveal'); revealObs.observe(el); });

const downloadModal = $('download-modal'), toast = $('toast');
function openDownloadModal(){ downloadModal?.classList.add('active'); document.body.style.overflow='hidden'; }
function closeDownloadModal(){ downloadModal?.classList.remove('active'); document.body.style.overflow='auto'; }
function simulateDownload(platform){ closeDownloadModal(); showToast(`Descarga para ${platform} iniciada`); }
function showToast(message){ if(!toast)return; toast.innerText=message; toast.classList.add('active'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('active'),2400); }

// Avatar IA: demo fotorealista local + endpoint preparado

function normalizeGarmentUrl(value){
    const raw = String(value || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
function getStoreFromUrl(url){
    try {
        const host = new URL(url).hostname.replace(/^www\./i, '');
        if (host.includes('zara.')) return 'Zara';
        if (host.includes('mango.')) return 'Mango';
        if (host.includes('hm.')) return 'H&M';
        if (host.includes('pullandbear.')) return 'Pull&Bear';
        if (host.includes('bershka.')) return 'Bershka';
        if (host.includes('stradivarius.')) return 'Stradivarius';
        return host;
    } catch { return 'tienda online'; }
}
function validateGarmentLink(){
    const input = $('garment-link');
    const value = normalizeGarmentUrl(input?.value);
    const error = $('garment-link-error');
    if (!value) {
        if (error) { error.innerText = 'Añade el enlace de referencia de la prenda que quieres probar.'; error.classList.remove('hidden'); }
        input?.focus();
        return null;
    }
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error('URL no válida');
        clearGarmentLinkError();
        if (input) input.value = url.href;
        updateGarmentLinkPreview(url.href);
        return url.href;
    } catch {
        if (error) { error.innerText = 'Introduce un enlace válido. Ejemplo: https://www.zara.com/es/...'; error.classList.remove('hidden'); }
        input?.focus();
        return null;
    }
}
function clearGarmentLinkError(){ $('garment-link-error')?.classList.add('hidden'); }
function updateGarmentLinkPreview(value){
    const preview = $('garment-link-preview');
    if (!preview) return;
    const url = normalizeGarmentUrl(value);
    if (!url) { preview.classList.add('hidden'); preview.innerHTML = ''; return; }
    const store = getStoreFromUrl(url);
    preview.innerHTML = `<span>Referencia detectada:</span><strong>${escapeHtml(store)}</strong><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir enlace</a>`;
    preview.classList.remove('hidden');
}

function collectAvatarSelections(){
    const motionLabels = ['estático', 'caminando', 'corriendo'];
    const waistEl = $('avatar-waist');
    const waist = Number(waistEl?.value || 50);

    const garmentUrl = validateGarmentLink();
    if (!garmentUrl) return null;

    const store = getStoreFromUrl(garmentUrl);
    const garmentType = inferGarmentType({ garmentType: $('garment-type')?.value || 'camiseta', garmentUrl });
    const garmentTypeLabel = getGarmentTypeLabel(garmentType);

    currentOutfit.garmentUrl = garmentUrl;
    currentOutfit.store = store;
    currentOutfit.title = garmentTypeLabel;
    currentOutfit.desc = `${garmentTypeLabel} tomada como referencia desde ${store}`;

    return {
        outfit: garmentTypeLabel,
        garmentType,
        description: `${garmentTypeLabel} de referencia obtenida desde el enlace de producto de ${store}`,
        garmentUrl,
        store,
        body: $('avatar-body')?.value || 'atlético',
        height: $('avatar-height')?.value || '1.82m',
        waist: waist < 35 ? 'entallado' : waist > 65 ? 'holgado' : 'estándar',
        motion: motionLabels[Number($('avatar-motion')?.value || 0)],
        color: selectedColor,
        style: 'fotografía realista editorial de moda'
    };
}
function buildAvatarPrompt(d){
    const garmentLabel = getGarmentTypeLabel(inferGarmentType(d));
    return `Foto realista de cuerpo completo de una persona con tipo corporal ${d.body}, altura ${d.height}.
Debe llevar una ${garmentLabel.toLowerCase()} obtenida desde este enlace de referencia: ${d.garmentUrl} (${d.store}).
Usa la página del producto como referencia visual para identificar el tipo de prenda, corte, tejido, color, largo, caída y estilo.
El tipo de prenda seleccionado por el usuario es: ${garmentLabel}.
Ajuste ${d.waist}, pose ${d.motion}, variante de color ${d.color}.
Iluminación de estudio, detalle textil realista, piel natural, proporciones creíbles, fondo oscuro premium, sin texto y sin logos visibles.`;
}
async function generateAIAvatar(event){
    requireLogin(async()=>{
        const btn=event?.target; if(btn){ btn.disabled=true; btn.innerText='GENERANDO CON IA...'; btn.classList.add('animate-pulse'); }
        const data=collectAvatarSelections(); if (!data) { if(btn){ btn.disabled=false; btn.innerText='ESCANEAR Y GENERAR LOOK'; btn.classList.remove('animate-pulse'); } return; } const prompt=buildAvatarPrompt(data); lastAvatarPrompt=prompt; closeEditor(); openAvatarResult(prompt);
        try { const url = AI_AVATAR_ENDPOINT ? await requestRealAIAvatar(prompt,data) : await createDemoAvatar(data); showGeneratedAvatar(url, data.outfit); showToast('Avatar generado'); }
        catch(err){ console.error(err); showToast('Error de IA: usando demo'); showGeneratedAvatar(await createDemoAvatar(data), data.outfit); }
        finally { if(btn){ btn.disabled=false; btn.innerText='ESCANEAR Y GENERAR LOOK'; btn.classList.remove('animate-pulse'); } }
    });
}
function updateHeroUI() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const heroBox = document.getElementById("hero-login-box");

    if (currentUser) {
        if (heroBox) heroBox.style.display = "none";
    } else {
        if (heroBox) heroBox.style.display = "block";
    }
}
async function requestRealAIAvatar(prompt,data){ const r=await fetch(AI_AVATAR_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,selections:data})}); if(!r.ok) throw new Error('endpoint IA'); const j=await r.json(); if(!j.imageUrl) throw new Error('falta imageUrl'); return j.imageUrl; }
function openAvatarResult(prompt){ $('avatar-result-modal')?.classList.add('active'); $('avatar-loader')?.classList.remove('hidden'); $('generated-avatar-img')?.classList.add('hidden'); if($('avatar-prompt')) $('avatar-prompt').value=prompt; document.body.style.overflow='hidden'; }
function showGeneratedAvatar(url,title){ lastAvatarDataUrl=url; if($('generated-avatar-img')){ $('generated-avatar-img').src=url; $('generated-avatar-img').classList.remove('hidden'); } $('avatar-loader')?.classList.add('hidden'); if($('avatar-result-title')) $('avatar-result-title').innerText=`${title} generado`; }
function closeAvatarResult(){ $('avatar-result-modal')?.classList.remove('active'); document.body.style.overflow='auto'; }
function regenerateAvatar(event){ generateAIAvatar(event); }
function downloadAvatar(){ if(!lastAvatarDataUrl) return showToast('Todavía no hay imagen'); const a=document.createElement('a'); a.href=lastAvatarDataUrl; a.download='avatar-virtual-tryon.png'; a.click(); }
async function createDemoAvatar(d){
    return new Promise(resolve=>setTimeout(()=>{
        const c=document.createElement('canvas'); c.width=900; c.height=1200; const ctx=c.getContext('2d');
        const grad=ctx.createLinearGradient(0,0,900,1200); grad.addColorStop(0,'#101827'); grad.addColorStop(.55,'#071018'); grad.addColorStop(1,'#160b2d'); ctx.fillStyle=grad; ctx.fillRect(0,0,900,1200);
        ctx.fillStyle='rgba(0,242,255,.12)'; ctx.beginPath(); ctx.arc(450,430,260,0,Math.PI*2); ctx.fill();
        const skin='#d5a57b'; ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(450,230,70,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#2b1d17'; ctx.beginPath(); ctx.arc(450,195,78,Math.PI,Math.PI*2); ctx.fill();
        ctx.fillStyle = d.color==='purple' ? '#5b21b6' : d.color==='black' ? '#111827' : '#0891b2';
        ctx.beginPath(); ctx.moveTo(330,330); ctx.quadraticCurveTo(450,285,570,330); ctx.lineTo(620,760); ctx.quadraticCurveTo(450,850,280,760); ctx.closePath(); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(340,390,220,10); ctx.fillRect(330,455,240,8);
        ctx.strokeStyle='rgba(0,242,255,.9)'; ctx.lineWidth=5; ctx.strokeRect(290,320,320,470);
        ctx.fillStyle=skin; ctx.fillRect(245,350,70,340); ctx.fillRect(585,350,70,340);
        ctx.fillStyle='#0f172a'; ctx.fillRect(350,790,70,300); ctx.fillRect(480,790,70,300);
        ctx.fillStyle='#e2e8f0'; ctx.font='800 34px Plus Jakarta Sans, Arial'; ctx.fillText('FOTO IA DEMO',60,80); ctx.font='500 24px Arial'; wrapText(ctx, `${d.outfit} · ${d.body} · ${getGarmentTypeLabel(inferGarmentType(d))} · ${d.waist}`, 60, 1120, 780, 34);
        resolve(c.toDataURL('image/png'));
    },1200));
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight){ const words=text.split(' '); let line=''; for(const w of words){ const test=line+w+' '; if(ctx.measureText(test).width>maxWidth){ ctx.fillText(line,x,y); line=w+' '; y+=lineHeight; } else line=test; } ctx.fillText(line,x,y); }

const waistInput=$('avatar-waist'), motionInput=$('avatar-motion');
if(waistInput) waistInput.addEventListener('input',()=>{ const v=Number(waistInput.value); const el=$('val-waist'); if(el) el.innerText=v<35?'Entallado':v>65?'Holgado':'Standard'; });
if(motionInput) motionInput.addEventListener('input',()=>{ const labels=['Estático','Caminando','Corriendo']; const el=$('val-motion'); if(el) el.innerText=labels[motionInput.value]; });
document.querySelectorAll('.color-dot[data-color]').forEach(btn=>btn.addEventListener('click',()=>{ selectedColor=btn.dataset.color; document.querySelectorAll('.color-dot').forEach(b=>b.classList.toggle('active',b===btn)); }));
const garmentLinkInput = $('garment-link');
if (garmentLinkInput) {
    garmentLinkInput.addEventListener('input', () => { clearGarmentLinkError(); updateGarmentLinkPreview(garmentLinkInput.value); });
    garmentLinkInput.addEventListener('blur', () => { if (garmentLinkInput.value.trim()) validateGarmentLink(); });
}

window.addEventListener('click', (e)=>{ if(e.target===modal) closeEditor(); if(e.target===downloadModal) closeDownloadModal(); if(e.target===$('auth-modal')) closeAuthModal(); if(e.target===$('avatar-result-modal')) closeAvatarResult(); });
changeHeroClothing();
updateAuthUI();

/* === Mejoras funcionales tras el feedback de evaluación ===
   - Botones claros de Volver/Cancelar/Reiniciar.
   - Simulación de escaneo antes de mostrar el resultado.
   - Informe de ajuste para que el usuario entienda la talla y las zonas críticas.
*/
let scanTimerV2 = null;
let scanStepV2 = 0;
let pendingScanDataV2 = null;
let pendingScanPromptV2 = '';

const SCAN_STEPS_V2 = [
    { title: 'Detectando entorno...', desc: 'Analizando iluminación, distancia y posición del cuerpo dentro de la silueta.', progress: 18 },
    { title: 'Calibrando medidas...', desc: 'Simulando altura, hombros, pecho, cintura, cadera y largo de pierna.', progress: 42 },
    { title: 'Interpretando prenda...', desc: 'Leyendo el enlace del producto para extraer corte, tejido, largo y estilo.', progress: 68 },
    { title: 'Calculando ajuste...', desc: 'Comparando tus medidas simuladas con la prenda y preparando el look final.', progress: 88 },
    { title: 'Escaneo completado', desc: 'Resultado listo. Generando imagen demo y análisis de ajuste.', progress: 100 }
];

function getScanElsV2(){
    return {
        modal: document.getElementById('scan-flow-modal'),
        title: document.getElementById('scan-title'),
        desc: document.getElementById('scan-description'),
        progress: document.getElementById('scan-progress'),
        percent: document.getElementById('scan-percent'),
        checks: document.querySelectorAll('#scan-checks [data-step]')
    };
}

function setScanStepV2(i){
    const els = getScanElsV2();
    const step = SCAN_STEPS_V2[Math.min(i, SCAN_STEPS_V2.length - 1)];
    if (els.title) els.title.innerText = step.title;
    if (els.desc) els.desc.innerText = step.desc;
    if (els.progress) els.progress.style.width = step.progress + '%';
    if (els.percent) els.percent.innerText = step.progress + '%';
    els.checks.forEach((check, idx) => check.classList.toggle('done', idx < i));
}

function openScanFlowV2(data, prompt){
    pendingScanDataV2 = data;
    pendingScanPromptV2 = prompt;
    scanStepV2 = 0;
    const els = getScanElsV2();
    if (!els.modal) return finishScanFlowV2();
    els.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setScanStepV2(0);
    clearInterval(scanTimerV2);
    scanTimerV2 = setInterval(() => {
        scanStepV2 += 1;
        setScanStepV2(scanStepV2);
        if (scanStepV2 >= SCAN_STEPS_V2.length - 1) {
            clearInterval(scanTimerV2);
            scanTimerV2 = null;
            setTimeout(finishScanFlowV2, 900);
        }
    }, 1250);
}

function cancelScanFlow(){
    clearInterval(scanTimerV2);
    scanTimerV2 = null;
    pendingScanDataV2 = null;
    pendingScanPromptV2 = '';
    const els = getScanElsV2();
    els.modal?.classList.remove('active');
    document.body.style.overflow = 'auto';
    showToast('Escaneo cancelado');
}

function restartScanFlow(){
    if (!pendingScanDataV2 || !pendingScanPromptV2) return showToast('No hay escaneo activo');
    openScanFlowV2(pendingScanDataV2, pendingScanPromptV2);
}

async function finishScanFlowV2(){
    const data = pendingScanDataV2;
    const prompt = pendingScanPromptV2;
    const els = getScanElsV2();
    els.modal?.classList.remove('active');
    if (!data) return;
    openAvatarResult(prompt);
    try {
        const url = AI_AVATAR_ENDPOINT ? await requestRealAIAvatar(prompt, data) : await createDemoAvatarV2(data);
        showGeneratedAvatar(url, data.outfit || 'Look');
        renderFitReportV2(data);
        showToast('Escaneo completado');
    } catch (error) {
        console.error(error);
        const url = await createDemoAvatarV2(data);
        showGeneratedAvatar(url, data.outfit || 'Look');
        renderFitReportV2(data);
        showToast('Resultado demo generado');
    } finally {
        pendingScanDataV2 = null;
        pendingScanPromptV2 = '';
    }
}

// Sustituye la generación directa por un flujo completo: validar enlace -> escanear -> mostrar resultado.
async function generateAIAvatar(event){
    requireLogin(() => {
        const btn = event?.target;
        const data = collectAvatarSelections();
        if (!data) return;
        data.outfit = getGarmentTypeLabel(data.garmentType);
        const prompt = buildAvatarPrompt(data);
        lastAvatarPrompt = prompt;
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'ESCANEANDO...';
            btn.classList.add('animate-pulse');
            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = 'ESCANEAR Y GENERAR LOOK';
                btn.classList.remove('animate-pulse');
            }, 500);
        }
        closeEditor();
        openScanFlowV2(data, prompt);
    });
}

function renderFitReportV2(data){
    const modal = document.getElementById('avatar-result-modal');
    if (!modal) return;
    let box = document.getElementById('fit-report-box');
    if (!box) {
        const promptArea = document.getElementById('avatar-prompt')?.closest('.space-y-3');
        box = document.createElement('div');
        box.id = 'fit-report-box';
        box.className = 'fit-report';
        promptArea?.insertAdjacentElement('afterend', box);
    }
    const waistText = data.waist === 'entallado'
        ? 'Ajuste cercano al cuerpo. Revisar pecho, sisa y cintura antes de comprar.'
        : data.waist === 'holgado'
            ? 'Ajuste cómodo. Adecuado si buscas caída amplia o uso diario.'
            : 'Ajuste estándar. Equilibrio entre comodidad y forma.';
    const motionText = data.motion === 'estático'
        ? 'Vista fija para comprobar proporciones generales.'
        : `Simulación en modo ${data.motion}, pensada para comprobar caída de la tela.`;
    box.innerHTML = `
        <div class="fit-report-card"><strong>Talla recomendada: M demo</strong><span>La recomendación se calcula de forma simulada a partir del tipo corporal, el ajuste elegido y el enlace de ${escapeHtml(data.store)}.</span></div>
        <div class="fit-report-card"><strong>Zonas críticas</strong><span>${escapeHtml(waistText)} La demo marca como zonas a revisar: hombros, pecho, cintura y largo.</span></div>
        <div class="fit-report-card"><strong>Movimiento</strong><span>${escapeHtml(motionText)}</span></div>
    `;

    let actions = document.getElementById('result-actions-extra');
    if (!actions) {
        actions = document.createElement('div');
        actions.id = 'result-actions-extra';
        actions.className = 'result-actions-extra';
        box.insertAdjacentElement('afterend', actions);
    }
    actions.innerHTML = `
        <button onclick="saveCurrentToWardrobe()" class="bg-cyan-500 text-black py-4 rounded-2xl font-black hover:bg-white transition">Añadir al armario</button>
        <button onclick="closeAvatarResult(); requireLoginOpenUniversalTryOn()" class="glass py-4 rounded-2xl font-bold hover:bg-white/10 transition">Probar otra prenda</button>
        <button onclick="shareResultV2()" class="glass py-4 rounded-2xl font-bold hover:bg-white/10 transition">Compartir resultado</button>
        <button onclick="closeAvatarResult()" class="glass py-4 rounded-2xl font-bold hover:bg-white/10 transition">Cerrar prueba</button>
    `;
}


function getWardrobeUserKey(){
    const session = getSession();
    if (!session?.username) return null;
    const safeUser = String(session.username).trim().toLowerCase().replace(/[^a-z0-9_@.-]/gi, '_');
    return `${WARDROBE_KEY}_${safeUser}`;
}

function getWardrobe(){
    const key = getWardrobeUserKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
}

function setWardrobe(items){
    const key = getWardrobeUserKey();
    if (!key) {
        openAuthModal('login');
        showToast('Inicia sesión para guardar prendas');
        return;
    }
    localStorage.setItem(key, JSON.stringify(items));
    renderWardrobe();
}

function buildWardrobeItem(data = realDeviceTryOnData){
    const now = new Date();
    const garmentType = inferGarmentType(data);
    const colorHex = garmentColorToHex(data.color || 'cyan');
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        garmentType,
        type: getGarmentTypeLabel(garmentType),
        store: data.store || getStoreFromUrl(data.garmentUrl || '') || 'Tienda online',
        url: data.garmentUrl || '',
        fit: data.waist || 'estándar',
        motion: data.motion || 'estático',
        img: garmentTypeToDataUri(garmentType, colorHex),
        date: now.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' })
    };
}

function saveCurrentToWardrobe(){
    if (!isLoggedIn()) {
        openAuthModal('login', saveCurrentToWardrobe);
        showToast('Inicia sesión para guardar en tu armario');
        return;
    }
    if (!realDeviceTryOnData || !realDeviceTryOnData.garmentUrl) {
        showToast('Primero escanea una prenda');
        return;
    }
    const item = buildWardrobeItem(realDeviceTryOnData);
    const items = getWardrobe();
    const exists = items.some(x => x.url === item.url && x.fit === item.fit && x.motion === item.motion);
    if (exists) {
        showToast('Esta prenda ya está en el armario');
        scrollToSection('armario');
        return;
    }
    items.unshift(item);
    setWardrobe(items);
    showToast('Prenda añadida al armario');
    scrollToSection('armario');
}

function renderWardrobe(){
    const grid = document.getElementById('wardrobe-grid');
    const empty = document.getElementById('wardrobe-empty');
    if (!grid || !empty) return;
    const session = getSession();
    if (!session) {
        empty.classList.remove('hidden');
        empty.innerHTML = `<div class="text-5xl mb-5">🔒</div><h3 class="text-2xl font-black text-white mb-3">Armario privado</h3><p class="text-slate-400 max-w-xl mx-auto mb-6">Inicia sesión para ver y guardar tus prendas. Cada usuario tiene su propio armario independiente.</p><button type="button" onclick="openAuthModal('login', () => scrollToSection('armario'))" class="bg-cyan-500 text-black px-6 py-4 rounded-2xl font-black hover:bg-white transition">Iniciar sesión</button>`;
        grid.innerHTML = '';
        return;
    }
    const items = getWardrobe();
    empty.classList.toggle('hidden', items.length > 0);
    empty.innerHTML = `<div class="text-5xl mb-5">👗</div><h3 class="text-2xl font-black text-white mb-3">El armario de ${escapeHtml(session.name)} está vacío</h3><p class="text-slate-400 max-w-xl mx-auto">Escanea una prenda y pulsa “Añadir al armario” para guardarla aquí. Solo aparecerá en esta cuenta.</p>`;
    grid.innerHTML = items.map(item => `
        <article class="wardrobe-card glass">
            <div class="wardrobe-thumb">
                <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.type)} guardada">
                <span>${escapeHtml(item.store)}</span>
            </div>
            <div class="wardrobe-info">
                <p class="wardrobe-date">Guardado ${escapeHtml(item.date)}</p>
                <h3>${escapeHtml(item.type)}</h3>
                <p>Ajuste: ${escapeHtml(item.fit)} · Movimiento: ${escapeHtml(item.motion)}</p>
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Abrir enlace original</a>
            </div>
            <div class="wardrobe-actions">
                <button type="button" onclick="tryWardrobeItem('${escapeHtml(item.id)}')">Probar otra vez</button>
                <button type="button" onclick="removeWardrobeItem('${escapeHtml(item.id)}')">Eliminar</button>
            </div>
        </article>
    `).join('');
}

function removeWardrobeItem(id){
    setWardrobe(getWardrobe().filter(item => item.id !== id));
    showToast('Prenda eliminada');
}

function clearWardrobe(){
    if (!isLoggedIn()) {
        openAuthModal('login', () => scrollToSection('armario'));
        showToast('Inicia sesión para acceder a tu armario');
        return;
    }
    const items = getWardrobe();
    if (!items.length) return showToast('El armario ya está vacío');
    if (!confirm('¿Vaciar todo el armario?')) return;
    setWardrobe([]);
    showToast('Armario vaciado');
}

function tryWardrobeItem(id){
    if (!isLoggedIn()) {
        openAuthModal('login', () => scrollToSection('armario'));
        showToast('Inicia sesión para acceder a tu armario');
        return;
    }
    const item = getWardrobe().find(x => x.id === id);
    if (!item) return;
    realDeviceTryOnData = {
        garmentUrl: item.url,
        store: item.store,
        waist: item.fit,
        motion: item.motion,
        outfit: item.type,
        garmentType: item.garmentType || inferGarmentType({ outfit: item.type }),
        description: item.type,
        color: 'cyan'
    };
    openScanFlowV2(realDeviceTryOnData, buildAvatarPrompt(realDeviceTryOnData));
}

function shareResultV2(){
    const text = 'Mira mi resultado en Virtual Try On: probador holográfico simulado para ropa online.';
    if (navigator.share) {
        navigator.share({ title: 'Virtual Try On', text }).catch(()=>{});
    } else {
        navigator.clipboard?.writeText(text);
        showToast('Texto copiado para compartir');
    }
}

async function createDemoAvatarV2(d){
    return new Promise(resolve => setTimeout(() => {
        const c = document.createElement('canvas');
        c.width = 1000; c.height = 1300;
        const ctx = c.getContext('2d');
        const bg = ctx.createLinearGradient(0,0,1000,1300);
        bg.addColorStop(0,'#05070a'); bg.addColorStop(.42,'#0f172a'); bg.addColorStop(1,'#180b35');
        ctx.fillStyle = bg; ctx.fillRect(0,0,1000,1300);

        // suelo y holograma
        ctx.strokeStyle = 'rgba(0,242,255,.18)'; ctx.lineWidth = 2;
        for (let y=120; y<1180; y+=46) { ctx.beginPath(); ctx.moveTo(90,y); ctx.lineTo(910,y); ctx.stroke(); }
        for (let x=90; x<930; x+=46) { ctx.beginPath(); ctx.moveTo(x,120); ctx.lineTo(x,1180); ctx.stroke(); }
        ctx.fillStyle = 'rgba(0,242,255,.12)'; ctx.beginPath(); ctx.ellipse(500,635,320,470,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(103,232,249,.58)'; ctx.lineWidth = 7; ctx.stroke();

        const skin = '#d7a47f';
        ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(500,250,78,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#241812';
        ctx.beginPath(); ctx.arc(500,218,86,Math.PI,Math.PI*2); ctx.fill();
        ctx.fillRect(423,215,154,34);

        // cuello y brazos
        ctx.fillStyle = skin; ctx.fillRect(470,320,60,52);
        ctx.fillRect(278,410,68,360); ctx.fillRect(654,410,68,360);

        const colors = { cyan:'#0891b2', purple:'#6d28d9', black:'#111827' };
        ctx.fillStyle = colors[d.color] || '#0891b2';
        ctx.beginPath();
        ctx.moveTo(360,365);
        ctx.quadraticCurveTo(500,305,640,365);
        ctx.lineTo(690,820);
        ctx.quadraticCurveTo(500,910,310,820);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 5; ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.16)'; ctx.fillRect(380,450,240,10); ctx.fillRect(365,520,270,8); ctx.fillRect(385,705,225,7);

        // zonas de tensión simuladas
        ctx.fillStyle = d.waist === 'entallado' ? 'rgba(239,68,68,.55)' : 'rgba(34,197,94,.45)';
        ctx.beginPath(); ctx.ellipse(500,600,138,30,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(0,242,255,.75)';
        ctx.font = '900 22px Arial'; ctx.fillText(d.waist === 'entallado' ? 'REVISAR CINTURA' : 'AJUSTE OK', 386, 610);

        ctx.fillStyle='#0f172a'; ctx.fillRect(398,842,72,330); ctx.fillRect(530,842,72,330);
        ctx.fillStyle='#111827'; ctx.fillRect(368,1160,120,34); ctx.fillRect(512,1160,120,34);

        ctx.fillStyle='#e2e8f0'; ctx.font='900 40px Plus Jakarta Sans, Arial'; ctx.fillText('VIRTUAL TRY ON',70,82);
        ctx.fillStyle='#67e8f9'; ctx.font='900 24px Arial'; ctx.fillText('ESCANEO SIMULADO COMPLETADO',70,122);
        ctx.fillStyle='#cbd5e1'; ctx.font='500 24px Arial';
        wrapText(ctx, `${d.store} · cuerpo ${d.body} · ${getGarmentTypeLabel(inferGarmentType(d))} · ajuste ${d.waist} · movimiento ${d.motion}`, 70, 1240, 860, 32);
        resolve(c.toDataURL('image/png'));
    }, 1100));
}

// La demo de portada también se convierte en escaneo más explicativo.
function startDemo(){
    const demoData = {
        outfit: 'Vestido', garmentType: 'vestido', store: 'tienda online', body: 'avatar demo',
        waist: 'estándar', motion: 'caminando', color: 'cyan', garmentUrl: 'https://www.zara.com/es/demo'
    };
    const demoPrompt = buildAvatarPrompt(demoData);
    openScanFlowV2(demoData, demoPrompt);
}

/* === Override final: cámara REAL del dispositivo, sin avatar dibujado === */
let realDeviceCameraStream = null;
let realDeviceTryOnData = null;

function inferDeviceGarmentSvg(data = {}) {
    const garmentType = inferGarmentType(data);
    return createGarmentSilhouetteSvg(garmentType, garmentColorToHex(data.color || 'cyan'));
}

function getDeviceGarmentOverlaySrc(data = {}) {
    const url = data.garmentUrl || '';
    if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)) return url;
    return svgToDataUri(inferDeviceGarmentSvg(data));
}

function ensureRealDeviceCameraStage(data = {}) {
    const stage = document.querySelector('#avatar-result-modal .avatar-stage');
    if (!stage) return;
    stage.className = 'avatar-stage live-device-stage min-h-[520px] flex items-center justify-center p-8';
    stage.innerHTML = `
        <div class="live-device-wrap">
            <video id="device-camera-video" class="device-camera-video hidden" autoplay playsinline muted></video>
            <div id="device-camera-overlay" class="device-camera-overlay hidden" aria-hidden="true">
                <div class="device-camera-grid"></div>
                <div class="device-garment-layer"><img id="device-garment-img" alt="Prenda del enlace superpuesta"></div>
                <div class="device-scan-line"></div>
                <div class="device-camera-badge">Cámara real + IA simulada</div>
                <div class="device-camera-fit-pill">Ajuste estimado OK</div>
            </div>
            <div id="device-camera-message" class="device-camera-message">
                <h4>Activar cámara del dispositivo</h4>
                <p>El navegador abrirá la cámara real del ordenador o móvil. Acepta el permiso para ver la prenda superpuesta sobre tu imagen en directo.</p>
                <button type="button" onclick="startRealDeviceCamera(realDeviceTryOnData)">Activar cámara del dispositivo</button>
            </div>
        </div>
    `;
    const garmentImg = document.getElementById('device-garment-img');
    if (garmentImg) garmentImg.src = getDeviceGarmentOverlaySrc(data);
}

function setRealCameraMessage(title, text, button = true) {
    const msg = document.getElementById('device-camera-message');
    if (!msg) return;
    msg.classList.remove('hidden');
    msg.innerHTML = `
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(text)}</p>
        ${button ? '<button type="button" onclick="startRealDeviceCamera(realDeviceTryOnData)">Activar cámara del dispositivo</button>' : ''}
    `;
}

function hideRealCameraMessage() {
    document.getElementById('device-camera-message')?.classList.add('hidden');
}

async function startRealDeviceCamera(data = realDeviceTryOnData) {
    realDeviceTryOnData = data || realDeviceTryOnData || {};
    ensureRealDeviceCameraStage(realDeviceTryOnData);
    const video = document.getElementById('device-camera-video');
    const overlay = document.getElementById('device-camera-overlay');
    const garmentImg = document.getElementById('device-garment-img');
    if (garmentImg) garmentImg.src = getDeviceGarmentOverlaySrc(realDeviceTryOnData);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRealCameraMessage(
            'Cámara no disponible',
            'Tu navegador no permite acceder a la cámara desde este contexto. Abre la web con Live Server, localhost o HTTPS y vuelve a intentarlo.'
        );
        return;
    }

    try {
        setRealCameraMessage('Solicitando permiso de cámara', 'Acepta el permiso del navegador para abrir la cámara real del dispositivo.', false);
        stopRealDeviceCamera(false);
        realDeviceCameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        if (video) {
            video.srcObject = realDeviceCameraStream;
            await video.play();
            video.classList.remove('hidden');
        }
        overlay?.classList.remove('hidden');
        hideRealCameraMessage();
        showToast('Cámara real activada');
    } catch (error) {
        console.error(error);
        const reason = location.protocol === 'file:'
            ? 'El HTML está abierto como archivo local. La cámara suele estar bloqueada en file://. Ábrelo con Live Server en VS Code o desde http://localhost.'
            : 'No se pudo abrir la cámara. Revisa que has aceptado el permiso y que ninguna otra aplicación está usando la cámara.';
        setRealCameraMessage('No se pudo abrir la cámara', reason);
    }
}

function stopRealDeviceCamera(clearVideo = true) {
    if (realDeviceCameraStream) {
        realDeviceCameraStream.getTracks().forEach(track => track.stop());
        realDeviceCameraStream = null;
    }
    if (clearVideo) {
        const video = document.getElementById('device-camera-video');
        if (video) {
            video.pause?.();
            video.srcObject = null;
            video.classList.add('hidden');
        }
        document.getElementById('device-camera-overlay')?.classList.add('hidden');
    }
}

function openAvatarResult(prompt, data = realDeviceTryOnData) {
    realDeviceTryOnData = data || realDeviceTryOnData || {};
    const modal = $('avatar-result-modal');
    modal?.classList.add('active');
    modal?.scrollTo?.(0, 0);
    document.body.style.overflow = 'hidden';
    ensureRealDeviceCameraStage(realDeviceTryOnData);
    if ($('avatar-prompt')) {
        $('avatar-prompt').value = `IA integrada simulada\n\nEnlace analizado: ${realDeviceTryOnData.garmentUrl || 'demo'}\nTienda detectada: ${realDeviceTryOnData.store || 'tienda online'}\nAjuste solicitado: ${realDeviceTryOnData.waist || 'estándar'}\nMovimiento: ${realDeviceTryOnData.motion || 'estático'}\n\nLa cámara del dispositivo se abre en directo y la prenda interpretada desde el enlace se coloca encima como capa holográfica.`;
    }
    if ($('avatar-result-title')) $('avatar-result-title').innerText = 'Prueba con cámara real';

    // Intento automático; si el navegador exige una acción directa, queda el botón visible.
    startRealDeviceCamera(realDeviceTryOnData);
}

function showGeneratedAvatar(url, title) {
    // Compatibilidad con nombres antiguos: ya no se dibuja avatar, se mantiene la cámara real.
    if ($('avatar-result-title')) $('avatar-result-title').innerText = `${title || 'Look'} con cámara real`;
}

function closeAvatarResult() {
    stopRealDeviceCamera();
    $('avatar-result-modal')?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function regenerateAvatar(event) {
    event?.preventDefault?.();
    startRealDeviceCamera(realDeviceTryOnData);
}

function downloadAvatar() {
    const video = document.getElementById('device-camera-video');
    const garment = document.getElementById('device-garment-img');
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (video && video.readyState >= 2 && !video.classList.contains('hidden')) {
        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;
        const scale = Math.max(canvas.width / vw, canvas.height / vh);
        const sw = canvas.width / scale;
        const sh = canvas.height / scale;
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        ctx.fillStyle = 'rgba(0,242,255,.08)';
        ctx.fillRect(80, 140, 840, 960);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '900 42px Arial';
        ctx.fillText('CÁMARA NO ACTIVADA', 80, 110);
    }

    ctx.strokeStyle = 'rgba(0,242,255,.22)';
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    for (let x = 0; x < canvas.width; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }

    if (garment && garment.complete) {
        ctx.globalAlpha = .92;
        ctx.drawImage(garment, 350, 380, 300, 300);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(5,7,10,.78)';
    ctx.fillRect(70, 1160, 860, 82);
    ctx.fillStyle = '#67e8f9';
    ctx.font = '900 24px Arial';
    ctx.fillText(`${realDeviceTryOnData?.store || 'Tienda online'} · cámara real · IA simulada`, 95, 1210);

    lastAvatarDataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = lastAvatarDataUrl;
    a.download = 'virtual-tryon-camara-real.png';
    a.click();
}

async function finishScanFlowV2() {
    const data = pendingScanDataV2;
    const prompt = pendingScanPromptV2;
    const els = getScanElsV2();
    els.modal?.classList.remove('active');
    if (!data) return;
    try {
        realDeviceTryOnData = data;
        openAvatarResult(prompt, data);
        renderFitReportV2(data);
        showToast('Escaneo completado: activa la cámara');
    } finally {
        pendingScanDataV2 = null;
        pendingScanPromptV2 = '';
    }
}

window.addEventListener('click', (e) => {
    if (e.target === $('avatar-result-modal')) closeAvatarResult();
});


// Inicializa el armario al cargar la página
window.addEventListener('DOMContentLoaded', renderWardrobe);
