/* ========== ДАННЫЕ ========== */
const BOTS = [
  { id:1, name:'PlayerFN', initial:'P', color:'#7c5cff', role:'admin', crUser:false, status:'Хостит лобби', balance:1500, email:'playerfn@passion.com', password:'PassionFN_2024' },
  { id:2, name:'CustomKing', initial:'C', color:'#b18bff', role:'user', crUser:true, status:'В лобби', balance:2350, email:'customking@passion.com', password:'king_2023' },
  { id:3, name:'NightOwl', initial:'N', color:'#8f6bff', role:'user', crUser:true, status:'В лобби', balance:890, email:'nightowl@passion.com', password:'owl_night_77' },
  { id:4, name:'MemeLord', initial:'M', color:'#c9a9ff', role:'user', crUser:false, status:'В меню', balance:450, email:'memelord@passion.com', password:'meme_1337' },
  { id:5, name:'ShadowFrag', initial:'S', color:'#a88bff', role:'user', crUser:false, status:'В лобби', balance:1200, email:'shadow@passion.com', password:'frag_shadow' },
  { id:6, name:'Vortex', initial:'V', color:'#9d7bff', role:'user', crUser:true, status:'В лобби', balance:3100, email:'vortex@passion.com', password:'vortex_2024' },
  { id:7, name:'HappyClient', initial:'H', color:'#bda2ff', role:'user', crUser:false, status:'В меню', balance:200, email:'happy@passion.com', password:'happy_client' },
  { id:8, name:'Guest_01', initial:'G', color:'#cfbaff', role:'user', crUser:false, status:'В лобби', balance:750, email:'guest@passion.com', password:'guest_0001' },
];

let currentUser = BOTS[0];
let editingUserId = null;
let currentMethod = 'card';
let passwordRevealed = false;

let withdrawRequests = [
  { id:1, userId:2, userName:'CustomKing', method:'card', card:'4276 1234 5678 4821', amount:1000, date:'14.11 21:30', status:'pending' },
  { id:2, userId:6, userName:'Vortex', method:'sbp', phone:'+7 999 123-45-67', amount:2000, date:'14.11 19:15', status:'pending' },
  { id:3, userId:3, userName:'NightOwl', method:'card', card:'5469 8765 4321 7530', amount:750, date:'13.11 22:00', status:'approved' },
];

let crCodeRequests = [
  { id:1, userId:3, userName:'NightOwl', photo:null, date:'14.11 23:20', status:'pending' },
  { id:2, userId:6, userName:'Vortex', photo:null, date:'13.11 15:30', status:'approved' },
];

let winRequests = [
  { id:1, userId:2, userName:'CustomKing', mode:'Solo', reward:150, photo:null, date:'14.11 22:15', status:'pending' },
  { id:2, userId:3, userName:'NightOwl', mode:'Duo', reward:100, photo:null, date:'13.11 21:00', status:'paid' },
];

let supportTickets = [
  { id:1, userId:3, userName:'NightOwl', type:'Вопрос', subject:'Не зачислились очки за матч', date:'14.11 23:15', status:'open',
    messages:[{ sender:'user', author:'NightOwl', text:'Играл 14.11 в 22:00, занял 1 место, но очки на баланс не пришли. Проверьте пожалуйста.', time:'14.11 23:15' }]
  },
];

/* ========== УТИЛИТЫ ========== */
function fmt(n){ return Number(n).toLocaleString('ru-RU'); }
function nowStr(){
  const d = new Date(), p = n => n.toString().padStart(2,'0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
const REWARDS = { 'Solo':150, 'Duo':100, 'Squad':100 };

/* ========== ЗВЁЗДЫ ========== */
(function(){
  const box = document.getElementById('stars');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 60; i++){
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top  = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 4) + 's';
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

/* ========== МЕНЮ ========== */
const sidebar = document.getElementById('sidebar');
document.getElementById('mobileToggle').addEventListener('click', () => sidebar.classList.toggle('open'));

const navBtns = document.querySelectorAll('.nav-btn');
const panels  = document.querySelectorAll('.panel');
function goto(tab){
  const btn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
  if (!btn) return;
  if (btn.classList.contains('admin-only') && currentUser.role !== 'admin'){
    return toast('Доступ только для администраторов', '🚫');
  }
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.innerWidth <= 900) sidebar.classList.remove('open');
  if (tab === 'admin') renderAdmin();
}
navBtns.forEach(b => b.addEventListener('click', () => goto(b.dataset.tab)));

document.querySelectorAll('.rules-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.rules-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.rule-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('rule-' + tab.dataset.rule).classList.add('active');
  });
});

const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg, icon = '✓'){
  toastEl.innerHTML = `<span class="t-ico">${icon}</span> ${msg}`;
  toastEl.className = 'toast show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.className = 'toast', 3000);
}

