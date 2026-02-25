let numeroAtual = 0;
let modoDecimal = false;

function alternarModo() {
    modoDecimal = !modoDecimal;
    const btn = document.getElementById('toggle-modo');
    btn.textContent = modoDecimal ? 'Decimal → Binário' : 'Binário → Decimal';
}

function iniciarJogo() {
    document.getElementById('tela-menu').classList.add('escondido');
    document.getElementById('tela-jogo').classList.remove('escondido');
    proximoNumero();
}

function proximoNumero() {
    // Sorteia entre 1 e 255 (1 a 8 bits)
    numeroAtual = Math.floor(Math.random() * 255) + 1;
    const binario = numeroAtual.toString(2);


    document.getElementById('feedback').textContent = '';
    document.getElementById('btn-proximo').classList.add('escondido');

    if (modoDecimal) {
        mostrarModoDecimal(binario);
    } else {
        mostrarModoBinario(binario);
    }
}

// Modo binário → decimal
function mostrarModoBinario(binario) {
    document.getElementById('pergunta-label').textContent = 'Qual o valor decimal?';

    const spans = binario.split('').map(bit => `<span>${bit}</span>`).join('');
    document.getElementById('numero-display').innerHTML = spans;
    document.getElementById('numero-display').classList.remove('escondido');

    document.getElementById('inputs-bits').classList.add('escondido');
    document.getElementById('inputs-bits').innerHTML = '';

    const resposta = document.getElementById('resposta');
    resposta.classList.remove('escondido');
    resposta.value = '';
    resposta.disabled = false;

    montarTabela(binario);
}

// Modo decimal → binário
function mostrarModoDecimal(binario) {
    document.getElementById('pergunta-label').textContent = `Qual o binário de ${numeroAtual}?`;
    document.getElementById('numero-display').classList.add('escondido');
    document.getElementById('resposta').classList.add('escondido');

    montarInputsBits(binario);
    montarTabela(binario);
}

function montarInputsBits(binario) {
    const container = document.getElementById('inputs-bits');
    container.innerHTML = '';
    container.classList.remove('escondido');

    // Sempre 8 inputs no modo decimal→binário
    const bits = 8;

    let html = '<div class="linha-tabela">';
    for (let i = 0; i < bits; i++) {
        html += `<input
        class="input-bit"
        type="text"
        inputmode="numeric"
        maxlength="1"
        id="bit-${i}"
        oninput="avancarBit(this, ${i}, ${bits})"
        >`;
    }
    html += '</div>';

    container.innerHTML = html;
    document.getElementById('bit-0').focus();
}

function avancarBit(input, index, total) {
  // Aceita só 0 ou 1
  input.value = input.value.replace(/[^01]/g, '');

  if (input.value.length === 1 && index < total - 1) {
    document.getElementById(`bit-${index + 1}`).focus();
  }

  // Verifica se todos estão preenchidos
  const todos = Array.from({ length: total }, (_, i) => document.getElementById(`bit-${i}`));
  const completo = todos.every(inp => inp.value.length === 1);
  if (completo) {
    verificarResposta();
  }
}

function montarTabela(binario) {
  const container = document.getElementById('tabela-suporte');
  container.innerHTML = '';

  const comSuporte = document.querySelector('input[name="suporte"]:checked').value === 'com';
  if (!comSuporte) return;

  // No modo decimal→binário sempre mostra 8 potências
  // No modo binário→decimal mostra só as do número
  const bits = modoDecimal ? 8 : binario.length;

  let html = '<div class="linha-tabela">';
  for (let i = 0; i < bits; i++) {
    const potencia = Math.pow(2, bits - 1 - i);
    html += `<div class="celula potencia">${potencia}</div>`;
  }
  html += '</div>';

  container.innerHTML = html;
}

function verificarResposta() {
    const feedback = document.getElementById('feedback');

    if (modoDecimal) {
        const bits = 8;
        const resposta = Array.from({ length: bits }, (_, i) => document.getElementById(`bit-${i}`).value).join('');
        const binario8bit = numeroAtual.toString(2).padStart(8, '0');

        if (resposta === binario8bit) {
            feedback.textContent = '✓ Correto!';
            feedback.className = 'acerto';
        } else {
            feedback.textContent = `✗ Errado. A resposta era ${binario8bit}`;
            feedback.className = 'erro';
        }

        // Desabilita os inputs
        Array.from({ length: bits }, (_, i) => document.getElementById(`bit-${i}`)).forEach(inp => inp.disabled = true);

    } else {
        const resposta = parseInt(document.getElementById('resposta').value);

        if (isNaN(resposta)) {
            feedback.textContent = 'Digite um número!';
            feedback.className = 'erro';
        return;
        }

        if (resposta === numeroAtual) {
            feedback.textContent = '✓ Correto!';
            feedback.className = 'acerto';
        } else {
            feedback.textContent = `✗ Errado. A resposta era ${numeroAtual}`;
            feedback.className = 'erro';
        }

        document.getElementById('resposta').disabled = true;
    }

    document.getElementById('btn-proximo').classList.remove('escondido');
}

function voltarMenu() {
    document.getElementById('tela-jogo').classList.add('escondido');
    document.getElementById('tela-menu').classList.remove('escondido');
}