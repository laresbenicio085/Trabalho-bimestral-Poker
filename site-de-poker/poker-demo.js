   // Traduções para português do Brasil
  const i18n = {
    'pt-BR': {
      labelPlayerHand: 'Mão do Jogador:',
      labelCpuHand: 'Mão do CPU:',
      dealBtn: 'Distribuir 5 Cartas',
      swapBtn: 'Trocar Cartas Selecionadas',
      playerWins: 'Jogador venceu!',
      cpuWins: 'CPU venceu!',
      tie: 'Empate!'
    }
  };

  const lang = 'pt-BR';
  const t = i18n[lang];

  // Atualiza textos da interface
  document.getElementById('label-player-hand').textContent = t.labelPlayerHand;
  document.getElementById('label-cpu-hand').textContent = t.labelCpuHand;
  document.getElementById('deal-btn').textContent = t.dealBtn;
  document.getElementById('swap-btn').textContent = t.swapBtn;
// Naipe e valores das cartas
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const rankMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  // Cria e embaralha o baralho
  function createDeck() {
    const deck = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value, selected: false });
      }
    }
    return shuffle(deck);
  }

  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  /**
   * Renderiza uma mão de cartas em um container.
   * @param {Array} hand - Array de cartas.
   * @param {string} containerId - ID do container onde as cartas serão renderizadas.
   * @param {boolean} selectable - Se as cartas podem ser selecionadas (apenas jogador).
   * @param {boolean} esconderFace - Se deve esconder o valor e naipe (para CPU).
   */
  function renderHand(hand, containerId, selectable = false, esconderFace = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    hand.forEach((card) => {
      const cardDiv = document.createElement('div');
      cardDiv.textContent = card.value + card.suit;
      cardDiv.classList.add('card');
      if (card.suit === '♥' || card.suit === '♦') {
        cardDiv.classList.add('red');
      }
      if (card.suit === '♠' || card.suit === '♣') {
        cardDiv.classList.add('black');
      }
      if (selectable) {
        cardDiv.classList.add('selectable');
        cardDiv.addEventListener('click', () => {
          card.selected = !card.selected;
          cardDiv.classList.toggle('selected', card.selected);
        });
      }
      if (esconderFace) {
        cardDiv.classList.add('face-escondida');
      }
      container.appendChild(cardDiv);
    });
  }
  
  // Função para rankear a mão detalhadamente
  function rankHandDetailed(hand) {
    const counts = {};
    const suitsCount = {};
    const ranks = hand.map(c => rankMap[c.value]).sort((a, b) => b - a);

    hand.forEach(c => {
      counts[c.value] = (counts[c.value] || 0) + 1;
      suitsCount[c.suit] = (suitsCount[c.suit] || 0) + 1;
    });

    const isFlush = Object.values(suitsCount).some(count => count === 5);

    const isStraight = ranks.every((v, i, a) => i === 0 || v === a[i - 1] - 1) ||
                       JSON.stringify(ranks) === JSON.stringify([14, 5, 4, 3, 2]);

    const countPairs = Object.entries(counts)
      .map(([val, count]) => [rankMap[val], count])
      .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

    const countsArr = countPairs.map(x => x[1]);

    if (isStraight && isFlush) {
      return { rank: 8, rankValues: [ranks[0]], kickers: [] };
    }
    if (countsArr[0] === 4) {
      const fourKindValue = countPairs[0][0];
      const kickers = ranks.filter(r => r !== fourKindValue);
      return { rank: 7, rankValues: [fourKindValue], kickers };
    }
    if (countsArr[0] === 3 && countsArr[1] === 2) {
      return { rank: 6, rankValues: [countPairs[0][0], countPairs[1][0]], kickers: [] };
    }
    if (isFlush) {
      return { rank: 5, rankValues: ranks, kickers: [] };
    }
    if (isStraight) {
      return { rank: 4, rankValues: [ranks[0]], kickers: [] };
    }
    if (countsArr[0] === 3) {
      const threeKindValue = countPairs[0][0];
      const kickers = ranks.filter(r => r !== threeKindValue);
      return { rank: 3, rankValues: [threeKindValue], kickers };
    }
    if (countsArr[0] === 2 && countsArr[1] === 2) {
      const pairValues = [countPairs[0][0], countPairs[1][0]].sort((a, b) => b - a);
      const kickers = ranks.filter(r => r !== pairValues[0] && r !== pairValues[1]);
      return { rank: 2, rankValues: pairValues, kickers };
    }
    if (countsArr[0] === 2) {
      const pairValue = countPairs[0][0];
      const kickers = ranks.filter(r => r !== pairValue);
      return { rank: 1, rankValues: [pairValue], kickers };
    }
    return { rank: 0, rankValues: ranks, kickers: [] };
  }

  // Compara as mãos com desempate
  function compareHands(playerHand, cpuHand) {
    const p = rankHandDetailed(playerHand);
    const c = rankHandDetailed(cpuHand);

    if (p.rank > c.rank) return t.playerWins;
    if (c.rank > p.rank) return t.cpuWins;

    for (let i = 0; i < Math.max(p.rankValues.length, c.rankValues.length); i++) {
      const pVal = p.rankValues[i] || 0;
      const cVal = c.rankValues[i] || 0;
      if (pVal > cVal) return t.playerWins;
      if (cVal > pVal) return t.cpuWins;
    }

    for (let i = 0; i < Math.max(p.kickers.length, c.kickers.length); i++) {
      const pVal = p.kickers[i] || 0;
      const cVal = c.kickers[i] || 0;
      if (pVal > cVal) return t.playerWins;
      if (cVal > pVal) return t.cpuWins;
    }

    return t.tie;
  }

  // Estado do jogo
  let deck = [];
  let playerHand = [];
  let cpuHand = [];

  // Elementos DOM
  const dealBtn = document.getElementById('deal-btn');
  const swapBtn = document.getElementById('swap-btn');
  const resultDiv = document.getElementById('result');

  // Evento para distribuir cartas
  dealBtn.onclick = () => {
    deck = createDeck();
    playerHand = deck.splice(0, 5);
    cpuHand = deck.splice(0, 5);
    renderHand(playerHand, 'player-hand', true);
    renderHand(cpuHand, 'cpu-hand', false, true); // esconder valores do CPU
    resultDiv.textContent = '';
    swapBtn.disabled = false;
  };

  // Evento para trocar cartas selecionadas
  swapBtn.onclick = () => {
    for (let i = 0; i < playerHand.length; i++) {
      if (playerHand[i].selected) {
        playerHand[i] = deck.shift();
        playerHand[i].selected = false;
      }
    }
    renderHand(playerHand, 'player-hand', false);
    renderHand(cpuHand, 'cpu-hand', false, false); // revelar valores do CPU

    const outcome = compareHands(playerHand, cpuHand);
    resultDiv.textContent = outcome;

    swapBtn.disabled = true;
  };