/* ========== РАСПИСАНИЕ ========== */
const SCHEDULE = [
  { time:'19:00', day:'МСК', mode:'Королевская битва · Solo', prize:'75 ₽', status:'st-wait', statusText:'Скоро' },
  { time:'20:30', day:'МСК', mode:'Королевская битва · Duo', prize:'150 ₽', status:'st-soon', statusText:'Регистрация' },
  { time:'22:00', day:'МСК', mode:'Перезарядка · Squad', prize:'200 ₽', status:'st-live', statusText:'В эфире' },
  { time:'23:30', day:'МСК', mode:'Королевская битва · Solo', prize:'75 ₽', status:'st-wait', statusText:'Скоро' },
];
function renderSchedule(){
  const box = document.getElementById('scheduleList');
  box.innerHTML = '';
  SCHEDULE.forEach(s => {
    const el = document.createElement('div');
    el.className = 'slot';
    el.innerHTML = `
      <div class="slot-time"><div class="t-h">${s.time}</div><div class="t-d">${s.day}</div></div>
      <div class="slot-info"><div class="s-mode">${s.mode}</div><div class="s-meta"><span>💰 ${s.prize}</span></div></div>
      <div class="slot-status ${s.status}">${s.statusText}</div>
    `;
    box.appendChild(el);
  });
}

/* ========== БОТЫ ========== */
function renderBots(){
  const grid = document.getElementById('botsGrid');
  grid.innerHTML = '';
  BOTS.forEach(bot => {
    const el = document.createElement('div');
    el.className = 'bot-card';
    const roleLabel = bot.role === 'admin' ? 'ADMIN' : (bot.crUser ? 'CR CODE' : 'USER');
    const roleClass = bot.role === 'admin' ? 'admin' : (bot.crUser ? 'cr' : '');
    el.innerHTML = `
      <div class="bot-avatar" style="background:${bot.color}">${bot.initial}</div>
      <div class="bot-info"><div class="bot-name">${bot.name}</div><div class="bot-status">${bot.status}</div></div>
      <span class="bot-role ${roleClass}">${roleLabel}</span>
    `;
    grid.appendChild(el);
  });
  document.getElementById('onlineCount').textContent = BOTS.length + ' онлайн';
}

/* ========== ПРОФИЛЬ ========== */
function updateProfile(){
  document.getElementById('topProfileName').textContent = currentUser.name;
  document.getElementById('topAvatarLetter').textContent = currentUser.initial;
  document.getElementById('adminStar').style.display = currentUser.role === 'admin' ? 'block' : 'none';
  document.getElementById('adminNavBtn').style.display = currentUser.role === 'admin' ? 'flex' : 'none';
  document.getElementById('chipBalance').textContent = fmt(currentUser.balance) + ' ₽';
}

/* ========== МОДАЛКА ПРОФИЛЯ ========== */
function openProfileModal(){
  passwordRevealed = false;
  document.getElementById('pmName').textContent = currentUser.name;
  document.getElementById('pmAvatarLetter').textContent = currentUser.initial;
  document.getElementById('pmRole').textContent = currentUser.role === 'admin' ? 'Администратор' : (currentUser.crUser ? 'CR CODE USER' : 'Участник');
  document.getElementById('pmAdminStar').style.display = currentUser.role === 'admin' ? 'block' : 'none';

  document.getElementById('pmAccNick').textContent = currentUser.name;
  document.getElementById('pmAccEmail').textContent = currentUser.email;
  document.getElementById('pmAccPass').textContent = '••••••••';
  document.getElementById('pmAccBalance').textContent = fmt(currentUser.balance) + ' ₽';
  document.getElementById('pmTogglePass').textContent = '👁 Показать';

  document.getElementById('pmWdBalance').textContent = fmt(currentUser.balance) + ' ₽';

  document.getElementById('pmCardNumber').value = '';
  document.getElementById('pmSbpPhone').value = '';
  document.getElementById('pmWithdrawAmount').value = '';
  selectMethod('card');

  renderMyWithdrawals();

  document.querySelectorAll('.pm-tab').forEach(t => t.classList.toggle('active', t.dataset.pm === 'account'));
  document.querySelectorAll('.pm-content').forEach(c => c.classList.remove('active'));
  document.getElementById('pm-account').classList.add('active');

  document.getElementById('profileModal').classList.add('show');
}
function closeProfileModal(){ document.getElementById('profileModal').classList.remove('show'); }
document.getElementById('profileModal').addEventListener('click', e => {
  if (e.target.id === 'profileModal') closeProfileModal();
});

document.querySelectorAll('.pm-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pm-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('pm-' + tab.dataset.pm).classList.add('active');
    if (tab.dataset.pm === 'withdraw') renderMyWithdrawals();
  });
});

document.getElementById('pmTogglePass').addEventListener('click', () => {
  passwordRevealed = !passwordRevealed;
  document.getElementById('pmAccPass').textContent = passwordRevealed ? currentUser.password : '••••••••';
  document.getElementById('pmTogglePass').textContent = passwordRevealed ? '🙈 Скрыть' : '👁 Показать';
});

function selectMethod(m){
  currentMethod = m;
  document.querySelectorAll('.method-btn').forEach(b => b.classList.toggle('active', b.dataset.method === m));
  document.getElementById('pmCardField').style.display = m === 'card' ? 'block' : 'none';
  document.getElementById('pmSbpField').style.display = m === 'sbp' ? 'block' : 'none';
}
document.querySelectorAll('.method-btn').forEach(btn => {
  btn.addEventListener('click', () => selectMethod(btn.dataset.method));
});

