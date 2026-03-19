// Estado global
let dificuldade = 1;
let numeroHex = '';
let pesos = [];
let digitos = [];
let linhasCorretas = [];

// --- Navegação ---

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.add('escondido'));
  document.getElementById(id).classList.remove('escondido');
}

// --- Menu ---

function iniciarJogo() {
  const selecionado = document.querySelector('input[name="dificuldade"]:checked');
  dificuldade = selecionado ? parseInt(selecionado.value) : 1;

  numeroHex = gerarNumeroHex(dificuldade);
  const n = numeroHex.length;
  pesos = calcularPesos(n);
  digitos = extrairDigitos(numeroHex);

  document.getElementById('hex-valor').textContent = numeroHex;

  // Gerencia drawer e total ao começar nova rodada
  fecharDrawerAF();
  document.getElementById('drawer-af').classList.remove('escondido');
  document.getElementById('secao-total').classList.add('escondido');

  preencherTabelaAF();
  renderizarGrade();
  mostrarTela('tela-jogo');
}

// --- Geração do número ---

function gerarNumeroHex(nivel) {
  let n;
  if (nivel === 1) {
    n = 1;
  } else if (nivel === 2) {
    n = 2;
  } else {
    n = Math.random() < 0.5 ? 3 : 4;
  }

  let hex;
  let tentativas = 0;
  do {
    const max = Math.pow(16, n);
    const min = Math.pow(16, n - 1);
    const valor = Math.floor(Math.random() * (max - min)) + min;
    hex = valor.toString(16).toUpperCase().padStart(n, '0');
    tentativas++;
    // Em níveis 2 e 3, garante pelo menos um dígito A-F
    if (nivel === 1) break;
  } while (!hex.split('').some(c => c >= 'A' && c <= 'F') && tentativas < 20);

  return hex;
}

function calcularPesos(n) {
  return Array.from({ length: n }, (_, i) => Math.pow(16, i));
}

function extrairDigitos(hexStr) {
  return hexStr.split('').reverse();
}

// --- Tabela A–F ---

function preencherTabelaAF() {
  const tabela = document.getElementById('painel-af');
  tabela.innerHTML = '';
  const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
  letras.forEach((l, i) => {
    const cel = document.createElement('div');
    cel.className = 'celula-af';
    cel.innerHTML = `<div class="af-hex">${l}</div><div class="af-dec">${i + 10}</div>`;
    tabela.appendChild(cel);
  });
}

function toggleDrawerAF() {
  const drawer = document.getElementById('drawer-af');
  const btn = document.getElementById('btn-drawer-af');
  const aberto = drawer.classList.toggle('aberto');
  btn.textContent = aberto ? '◀' : '▶';
}

function fecharDrawerAF() {
  const drawer = document.getElementById('drawer-af');
  const btn = document.getElementById('btn-drawer-af');
  drawer.classList.remove('aberto');
  btn.textContent = '▶';
}

// --- Renderização da grade ---

function renderizarGrade() {
  const container = document.getElementById('grade-container');
  container.innerHTML = '';
  const n = digitos.length;
  linhasCorretas = Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    const linha = document.createElement('div');
    linha.className = 'linha-grid';
    linha.dataset.index = i;

    const campoDig = document.createElement('input');
    campoDig.type = 'text';
    campoDig.className = 'campo-digito';
    campoDig.maxLength = 1;
    campoDig.setAttribute('autocomplete', 'off');

    const simboloMult = document.createElement('span');
    simboloMult.className = 'simbolo-multiplicacao';
    simboloMult.textContent = '×';

    const spanPeso = document.createElement('span');
    spanPeso.className = 'peso';
    spanPeso.textContent = pesos[i].toLocaleString();

    const simboloIgual = document.createElement('span');
    simboloIgual.className = 'simbolo-igual';
    simboloIgual.textContent = '=';

    const campoRes = document.createElement('input');
    campoRes.type = 'text';
    campoRes.className = 'campo-resultado';
    campoRes.setAttribute('autocomplete', 'off');

    linha.appendChild(campoDig);
    linha.appendChild(simboloMult);
    linha.appendChild(spanPeso);
    linha.appendChild(simboloIgual);
    linha.appendChild(campoRes);
    container.appendChild(linha);

    // Enter em campo-digito → foca campo-resultado da mesma linha
    campoDig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        campoRes.focus();
      }
    });

    // Enter em campo-resultado → valida linha, foca próxima
    campoRes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        validarLinha(i);
        // foca próxima linha (índice i+1)
        if (i + 1 < n) {
          const proximaLinha = container.querySelector(`.linha-grid[data-index="${i + 1}"]`);
          if (proximaLinha) {
            proximaLinha.querySelector('.campo-digito').focus();
          }
        }
      }
    });
  }

  // Foca o primeiro campo (linha com index 0, que visualmente é a de cima)
  const primeira = container.querySelector('.linha-grid[data-index="0"] .campo-digito');
  if (primeira) primeira.focus();
}

// --- Validação ---

function hexDigitoParaDecimal(char) {
  return parseInt(char, 16);
}

function avaliarExpressao(str) {
  const limpa = str.trim();
  if (!/^[0-9+\-*\/().\s]+$/.test(limpa)) return null;
  try {
    const resultado = Function('return ' + limpa)();
    if (typeof resultado !== 'number' || !isFinite(resultado)) return null;
    return resultado;
  } catch {
    return null;
  }
}

function validarLinha(i) {
  const container = document.getElementById('grade-container');
  const linha = container.querySelector(`.linha-grid[data-index="${i}"]`);
  const campoDig = linha.querySelector('.campo-digito');
  const campoRes = linha.querySelector('.campo-resultado');

  const digitoInput = campoDig.value.trim().toUpperCase();
  const resultadoInput = campoRes.value.trim();

  if (!digitoInput || !resultadoInput) return;

  const valorAvaliado = avaliarExpressao(resultadoInput);
  if (valorAvaliado === null) return;

  const digitoCorreto = digitoInput === digitos[i];
  const resultadoEsperado = hexDigitoParaDecimal(digitos[i]) * pesos[i];
  const resultadoCorreto = Math.round(valorAvaliado) === resultadoEsperado;

  linha.classList.remove('correta', 'errada');

  if (digitoCorreto && resultadoCorreto) {
    linha.classList.add('correta');
    linhasCorretas[i] = true;
    campoRes.value = String(Math.round(valorAvaliado));
  } else {
    linha.classList.add('errada');
    linhasCorretas[i] = false;
  }

  verificarConclusao();
}

// --- Conclusão ---

function verificarConclusao() {
  if (linhasCorretas.every(Boolean)) {
    const total = digitos.reduce((soma, d, i) => soma + hexDigitoParaDecimal(d) * pesos[i], 0);
    document.getElementById('total').textContent = total;
    document.getElementById('secao-total').classList.remove('escondido');
  }
}

// --- Próxima rodada ---

function proximaRodada() {
  iniciarJogo();
}

function voltarMenu() {
  fecharDrawerAF();
  document.getElementById('drawer-af').classList.add('escondido');
  mostrarTela('tela-menu');
}

// --- Tutorial ---

function abrirTutorial() {
  document.getElementById('modal-tutorial').classList.remove('escondido');
}

function fecharTutorial() {
  document.getElementById('modal-tutorial').classList.add('escondido');
}
