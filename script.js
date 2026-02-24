let numeroAtual = 0;
let comSuporte = false;

function iniciarJogo(suporte) {
    comSuporte = suporte;
    document.getElementById('tela-menu').classList.add('escondido');
    document.getElementById('tela-jogo').classList.remove('escondido');
    proximoNumero();
}

function proximoNumero() {
    // Sorteia entre 1 e 255 (1 a 8 bits)
    numeroAtual = Math.floor(Math.random() * 255) + 1;
    const binario = numeroAtual.toString(2);
    const spans = binario.split('').map(bit => `<span>${bit}</span>`).join('');

    document.getElementById('numero-binario').innerHTML = spans;
    document.getElementById('feedback').textContent = '';
    document.getElementById('resposta').value = '';
    document.getElementById('btn-proximo').classList.add('escondido');
    document.getElementById('resposta').disabled = false;

    montarTabela(binario);
}

function montarTabela(binario) {
    const container = document.getElementById('tabela-suporte');
    container.innerHTML = '';

    if (!comSuporte) return;

    // Calcula as potências de acordo com o tamanho do binário
    const bits = binario.length;
    let htmlPotencias = '<div class="linha-tabela">';

    for (let i = 0; i < bits; i++) {
        const potencia = Math.pow(2, bits - 1 - i);
        htmlPotencias += `<div class="celula potencia">${potencia}</div>`;
    }

    htmlPotencias += '</div>';
    container.innerHTML = htmlPotencias;
}

function verificarResposta() {
    const resposta = parseInt(document.getElementById('resposta').value);
    const feedback = document.getElementById('feedback');

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
    document.getElementById('btn-proximo').classList.remove('escondido');
}

function voltarMenu() {
    document.getElementById('tela-jogo').classList.add('escondido');
    document.getElementById('tela-menu').classList.remove('escondido');
}