document.getElementById('pmWithdrawBtn').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('pmWithdrawAmount').value);
  if (!amount || amount < 750) return toast('Минимальная сумма вывода — 750 ₽', '⚠️');
  if (amount > currentUser.balance) return toast('Недостаточно средств на балансе', '⚠️');
  if (withdrawRequests.some(r => r.userId === currentUser.id && r.status === 'pending'))
    return toast('У вас уже есть заявка на рассмотрении', '⚠️');

  let reqData = { id: Date.now(), userId: currentUser.id, userName: currentUser.name, method: currentMethod, amount, date: nowStr(), status: 'pending' };

  if (currentMethod === 'card'){
    const card = document.getElementById('pmCardNumber').value.replace(/\s/g, '');
    if (card.length < 16) return toast('Введите корректный номер карты (16 цифр)', '⚠️');
    reqData.card = card.replace(/(.{4})/g, '$1 ').trim();
  } else {
    const phone = document.getElementById('pmSbpPhone').value.trim();
    if (phone.length < 10) return toast('Введите корректный номер телефона', '⚠️');
    reqData.phone = phone;
  }

  withdrawRequests.unshift(reqData);
  toast('Заявка на вывод отправлена! Ожидайте одобрения админа', '📤');
  document.getElementById('pmCardNumber').value = '';
  document.getElementById('pmSbpPhone').value = '';
  document.getElementById('pmWithdrawAmount').value = '';
  renderMyWithdrawals();
  updateAdminBadges();
});

function renderMyWithdrawals(){
  const list = document.getElementById('myWithdrawalsList');
  const my = withdrawRequests.filter(r => r.userId === currentUser.id).sort((a,b) => b.id - a.id);
  if (my.length === 0){
    list.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:16px 0;">Заявок пока нет</div>';
    return;
  }
  list.innerHTML = '';
  my.forEach(r => {
    const methodLabel = r.method === 'card' ? 'Карта' : 'СБП';
    const methodClass = r.method;
    const statusLabel = r.status === 'pending' ? 'На рассмотрении' : (r.status === 'approved' ? 'Одобрено' : 'Отклонено');
    const el = document.createElement('div');
    el.className = 'mw-row';
    el.innerHTML = `
      <span class="mw-method ${methodClass}">${methodLabel}</span>
      <span class="mw-info">${r.date}</span>
      <span class="mw-amount">${fmt(r.amount)} ₽</span>
      <span class="mw-status ${r.status}">${statusLabel}</span>
    `;
    list.appendChild(el);
  });
}

/* ========== CR CODE ========== */
const codeDrop = document.getElementById('codeDrop');
const codeFile = document.getElementById('codeFile');
const codePreview = document.getElementById('codePreview');
const codeIcon = document.getElementById('codeIcon');
const codeTitle = document.getElementById('codeTitle');
const codeSub = document.getElementById('codeSub');
let uploadedPhoto = null;

codeDrop.addEventListener('click', () => codeFile.click());
codeFile.addEventListener('change', () => { if (codeFile.files[0]) handleCodeFile(codeFile.files[0]); });
['dragenter','dragover'].forEach(ev => codeDrop.addEventListener(ev, e => { e.preventDefault(); codeDrop.classList.add('drag'); }));
['dragleave','drop'].forEach(ev => codeDrop.addEventListener(ev, e => { e.preventDefault(); codeDrop.classList.remove('drag'); }));
codeDrop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleCodeFile(e.dataTransfer.files[0]); });

function handleCodeFile(file){
  if (!file.type.startsWith('image/')) return toast('Только изображения', '⚠️');
  const reader = new FileReader();
  reader.onload = (e) => {
    codePreview.src = e.target.result;
    codePreview.style.display = 'block';
    codeIcon.style.display = 'none';
    codeTitle.textContent = 'Фото прикреплено';
    codeSub.textContent = file.name;
    uploadedPhoto = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('codeSubmit').addEventListener('click', () => {
  if (codePreview.style.display !== 'block') return toast('Прикрепите скриншот', '⚠️');
  if (crCodeRequests.some(r => r.userId === currentUser.id && r.status === 'pending'))
    return toast('У вас уже есть активная заявка на рассмотрении', '⚠️');
  crCodeRequests.unshift({ id: Date.now(), userId: currentUser.id, userName: currentUser.name, photo: uploadedPhoto, date: nowStr(), status: 'pending' });
  toast('Заявка на CR CODE отправлена! Админ проверит её', '🎨');
  codePreview.src = '';
  codePreview.style.display = 'none';
  codeIcon.style.display = 'block';
  codeTitle.textContent = 'Перетащи скрин сюда или нажми';
  codeSub.textContent = 'PNG, JPG · до 10 МБ';
  uploadedPhoto = null;
  updateAdminBadges();
});

function renderCRUsers(){
  const list = document.getElementById('crUsersList');
  list.innerHTML = '';
  const crBots = BOTS.filter(b => b.crUser);
  if (crBots.length === 0){
    list.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px;">Пока никто не получил роль CR CODE USER</div>';
    return;
  }
  crBots.forEach(bot => {
    const el = document.createElement('div');
    el.className = 'cr-user-card';
    el.innerHTML = `
      <div class="bot-avatar" style="background:${bot.color}">${bot.initial}</div>
      <div class="cr-user-name">${bot.name}</div>
      <span class="cr-user-badge">CR CODE</span>
    `;
    list.appendChild(el);
  });
}

/* ========== ПОБЕДЫ ========== */
const winDrop = document.getElementById('winDrop');
const winFile = document.getElementById('winFile');
const winPreview = document.getElementById('winPreview');
const winIcon = document.getElementById('winIcon');
const winTitle = document.getElementById('winTitle');
const winSub = document.getElementById('winSub');
let uploadedWinPhoto = null;

winDrop.addEventListener('click', () => winFile.click());
winFile.addEventListener('change', () => { if (winFile.files[0]) handleWinFile(winFile.files[0]); });
['dragenter','dragover'].forEach(ev => winDrop.addEventListener(ev, e => { e.preventDefault(); winDrop.classList.add('drag'); }));
['dragleave','drop'].forEach(ev => winDrop.addEventListener(ev, e => { e.preventDefault(); winDrop.classList.remove('drag'); }));
winDrop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleWinFile(e.dataTransfer.files[0]); });

