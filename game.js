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
const extraHeroes = [
  ['Starbloom', 'Astral Dryad', '✦', 'Legendary', 'storm', 'Starbloom grew beneath a fallen constellation, turning quiet wishes into luminous branches.', 86, 62, 95, 'Starlit Era'],
  ['Frostmane', 'Glacier Wolf', '🐺', 'Rare', 'water', 'Frostmane crossed the silent ice fields, guiding wandering spirits by the glow of its breath.', 82, 88, 71, 'Winter Veil'],
  ['Glimmerfin', 'Prism Koi', '🐟', 'Common', 'fire', 'Glimmerfin leapt through the mirror lakes, scattering seven colors whenever the moon was full.', 48, 79, 91, 'Glasswater Era']
];
extraHeroes.forEach(([name, type, icon, rarity, theme, story, power, speed, creativity, era]) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `<div class="face"><header class="banner"><div><strong>${name}</strong><small style="display:block;color:#c69e5b;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;margin-top:.25rem">${type}</small></div><span class="rarity">${rarity}</span></header><div class="art ${theme}" role="img" aria-label="${type} colorful placeholder"><span class="creature">${icon}</span></div><p class="label">Historical record</p><p class="explain">${story}</p><div class="stats"><div class="stat"><span>Power</span><span class="meter"><i style="width:${power}%"></i></span><b>${power}</b></div><div class="stat"><span>Speed</span><span class="meter"><i style="width:${speed}%"></i></span><b>${speed}</b></div><div class="stat"><span>Creativity</span><span class="meter"><i style="width:${creativity}%"></i></span><b>${creativity}</b></div></div><p class="legend">Fictional chronicle · ${era}</p></div>`;
  board.appendChild(card);
});
const originals = [...board.children];
const pairTemplates = originals.slice(0, 6);
const cards = pairTemplates.flatMap(card => [card, card.cloneNode(true)]);
const state = { revealed: [], locked: false, scores: [0, 0], turn: 0, matched: 0, round: 1 };
const pairsPerRound = [3, 4, 6];
const activeCards = () => cards.slice(0, pairsPerRound[state.round - 1] * 2);
function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

const style = document.createElement('style');
style.textContent = `.card{perspective:1000px;cursor:pointer;background:transparent;border:0;box-shadow:none;padding:0}.flip-inner{position:relative;min-height:100%;transform-style:preserve-3d;transition:transform .55s}.card.flipped .flip-inner{transform:rotateY(180deg)}.flip-front,.flip-back{backface-visibility:hidden}.flip-back{position:absolute;inset:0;display:grid;place-items:center;min-height:28rem;overflow:hidden;border:1px solid #d5ae63;border-radius:1.5rem;background:radial-gradient(circle at 50% 42%,#593d2a 0 1px,transparent 2px),radial-gradient(circle at 50% 50%,#38271f 0 27%,transparent 27.5%),repeating-radial-gradient(circle at center,#765739 0 1px,transparent 1px 13px),linear-gradient(135deg,#120f13,#30221e 48%,#16131a);background-size:auto,auto,auto,100% 100%;color:#f5d58b;font:900 1.2rem Cinzel;letter-spacing:.2em;box-shadow:inset 0 0 0 .35rem #21191a,inset 0 0 0 .5rem #765739,inset 0 0 2rem #000}.flip-back:before,.flip-back:after{content:'✦';position:absolute;color:#d5ae63;font-size:1.4rem;text-shadow:0 0 1rem #e0bb66}.flip-back:before{top:1.2rem;left:1.4rem}.flip-back:after{right:1.4rem;bottom:1.2rem}.flip-back span{position:relative;display:grid;place-items:center;width:10rem;height:10rem;border:1px solid #bd9350;border-radius:50%;padding:2rem;text-align:center;background:radial-gradient(circle,#3a2822 0 28%,#17141a 29% 55%,transparent 56%);box-shadow:0 0 0 .3rem #21191a,0 0 0 .4rem #9a6d3f,0 0 1.5rem #000b}.flip-back span:before,.flip-back span:after{position:absolute;color:#c69e5b;font-size:.65rem;letter-spacing:.05em}.flip-back span:before{content:'✧  ✦  ✧';top:-1.65rem}.flip-back span:after{content:'✧  ✦  ✧';bottom:-1.65rem}.flip-back b{display:block;margin:.45rem 0 .25rem;color:#f5d58b;font-size:2.8rem;line-height:1;letter-spacing:0}.flip-back small{font:700 .42rem 'DM Sans';letter-spacing:.25em;color:#c69e5b}.flip-front{height:100%}.flip-back{transform:rotateY(180deg)}`;
document.head.appendChild(style);

