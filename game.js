const board = document.querySelector('.gallery');
const params = new URLSearchParams(location.search);
const playerNames = [params.get('p1') || 'Player 1', params.get('p2') || 'Player 2'];
const difficulty = params.get('difficulty') || 'normal';
const exit = document.createElement('button');
exit.type = 'button';
exit.textContent = '← Exit';
exit.style = 'position:fixed;z-index:5;top:1.5rem;left:1.5rem;padding:.7rem 1rem;border:1px solid #d5ae63;border-radius:999px;color:#f8efd8;background:#211d1c;font:700 .8rem DM Sans;cursor:pointer';
exit.addEventListener('click', () => { window.location.href = 'index.html'; });
document.body.appendChild(exit);
const originals = [...board.children];
const cards = [...originals, ...originals.map(card => card.cloneNode(true))];
const state = { revealed: [], locked: false, scores: [0, 0], turn: 0, matched: 0 };

const style = document.createElement('style');
style.textContent = `.card{perspective:1000px;cursor:pointer;background:transparent;border:0;box-shadow:none;padding:0}.flip-inner{position:relative;min-height:100%;transform-style:preserve-3d;transition:transform .55s}.card.flipped .flip-inner{transform:rotateY(180deg)}.flip-front,.flip-back{backface-visibility:hidden}.flip-back{position:absolute;inset:0;display:grid;place-items:center;min-height:28rem;border:1px solid #bd9350;border-radius:1.5rem;background:repeating-linear-gradient(45deg,#211d1c 0 10px,#2b2621 10px 20px);color:#d5ae63;font:900 2rem Cinzel;letter-spacing:.15em}.flip-back span{border:1px solid #765739;border-radius:1rem;padding:2rem}.flip-front{height:100%}.flip-back{transform:rotateY(180deg)}`;
document.head.appendChild(style);

for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
board.replaceChildren(...cards);

const scoreBoard = document.createElement('div');
scoreBoard.style = 'display:flex;justify-content:center;gap:1rem;margin:0 auto 1rem;max-width:32rem';
scoreBoard.innerHTML = `<div class="score-box">${playerNames[0]}<br><strong id="score-one">0</strong></div><div class="score-box">${playerNames[1]}<br><strong id="score-two">0</strong></div>`;
document.querySelector('.wrap').insertBefore(scoreBoard, board);
const scoreStyle = document.createElement('style');
scoreStyle.textContent = '.score-box{flex:1;padding:.65rem;border:1px solid #765739;border-radius:1rem;background:#211d1c;color:#f5d58b;text-align:center;font:700 .75rem DM Sans}.score-box strong{font:900 1.4rem Cinzel}.wrap{padding:2rem 0}.gallery{gap:.7rem}.face{padding:.8rem}.art{height:8rem;min-height:0;margin:.7rem 0}.creature{font-size:5rem}.explain{font-size:.72rem}.label{font-size:.55rem}.flip-back{min-height:18rem;font-size:1.2rem}@media(max-width:800px){.wrap{padding:1.5rem 0}.gallery{grid-template-columns:repeat(2,1fr)}.art{height:7rem}.creature{font-size:4rem}}@media(max-width:500px){.gallery{grid-template-columns:1fr}}';
document.head.appendChild(scoreStyle);

const turnIndicator = document.createElement('p');
turnIndicator.style = 'margin:0 auto 1rem;color:#d5ae63;text-align:center;font:700 .8rem DM Sans;letter-spacing:.08em;text-transform:uppercase';
scoreBoard.before(turnIndicator);
const win = document.createElement('div');
win.style = 'display:none;position:fixed;z-index:10;top:50%;left:50%;transform:translate(-50%,-50%);width:min(90% - 2rem,32rem);margin:0;padding:2.5rem 2rem;border:1px solid #e0bb66;border-radius:1rem;color:#251b11;background:#e0bb66;text-align:center;font:900 clamp(1.2rem,4vw,2rem) Cinzel';
document.querySelector('.wrap').insertBefore(win, board);