function handleWinFile(file){
  if (!file.type.startsWith('image/')) return toast('Только изображения', '⚠️');
  const reader = new FileReader();
  reader.onload = (e) => {
    winPreview.src = e.target.result;
    winPreview.style.display = 'block';
    winIcon.style.display = 'none';
    winTitle.textContent = 'Фото прикреплено';
    winSub.textContent = file.name;
    uploadedWinPhoto = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('winSubmit').addEventListener('click', () => {
  const mode = document.getElementById('winMode').value;
  if (winPreview.style.display !== 'block') return toast('Прикрепите скриншот победы', '⚠️');
  const reward = REWARDS[mode] || 0;
  winRequests.unshift({
    id: Date.now(), userId: currentUser.id, userName: currentUser.name,
    mode, reward, photo: uploadedWinPhoto, date: nowStr(), status: 'pending'
  });
  renderWins();
  toast('Скрин победы отправлен! Ждём проверки админа', '🏆');
  winPreview.src = '';
  winPreview.style.display = 'none';
  winIcon.style.display = 'block';
  winTitle.textContent = 'Загрузи скрин победы';
  winSub.textContent = 'PNG, JPG · до 10 МБ';
  uploadedWinPhoto = null;
  updateAdminBadges();
});

function renderWins(){
  const grid = document.getElementById('winsGrid');
  const myWins = winRequests.filter(w => w.userId === currentUser.id);
  if (myWins.length === 0){
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">🏆</div>У вас пока нет отправленных побед</div>';
    return;
  }
  grid.innerHTML = '';
  myWins.forEach(w => {
    const el = document.createElement('div');
    el.className = 'win-card';
    const statusLabel = w.status === 'paid' ? '✓ Начислено' : (w.status === 'pending' ? '⏳ На проверке' : '✕ Отклонено');
    const statusClass = w.status;
    const imgHtml = w.photo ? `<img src="${w.photo}" alt="">` : '🏆';
    el.innerHTML = `
      <div class="win-img">
        <div class="win-badge">${w.mode}</div>
        <div class="win-status ${statusClass}">${statusLabel}</div>
        ${imgHtml}
      </div>
      <div class="win-body">
        <div class="win-author">${w.userName}</div>
        <div class="win-meta"><span>${w.mode}</span><span>${w.date}</span></div>
        <div class="win-reward ${w.status === 'pending' ? 'pending' : ''} ${w.status === 'rejected' ? 'rejected' : ''}">${w.status === 'paid' ? '+' : (w.status === 'rejected' ? '−' : '≈')}${w.reward} ₽</div>
      </div>
    `;
    grid.appendChild(el);
  });
}

/* ========== СТРИМЕРЫ ========== */
const STREAMERS = [
  { name:'PlayerFN', game:'Solo · Cash Cup', initial:'P' },
  { name:'CustomKing', game:'Duo · Cash Cup', initial:'C' },
  { name:'NightOwl', game:'Squad · Customs', initial:'N' },
];
function renderStreamers(){
  const grid = document.getElementById('streamersGrid');
  grid.innerHTML = '';
  STREAMERS.forEach(s => {
    const el = document.createElement('div');
    el.className = 'streamer';
    el.innerHTML = `
      <div class="streamer-prev"><div class="live-badge">LIVE</div><div class="sp-avatar">${s.initial}</div></div>
      <div class="streamer-body"><div class="streamer-name">${s.name} <span class="tw-badge">TWITCH</span></div><div class="streamer-game">${s.game}</div></div>
    `;
    el.addEventListener('click', () => window.open('https://www.twitch.tv/' + s.name.toLowerCase(), '_blank'));
    grid.appendChild(el);
  });
}
document.getElementById('linkTwitch').addEventListener('click', () => {
  toast('Переходим на Twitch для авторизации...', '🟣');
  window.open('https://www.twitch.tv/', '_blank');
});

/* ========== ПОДДЕРЖКА ========== */
let currentSupType = 'question';
document.querySelectorAll('.support-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.support-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentSupType = tab.dataset.sup;
    document.getElementById('reportField').style.display = currentSupType === 'report' ? 'block' : 'none';
  });
});
const SUP_LABELS = { question: 'Вопрос', report: 'Репорт', balance: 'Баланс', other: 'Другое' };