shuffleCards();
board.replaceChildren(...activeCards());

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
  turnIndicator.textContent = `Round ${state.round} of 3 · ${playerNames[state.turn]}'s turn`;
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
    if (state.matched === pairsPerRound[state.round - 1]) {
      if (state.round < 3) {
        state.round += 1;
        state.matched = 0;
        state.revealed = [];
        cards.forEach(card => { card.classList.add('flipped'); delete card.dataset.matched; });
        board.replaceChildren(...activeCards());
        updateUI();
        return;
      }
      const message = state.scores[0] === state.scores[1] ? '✦ DRAW — MYTHIC ARCHIVE COMPLETE ✦' : `✦ PLAYER ${state.scores[0] > state.scores[1] ? 1 : 2} WINS — MYTHIC ARCHIVE COMPLETE ✦`;
      const winner = state.scores[0] === state.scores[1] ? message : `✦ ${playerNames[state.scores[0] > state.scores[1] ? 0 : 1]} WINS — MYTHIC ARCHIVE COMPLETE ✦`;
      win.innerHTML = `<div>${winner}</div><button class="restart" type="button">Restart Game</button>`;
      win.querySelector('.restart').style = 'margin-top:.8rem;padding:.65rem 1rem;border:1px solid #251b11;border-radius:999px;color:#f8efd8;background:#251b11;font:700 .8rem DM Sans;cursor:pointer';
      win.querySelector('.restart').addEventListener('click', () => start.click());
      win.style.display = 'block';
    }
  } else {
    setTimeout(() => { state.revealed.forEach(card => card.classList.add('flipped')); finishTurn(); }, 1000);
  }
}

cards.forEach(card => {
  const front = document.createElement('div'); front.className = 'flip-front';
  while (card.firstChild) front.appendChild(card.firstChild);
  const inner = document.createElement('div'); inner.className = 'flip-inner';
  const back = document.createElement('div'); back.className = 'flip-back'; back.innerHTML = '<span><b>🐉</b>MYTHIC<small>ARCHIVE · SEALED</small></span>';
  inner.append(front, back); card.appendChild(inner); card.classList.add('flipped');
  card.addEventListener('click', () => flipCard(card));
});

const start = document.createElement('button');
start.type = 'button'; start.textContent = 'Start Game · Shuffle';
start.style = 'display:block;margin:0 auto 1.5rem;padding:.8rem 1.2rem;border:1px solid #d5ae63;border-radius:999px;color:#251b11;background:#e0bb66;font:700 .8rem DM Sans;cursor:pointer';
document.querySelector('.wrap').insertBefore(start, turnIndicator);
start.addEventListener('click', () => {
  state.revealed = []; state.locked = false; state.scores = [0, 0]; state.turn = 0; state.matched = 0; state.round = 1; win.style.display = 'none';
  cards.forEach(card => { card.classList.add('flipped'); delete card.dataset.matched; });
  shuffleCards();
  board.replaceChildren(...activeCards()); updateUI();
});
updateUI();

if (params.get('players') === '1') {
  const computerTurn = () => {
    if (state.turn !== 1 || state.locked || state.revealed.length || state.matched === pairsPerRound[state.round - 1]) return;
    const available = activeCards().filter(card => card.classList.contains('flipped') && !card.dataset.matched);
    if (available.length < 2) return;
    const picks = available.sort(() => Math.random() - 0.5).slice(0, 2);
    picks[0].click();
    setTimeout(() => picks[1].click(), difficulty === 'easy' ? 900 : difficulty === 'hard' ? 100 : 300);
  };
  setInterval(computerTurn, 300);
}