function updateUI() {
  document.querySelector('#score-one').textContent = state.scores[0];
  document.querySelector('#score-two').textContent = state.scores[1];
  turnIndicator.textContent = `${playerNames[state.turn]}'s turn`;
}

function finishTurn() {
  state.turn = state.turn ? 0 : 1;
  state.revealed = [];
  state.locked = false;
  updateUI();
}

function flipCard(card) {
  if (state.locked || !card.classList.contains('flipped') || card.dataset.matched) return;
  card.classList.remove('flipped');
  state.revealed.push(card);
  if (state.revealed.length !== 2) return;
  state.locked = true;
  const [first, second] = state.revealed;
  if (first.querySelector('.banner strong').textContent.trim() === second.querySelector('.banner strong').textContent.trim()) {
    state.revealed.forEach(card => card.dataset.matched = 'true');
    state.scores[state.turn] += 2;
    state.matched += 1;
    finishTurn();
    if (state.matched === originals.length) {
      const message = state.scores[0] === state.scores[1] ? '✦ DRAW — MYTHIC ARCHIVE COMPLETE ✦' : `✦ PLAYER ${state.scores[0] > state.scores[1] ? 1 : 2} WINS — MYTHIC ARCHIVE COMPLETE ✦`;
      const winner = state.scores[0] === state.scores[1] ? message : `✦ ${playerNames[state.scores[0] > state.scores[1] ? 0 : 1]} WINS — MYTHIC ARCHIVE COMPLETE ✦`;
      win.innerHTML = `<div>${winner}</div><button class="restart" type="button">Restart Game</button>`;
      win.querySelector('.restart').style = 'margin-top:.8rem;padding:.65rem 1rem;border:1px solid #251b11;border-radius:999px;color:#f8efd8;background:#251b11;font:700 .8rem DM Sans;cursor:pointer';
      win.querySelector('.restart').addEventListener('click', () => start.click());
      win.style.display = 'block';
    }
  } else {
    setTimeout(() => { state.revealed.forEach(card => card.classList.add('flipped')); finishTurn(); }, 1500);
  }
}

cards.forEach(card => {
  const front = document.createElement('div'); front.className = 'flip-front';
  while (card.firstChild) front.appendChild(card.firstChild);
  const inner = document.createElement('div'); inner.className = 'flip-inner';
  const back = document.createElement('div'); back.className = 'flip-back'; back.innerHTML = '<span>MYTHIC<br>ARCHIVE</span>';
  inner.append(front, back); card.appendChild(inner); card.classList.add('flipped');
  card.addEventListener('click', () => flipCard(card));
});

const start = document.createElement('button');
start.type = 'button'; start.textContent = 'Start Game · Shuffle';
start.style = 'display:block;margin:0 auto 1.5rem;padding:.8rem 1.2rem;border:1px solid #d5ae63;border-radius:999px;color:#251b11;background:#e0bb66;font:700 .8rem DM Sans;cursor:pointer';
document.querySelector('.wrap').insertBefore(start, turnIndicator);
start.addEventListener('click', () => {
  state.revealed = []; state.locked = false; state.scores = [0, 0]; state.turn = 0; state.matched = 0; win.style.display = 'none';
  cards.forEach(card => { card.classList.add('flipped'); delete card.dataset.matched; });
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  board.replaceChildren(...cards); updateUI();
});
updateUI();

if (params.get('players') === '1') {
  const computerTurn = () => {
    if (state.turn !== 1 || state.locked || state.revealed.length || state.matched === originals.length) return;
    const available = cards.filter(card => card.classList.contains('flipped') && !card.dataset.matched);
    if (available.length < 2) return;
    const picks = available.sort(() => Math.random() - 0.5).slice(0, 2);
    picks[0].click();
    setTimeout(() => picks[1].click(), difficulty === 'easy' ? 900 : difficulty === 'hard' ? 100 : 300);
  };
  setInterval(computerTurn, 300);
}