document.getElementById('supSubmit').addEventListener('click', () => {
  const subject = document.getElementById('supSubject').value.trim();
  const text = document.getElementById('supText').value.trim();
  const nick = document.getElementById('supReportNick').value.trim();
  if (!subject) return toast('Укажите тему обращения', '⚠️');
  if (text.length < 5) return toast('Опишите ситуацию подробнее', '⚠️');
  if (currentSupType === 'report' && !nick) return toast('Укажите ник нарушителя', '⚠️');
  const fullText = text + (nick ? `\n\nНарушитель: ${nick}` : '');
  supportTickets.unshift({
    id: Date.now(), userId: currentUser.id, userName: currentUser.name,
    type: SUP_LABELS[currentSupType], subject, date: nowStr(), status: 'open',
    messages: [{ sender:'user', author: currentUser.name, text: fullText, time: nowStr() }]
  });
  toast('Обращение создано!', '📨');
  document.getElementById('supSubject').value = '';
  document.getElementById('supText').value = '';
  document.getElementById('supReportNick').value = '';
  renderMyTickets();
  updateAdminBadges();
});

function renderMyTickets(){
  const list = document.getElementById('myTicketList');
  const my = supportTickets.filter(t => t.userId === currentUser.id).sort((a,b) => b.id - a.id);
  if (my.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="es-icon">💬</div>У вас пока нет обращений</div>';
    return;
  }
  list.innerHTML = '';
  my.forEach(t => {
    const el = document.createElement('div');
    el.className = 'chat-ticket';
    const statusClass = t.status === 'open' ? 'open' : (t.status === 'answered' ? 'answered' : 'closed');
    const statusLabel = t.status === 'open' ? 'Открыт' : (t.status === 'answered' ? 'Отвечен' : 'Закрыт');
    let messagesHtml = '';
    t.messages.forEach(m => {
      const mine = m.sender === 'user';
      messagesHtml += `
        <div class="chat-msg ${mine ? 'mine' : 'theirs'}">
          <div class="chat-msg-avatar" style="background:${mine ? currentUser.color : '#ffcf5c'}">${mine ? currentUser.initial : 'A'}</div>
          <div>
            <div class="chat-msg-author">${mine ? 'Вы' : 'Администратор'}</div>
            <div class="chat-msg-bubble">${escapeHtml(m.text).replace(/\n/g,'<br>')}</div>
            <div class="chat-msg-time">${m.time}</div>
          </div>
        </div>
      `;
    });
    let inputHtml = t.status !== 'closed' ? `
      <div class="chat-input-row">
        <textarea placeholder="Написать сообщение..." data-reply="${t.id}"></textarea>
        <button class="chat-send-btn" data-send="${t.id}">Отправить</button>
      </div>` : '<div style="text-align:center;font-size:12px;color:var(--muted);padding:8px;">Обращение закрыто</div>';
    el.innerHTML = `
      <div class="chat-ticket-header" data-toggle="${t.id}">
        <div style="flex:1;"><div class="chat-ticket-title">${escapeHtml(t.subject)}</div><div class="chat-ticket-meta">${t.type} · ${t.date}</div></div>
        <span class="chat-status ${statusClass}">${statusLabel}</span>
        <span style="color:var(--muted);font-size:14px;">▼</span>
      </div>
      <div class="chat-ticket-body"><div class="chat-messages">${messagesHtml}</div>${inputHtml}</div>
    `;
    list.appendChild(el);
  });
  list.querySelectorAll('[data-toggle]').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
  list.querySelectorAll('[data-send]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.send);
      const ta = list.querySelector(`[data-reply="${id}"]`);
      if (ta.value.trim().length < 1) return;
      sendMessage(id, ta.value.trim());
    });
  });
}

function sendMessage(ticketId, text){
  const t = supportTickets.find(x => x.id === ticketId);
  if (!t) return;
  t.messages.push({ sender:'user', author: currentUser.name, text, time: nowStr() });
  if (t.status === 'answered' || t.status === 'closed') t.status = 'open';
  renderMyTickets();
  updateAdminBadges();
}

/* ========== АДМИН ========== */
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('admin-' + tab.dataset.atab).classList.add('active');
  });
});

function updateAdminBadges(){
  if (currentUser.role !== 'admin') return;
  const pendingW = withdrawRequests.filter(r => r.status === 'pending').length;
  const pendingCR = crCodeRequests.filter(r => r.status === 'pending').length;
  const pendingWin = winRequests.filter(r => r.status === 'pending').length;
  const openT = supportTickets.filter(t => t.status === 'open').length;
  document.getElementById('badgeWithdraw').textContent = pendingW;
  document.getElementById('badgeCRReq').textContent = pendingCR;
  document.getElementById('badgeWins').textContent = pendingWin;
  document.getElementById('badgeTickets').textContent = openT;
  const total = pendingW + pendingCR + pendingWin + openT;
  document.getElementById('adminBadge').textContent = total;
  document.getElementById('adminBadge').style.display = total > 0 ? 'inline-block' : 'none';
}

function renderAdmin(){
  renderAdminWithdraw();
  renderAdminCRRequests();
  renderAdminWins();
  renderAdminUsers();
  renderAdminTickets();
  updateAdminBadges();
}

