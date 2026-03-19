// Estado global
let dificuldade = 1;
let comSuporte = false;
let numeroHex = '';
let pesos = [];
let digitos = [];
let linhasCorretas = [];
let stepAtual = 0;

// --- Navegação ---

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.add('escondido'));
  document.getElementById(id).classList.remove('escondido');
}

// --- Menu ---

function iniciarJogo() {
  const selecionado = document.querySelector('input[name="dificuldade"]:checked');
  dificuldade = selecionado ? parseInt(selecionado.value) : 1;
  comSuporte = document.querySelector('input[name="suporte-hex"]:checked')?.value === 'com';

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
    n = 2;
  } else if (nivel === 2) {
    n = 3;
  } else {
    n = Math.random() < 0.5 ? 4 : 5;
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
    if (comSuporte) {
      campoDig.value = digitos[i];
      campoDig.readOnly = true;
    }

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
    if (!comSuporte) {
      campoDig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          campoRes.focus();
        }
      });
    }

    // Enter em campo-resultado → valida linha, foca próxima
    campoRes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        validarLinha(i);
        // foca próxima linha (índice i+1)
        if (i + 1 < n) {
          const proximaLinha = container.querySelector(`.linha-grid[data-index="${i + 1}"]`);
          if (proximaLinha) {
            const campoFoco = comSuporte
              ? proximaLinha.querySelector('.campo-resultado')
              : proximaLinha.querySelector('.campo-digito');
            campoFoco.focus();
          }
        }
      }
    });
  }

  // Foca o primeiro campo (linha com index 0, que visualmente é a de cima)
  const seletor = comSuporte ? '.campo-resultado' : '.campo-digito';
  const primeira = container.querySelector(`.linha-grid[data-index="0"] ${seletor}`);
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

// --- Modo Guiado ---

const STEPS = [
  {
    pergunta: 'Em 1A, qual dígito fica mais à direita?',
    destacarDigito: 'direita',
    resposta: 'A',
    feedbackErro: 'O dígito mais à direita é o A',
    feedbackAcerto: 'Isso! Sempre começamos pela direita',
  },
  {
    pergunta: 'A vale quanto?',
    mostrarTabelaAF: true,
    resposta: '10',
    feedbackErro: 'Use a tabela acima',
    feedbackAcerto: 'Correto! A = 10',
  },
  {
    pergunta: 'Qual é o peso do dígito da direita?',
    destacarDigito: 'direita',
    resposta: '1',
    feedbackErro: 'O primeiro dígito (da direita) sempre vale 1',
    feedbackAcerto: 'Isso! O da direita sempre ×1',
  },
  {
    pergunta: '10 × 1 = ?',
    subtexto: 'A = 10\nPeso = 1',
    destacarDigito: 'direita',
    resposta: '10',
    feedbackErro: '10 × 1 = 10',
    feedbackAcerto: 'Boa!',
  },
  {
    pergunta: 'Agora o próximo dígito (à esquerda): 1 × 16 = ?',
    subtexto: 'Segunda posição peso = ×16',
    destacarDigito: 'esquerda',
    resposta: '16',
    feedbackErro: 'A segunda posição sempre multiplica por 16',
    feedbackAcerto: 'Perfeito!',
  },
  {
    pergunta: '10 + 16 = ?',
    subtexto: '10 (direita)\n+ 16 (esquerda)',
    resposta: '26',
    feedbackErro: '10 + 16 = 26',
    feedbackAcerto: 'Você converteu 1A₁₆ = 26!',
  },
];

function iniciarModoGuiado() {
  stepAtual = 0;
  mostrarTela('tela-tutorial');
  renderizarStep();
}

function abrirModoGuiado() {
  fecharDrawerAF();
  document.getElementById('drawer-af').classList.add('escondido');
  iniciarModoGuiado();
}

function renderizarStep() {
  const step = STEPS[stepAtual];

  document.getElementById('tutorial-progresso').textContent =
    `Passo ${stepAtual + 1} de ${STEPS.length}`;
  document.getElementById('tutorial-pergunta').textContent = step.pergunta;

  // subtexto
  const subtexto = document.getElementById('tutorial-subtexto');
  if (step.subtexto) {
    subtexto.textContent = step.subtexto;
    subtexto.classList.remove('escondido');
  } else {
    subtexto.textContent = '';
    subtexto.classList.add('escondido');
  }

  // tabela A–F
  const tabelaAF = document.getElementById('tutorial-tabela-af');
  if (step.mostrarTabelaAF) {
    tabelaAF.classList.remove('escondido');
  } else {
    tabelaAF.classList.add('escondido');
  }

  // destaque de dígito
  const digEsq = document.getElementById('tutorial-dig-esq');
  const digDir = document.getElementById('tutorial-dig-dir');
  digEsq.classList.remove('destaque-dig');
  digDir.classList.remove('destaque-dig');
  if (step.destacarDigito === 'esquerda') digEsq.classList.add('destaque-dig');
  if (step.destacarDigito === 'direita')  digDir.classList.add('destaque-dig');

  // input e feedback
  const input = document.getElementById('tutorial-input');
  input.value = '';
  input.className = '';
  input.focus();

  const feedback = document.getElementById('tutorial-feedback');
  feedback.textContent = '';
  feedback.className = '';

  const btn = document.getElementById('tutorial-btn-confirmar');
  btn.textContent = 'Confirmar';
  btn.onclick = confirmarStep;
  btn.disabled = false;
}

function confirmarStep() {
  const step = STEPS[stepAtual];
  const input = document.getElementById('tutorial-input');
  const feedback = document.getElementById('tutorial-feedback');
  const resposta = input.value.trim().toUpperCase();
  const correta = step.resposta.toUpperCase();

  input.classList.remove('correta', 'errada');
  feedback.classList.remove('acerto', 'erro');

  if (resposta === correta) {
    input.classList.add('correta');
    feedback.classList.add('acerto');
    feedback.textContent = step.feedbackAcerto;

    const btn = document.getElementById('tutorial-btn-confirmar');
    btn.textContent = 'Próximo';
    btn.disabled = false;
    btn.onclick = () => {
      stepAtual++;
      if (stepAtual < STEPS.length) {
        renderizarStep();
      } else {
        concluirTutorial();
      }
    };
  } else {
    input.classList.add('errada');
    feedback.classList.add('erro');
    feedback.textContent = step.feedbackErro;
  }
}

function concluirTutorial() {
  localStorage.setItem('hex_tutorial_visto', 'true');

  document.getElementById('tutorial-progresso').textContent = '';
  document.getElementById('tutorial-pergunta').textContent = 'Boa! Você converteu hexadecimal 🎉';
  document.getElementById('tutorial-subtexto').classList.add('escondido');
  document.getElementById('tutorial-tabela-af').classList.add('escondido');
  document.getElementById('tutorial-input-area').classList.add('escondido');

  const btn = document.getElementById('tutorial-btn-confirmar');
  btn.textContent = 'Começar a jogar';
  btn.disabled = false;
  btn.onclick = () => {
    document.getElementById('tutorial-input-area').classList.remove('escondido');
    mostrarTela('tela-menu');
  };
}

// --- Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tutorial-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmarStep();
  });

  if (!localStorage.getItem('hex_tutorial_visto')) {
    iniciarModoGuiado();
  }
});
