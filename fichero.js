
const $ = (id) => document.getElementById(id);
const AUTH_USERS_KEY = 'vt_users_v1';
const AUTH_SESSION_KEY = 'vt_session_v1';

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
updateAuthUI(); }
function logout(){ localStorage.removeItem(AUTH_SESSION_KEY); changeHeroClothing();
updateAuthUI(); showToast('Sesión cerrada'); }
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
        nav.innerHTML = `<button type="button" id="download-app-btn" class="hidden sm:inline-flex bg-white/10 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-white/20 transition uppercase tracking-widest">App</button><div class="user-pill"><span>Hola, ${escapeHtml(session.name)}</span><button type="button" onclick="logout()">Salir</button></div>`;
    } else {
        nav.innerHTML = `<button type="button" id="download-app-btn" class="hidden sm:inline-flex bg-white/10 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-white/20 transition uppercase tracking-widest">App</button><button type="button" id="login-nav-btn" onclick="openAuthModal('login')" class="bg-white text-black px-7 py-2.5 rounded-full font-bold text-xs hover:bg-cyan-400 transition uppercase tracking-widest">Iniciar sesión</button>`;
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
    if ($('auth-subtitle')) $('auth-subtitle').innerText = mode === 'login' ? 'Accede para poder probar ropa y generar tu avatar con IA.' : 'Regístrate para desbloquear el probador virtual.';
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

function scrollToSection(sectionId){ const s=$(sectionId); if(s) s.scrollIntoView({behavior:'smooth',block:'start'}); }
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

    currentOutfit.garmentUrl = garmentUrl;
    currentOutfit.store = store;
    currentOutfit.title = 'Prenda online';
    currentOutfit.desc = `Prenda tomada como referencia desde ${store}`;

    return {
        outfit: 'prenda online',
        description: `Prenda de referencia obtenida desde el enlace de producto de ${store}`,
        garmentUrl,
        store,
        body: $('avatar-body')?.value || 'atlético',
        hair: $('avatar-hair')?.value || 'moreno corto',
        height: $('avatar-height')?.value || '1.82m',
        waist: waist < 35 ? 'entallado' : waist > 65 ? 'holgado' : 'estándar',
        motion: motionLabels[Number($('avatar-motion')?.value || 0)],
        color: selectedColor,
        style: 'fotografía realista editorial de moda'
    };
}
function buildAvatarPrompt(d){
    return `Foto realista de cuerpo completo de una persona con tipo corporal ${d.body}, altura ${d.height}, pelo ${d.hair}.
Debe llevar la prenda obtenida desde este enlace de referencia: ${d.garmentUrl} (${d.store}).
Usa la página del producto como referencia visual para identificar el tipo de prenda, corte, tejido, color, largo, caída y estilo.
No dependas de una categoría previa: interpreta la prenda directamente desde el enlace.
Ajuste ${d.waist}, pose ${d.motion}, variante de color ${d.color}.
Iluminación de estudio, detalle textil realista, piel natural, proporciones creíbles, fondo oscuro premium, sin texto y sin logos visibles.`;
}
async function generateAIAvatar(event){
    requireLogin(async()=>{
        const btn=event?.target; if(btn){ btn.disabled=true; btn.innerText='GENERANDO CON IA...'; btn.classList.add('animate-pulse'); }
        const data=collectAvatarSelections(); if (!data) { if(btn){ btn.disabled=false; btn.innerText='GENERAR AVATAR CON IA'; btn.classList.remove('animate-pulse'); } return; } const prompt=buildAvatarPrompt(data); lastAvatarPrompt=prompt; closeEditor(); openAvatarResult(prompt);
        try { const url = AI_AVATAR_ENDPOINT ? await requestRealAIAvatar(prompt,data) : await createDemoAvatar(data); showGeneratedAvatar(url, data.outfit); showToast('Avatar generado'); }
        catch(err){ console.error(err); showToast('Error de IA: usando demo'); showGeneratedAvatar(await createDemoAvatar(data), data.outfit); }
        finally { if(btn){ btn.disabled=false; btn.innerText='GENERAR AVATAR CON IA'; btn.classList.remove('animate-pulse'); } }
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
        ctx.fillStyle='#e2e8f0'; ctx.font='800 34px Plus Jakarta Sans, Arial'; ctx.fillText('FOTO IA DEMO',60,80); ctx.font='500 24px Arial'; wrapText(ctx, `${d.outfit} · ${d.body} · ${d.hair} · ${d.waist}`, 60, 1120, 780, 34);
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