function renderAdminWithdraw(){
  const list = document.getElementById('withdrawRequestsList');
  if (withdrawRequests.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="es-icon">💸</div>Заявок на вывод пока нет</div>';
    return;
  }
  list.innerHTML = '';
  withdrawRequests.forEach(r => {
    const el = document.createElement('div');
    el.className = 'req-card ' + r.status;
    const statusLabel = r.status === 'pending' ? 'На рассмотрении' : (r.status === 'approved' ? 'Одобрено' : 'Отклонено');
    const methodLabel = r.method === 'card' ? 'Карта' : 'СБП';
    const requisites = r.method === 'card' ? r.card : r.phone;
    let actions = r.status === 'pending' ? `
      <button class="btn-sm approve" data-act="approve" data-id="${r.id}">✓ Одобрить</button>
      <button class="btn-sm reject" data-act="reject" data-id="${r.id}">✕ Отклонить</button>
    ` : '';
    el.innerHTML = `
      <div class="req-info">
        <div class="req-name">${r.userName}</div>
        <div class="req-detail">
          <span class="req-method ${r.method}">${methodLabel}</span>
          <b>${requisites}</b><br>${r.date}
        </div>
      </div>
      <div class="req-amount">${fmt(r.amount)} ₽</div>
      <span class="req-status ${r.status}">${statusLabel}</span>
      <div class="req-actions">${actions}</div>
    `;
    list.appendChild(el);
  });
  list.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => handleWithdrawAction(btn.dataset.act, Number(btn.dataset.id)));
  });
}

function handleWithdrawAction(action, id){
  const req = withdrawRequests.find(r => r.id === id);
  if (!req) return;
  const user = BOTS.find(b => b.id === req.userId);
  if (action === 'approve'){
    if (!user) return toast('Пользователь не найден', '⚠️');
    if (user.balance < req.amount) return toast('Недостаточно средств у пользователя', '⚠️');
    user.balance -= req.amount;
    req.status = 'approved';
    toast(`Вывод ${fmt(req.amount)} ₽ одобрен для ${user.name}`, '✅');
    if (user.id === currentUser.id) { updateProfile(); if (document.getElementById('profileModal').classList.contains('show')) openProfileModal(); }
  } else if (action === 'reject'){
    req.status = 'rejected';
    toast('Заявка на вывод отклонена', '❌');
  }
  renderAdminWithdraw();
  renderAdminUsers();
  updateAdminBadges();
  renderBots();
}

function renderAdminCRRequests(){
  const list = document.getElementById('crRequestsList');
  if (crCodeRequests.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="es-icon">🎨</div>Заявок на CR CODE пока нет</div>';
    return;
  }
  list.innerHTML = '';
  crCodeRequests.forEach(r => {
    const el = document.createElement('div');
    el.className = 'crreq-card ' + r.status;
    const statusBadge = r.status === 'pending' ? '⏳ НА ПРОВЕРКЕ' : (r.status === 'approved' ? '✓ ВЫДАНО' : '✕ ОТКЛОНЕНО');
    const statusClass = r.status === 'pending' ? '' : (r.status === 'approved' ? 'approved' : 'rejected');
    let photoHtml = r.photo ? `<img src="${r.photo}" alt="Код автора">` : `<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">📷 Фото не прикреплено</div>`;
    let actions = r.status === 'pending' ? `
      <button class="btn-sm approve" data-cract="approve" data-id="${r.id}">✓ Выдать роль</button>
      <button class="btn-sm reject" data-cract="reject" data-id="${r.id}">✕ Отклонить</button>
    ` : `<button class="btn-sm view" disabled style="flex:1">${r.status === 'approved' ? 'Роль выдана' : 'Отклонено'}</button>`;
    el.innerHTML = `
      <div class="crreq-img" data-photo-src="${r.photo || ''}">
        ${photoHtml}
        <span class="crreq-badge ${statusClass}">${statusBadge}</span>
      </div>
      <div class="crreq-body">
        <div class="crreq-name">${escapeHtml(r.userName)}</div>
        <div class="crreq-meta">${r.date}</div>
        <div class="crreq-actions">${actions}</div>
      </div>
    `;
    list.appendChild(el);
  });
  list.querySelectorAll('[data-cract]').forEach(btn => {
    btn.addEventListener('click', () => handleCRAction(btn.dataset.cract, Number(btn.dataset.id)));
  });
  list.querySelectorAll('.crreq-img').forEach(img => {
    img.addEventListener('click', () => {
      if (img.dataset.photoSrc) openPhotoModal(img.dataset.photoSrc);
    });
  });
}

function handleCRAction(action, id){
  const req = crCodeRequests.find(r => r.id === id);
  if (!req) return;
  const user = BOTS.find(b => b.id === req.userId);
  if (action === 'approve'){
    if (!user) return toast('Пользователь не найден', '⚠️');
    user.crUser = true;
    req.status = 'approved';
    toast(`CR CODE USER выдан ${user.name}`, '🎨');
    if (user.id === currentUser.id) updateProfile();
  } else if (action === 'reject'){
    req.status = 'rejected';
    toast('Заявка на CR CODE отклонена', '❌');
  }
  renderAdminCRRequests();
  renderAdminUsers();
  renderBots();
  renderCRUsers();
  updateAdminBadges();
}

function renderAdminWins(){
  const list = document.getElementById('adminWinsList');
  if (winRequests.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="es-icon">🥇</div>Заявок на победы пока нет</div>';
    return;
  }
  list.innerHTML = '';
  winRequests.forEach(w => {
    const el = document.createElement('div');
    el.className = 'req-card ' + (w.status === 'paid' ? 'approved' : (w.status === 'pending' ? 'pending' : 'rejected'));
    const statusLabel = w.status === 'paid' ? 'Начислено' : (w.status === 'pending' ? 'На проверке' : 'Отклонено');
    let photoPreview = w.photo 
      ? `<img src="${w.photo}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;cursor:pointer;" data-photo-src="${w.photo}" alt="">`
      : `<div style="width:60px;height:60px;border-radius:10px;background:var(--card-2);display:flex;align-items:center;justify-content:center;font-size:24px;">🏆</div>`;
    let actions = w.status === 'pending' ? `
      <button class="btn-sm approve" data-wact="approve" data-id="${w.id}">✓ Начислить ${w.reward} ₽</button>
      <button class="btn-sm reject" data-wact="reject" data-id="${w.id}">✕ Отклонить</button>
    ` : `<span class="req-status ${w.status === 'paid' ? 'approved' : 'rejected'}">${statusLabel}</span>`;
    el.innerHTML = `
      ${photoPreview}
      <div class="req-info">
        <div class="req-name">${w.userName}</div>
        <div class="req-detail">${w.mode} · ${w.date}</div>
      </div>
      <div class="req-amount">${w.reward} ₽</div>
      <div class="req-actions">${actions}</div>
    `;
    list.appendChild(el);
  });
  list.querySelectorAll('[data-wact]').forEach(btn => {
    btn.addEventListener('click', () => handleWinAction(btn.dataset.wact, Number(btn.dataset.id)));
  });
  list.querySelectorAll('[data-photo-src]').forEach(img => {
    img.addEventListener('click', () => openPhotoModal(img.dataset.photoSrc));
  });
}

function handleWinAction(action, id){
  const req = winRequests.find(w => w.id === id);
  if (!req) return;
  const user = BOTS.find(b => b.id === req.userId);
  if (action === 'approve'){
    if (!user) return toast('Пользователь не найден', '⚠️');
    user.balance += req.reward;
    req.status = 'paid';
    toast(`Начислено ${req.reward} ₽ игроку ${user.name}`, '💰');
    if (user.id === currentUser.id) updateProfile();
  } else if (action === 'reject'){
    req.status = 'rejected';
    toast('Победа отклонена', '❌');
  }
  renderAdminWins();
  renderAdminUsers();
  updateAdminBadges();
  renderBots();
  renderWins();
}

function renderAdminUsers(){
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';
  BOTS.forEach(bot => {
    const tr = document.createElement('tr');
    const roleLabel = bot.role === 'admin' ? 'ADMIN' : (bot.crUser ? 'CR CODE' : 'USER');
    const roleClass = bot.role === 'admin' ? 'admin' : (bot.crUser ? 'cr' : 'user');
    tr.innerHTML = `
      <td>
        <div class="ut-user" onclick="openUserModal(${bot.id})">
          <div class="ut-avatar" style="background:${bot.color}">${bot.initial}</div>
          <span>${bot.name}</span>
        </div>
      </td>
      <td><span class="ut-role ${roleClass}">${roleLabel}</span></td>
      <td class="ut-balance">${fmt(bot.balance)} ₽</td>
      <td>${bot.crUser ? '✓ Да' : '—'}</td>
      <td>
        <div class="ut-btns">
          <button class="btn-sm view" onclick="openUserModal(${bot.id})">👁</button>
          <button class="btn-sm balance" onclick="openUserModal(${bot.id})">💰 Баланс</button>
          ${bot.id !== currentUser.id ? `
            <button class="btn-sm ${bot.crUser ? 'reject' : 'approve'}" onclick="toggleCR(${bot.id})">
              ${bot.crUser ? 'Снять CR' : 'Выдать CR'}
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleCR(id){
  const bot = BOTS.find(b => b.id === id);
  if (!bot) return;
  bot.crUser = !bot.crUser;
  toast(bot.crUser ? `CR CODE выдан ${bot.name}` : `CR CODE снят у ${bot.name}`, bot.crUser ? '🎨' : '🔓');
  renderAdminUsers();
  renderBots();
  renderCRUsers();
  if (bot.id === currentUser.id) updateProfile();
}

function openUserModal(id){
  const bot = BOTS.find(b => b.id === id);
  if (!bot) return;
  editingUserId = id;
  const roleLabel = bot.role === 'admin' ? 'Администратор' : (bot.crUser ? 'CR CODE USER' : 'Участник');
  document.getElementById('modalProfileCard').innerHTML = `
    <div class="ut-avatar" style="background:${bot.color}">${bot.initial}</div>
    <div>
      <div class="modal-profile-name">${bot.name}</div>
      <div class="modal-profile-role">${roleLabel} · ${bot.status}</div>
    </div>
  `;
  document.getElementById('modalStats').innerHTML = `
    <div class="modal-stat"><div class="modal-stat-label">Баланс</div><div class="modal-stat-value" id="modalBalanceVal">${fmt(bot.balance)} ₽</div></div>
    <div class="modal-stat"><div class="modal-stat-label">CR Code</div><div class="modal-stat-value">${bot.crUser ? 'Да' : 'Нет'}</div></div>
  `;
  document.getElementById('balanceAmount').value = '';
  document.getElementById('userModal').classList.add('show');
}
function closeUserModal(){ document.getElementById('userModal').classList.remove('show'); editingUserId = null; }
document.getElementById('userModal').addEventListener('click', e => { if (e.target.id === 'userModal') closeUserModal(); });

function adminAdjustBalance(action){
  if (!editingUserId) return;
  const user = BOTS.find(b => b.id === editingUserId);
  if (!user) return;
  const amount = parseInt(document.getElementById('balanceAmount').value);
  if (!amount || amount < 1) return toast('Введите сумму больше 0', '⚠️');
  if (action === 'add'){
    user.balance += amount;
    toast(`Начислено ${fmt(amount)} ₽ → ${user.name}`, '💰');
  } else if (action === 'sub'){
    if (user.balance < amount) return toast('Недостаточно средств у пользователя', '⚠️');
    user.balance -= amount;
    toast(`Списано ${fmt(amount)} ₽ ← ${user.name}`, '📤');
  }
  document.getElementById('balanceAmount').value = '';
  document.getElementById('modalBalanceVal').textContent = fmt(user.balance) + ' ₽';
  renderAdminUsers();
  renderBots();
  if (user.id === currentUser.id) updateProfile();
}

function renderAdminTickets(){
  const list = document.getElementById('adminTicketsList');
  if (supportTickets.length === 0){
    list.innerHTML = '<div class="empty-state"><div class="es-icon">💬</div>Обращений нет</div>';
    return;
  }
  list.innerHTML = '';
  supportTickets.sort((a,b) => b.id - a.id).forEach(t => {
    const el = document.createElement('div');
    el.className = 'aticket' + (t.status === 'closed' ? ' closed' : '');
    const statusClass = t.status === 'open' ? 'open' : (t.status === 'answered' ? 'answered' : 'closed');
    const statusLabel = t.status === 'open' ? 'Открыт' : (t.status === 'answered' ? 'Отвечен' : 'Закрыт');
    let messagesHtml = '';
    t.messages.forEach(m => {
      const isAdmin = m.sender === 'admin';
      messagesHtml += `
        <div class="chat-msg ${isAdmin ? 'mine' : 'theirs'}">
          <div class="chat-msg-avatar" style="background:${isAdmin ? '#ffcf5c' : '#7c5cff'}">${isAdmin ? 'A' : m.author.charAt(0).toUpperCase()}</div>
          <div>
            <div class="chat-msg-author">${isAdmin ? 'Администратор' : m.author}</div>
            <div class="chat-msg-bubble">${escapeHtml(m.text).replace(/\n/g,'<br>')}</div>
            <div class="chat-msg-time">${m.time}</div>
          </div>
        </div>
      `;
    });
    let actionHtml = t.status !== 'closed' ? `
      <div class="chat-input-row" style="margin-top:12px;">
        <textarea placeholder="Ответ пользователю..." data-areply="${t.id}"></textarea>
        <button class="chat-send-btn" data-asend="${t.id}">Ответить</button>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn-sm close" data-aclose="${t.id}">✓ Закрыть обращение</button>
      </div>
    ` : '<div style="text-align:center;font-size:12px;color:var(--muted);padding:8px;">Обращение закрыто</div>';
    el.innerHTML = `
      <div class="aticket-header" data-atoggle="${t.id}">
        <div style="flex:1;"><div style="font-size:14px;font-weight:800;">${escapeHtml(t.subject)}</div><div style="font-size:12px;color:var(--muted);">${t.userName} · ${t.type} · ${t.date}</div></div>
        <span class="chat-status ${statusClass}">${statusLabel}</span>
        <span style="color:var(--muted);font-size:14px;">▼</span>
      </div>
      <div class="aticket-body" style="display:none;"><div class="chat-messages">${messagesHtml}</div>${actionHtml}</div>
    `;
    list.appendChild(el);
  });
  list.querySelectorAll('[data-atoggle]').forEach(h => h.addEventListener('click', () => {
    const body = h.nextElementSibling;
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }));
  list.querySelectorAll('[data-asend]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.asend);
      const ta = list.querySelector(`[data-areply="${id}"]`);
      if (ta.value.trim().length < 1) return;
      adminReply(id, ta.value.trim());
    });
  });
  list.querySelectorAll('[data-aclose]').forEach(btn => btn.addEventListener('click', () => closeTicket(Number(btn.dataset.aclose))));
}

function adminReply(ticketId, text){
  const t = supportTickets.find(x => x.id === ticketId);
  if (!t) return;
  t.messages.push({ sender:'admin', author: currentUser.name, text, time: nowStr() });
  t.status = 'answered';
  toast('Ответ отправлен', '📨');
  renderAdminTickets();
  renderMyTickets();
  updateAdminBadges();
}

function closeTicket(ticketId){
  const t = supportTickets.find(x => x.id === ticketId);
  if (!t) return;
  t.status = 'closed';
  toast('Обращение закрыто', '✅');
  renderAdminTickets();
  renderMyTickets();
  updateAdminBadges();
}

function openPhotoModal(src){
  document.getElementById('photoModalImg').src = src;
  document.getElementById('photoModal').classList.add('show');
}

/* ========== ИНИЦИАЛИЗАЦИЯ ========== */
renderSchedule();
renderBots();
renderWins();
renderStreamers();
renderCRUsers();
renderMyTickets();
updateProfile();
updateAdminBadges();