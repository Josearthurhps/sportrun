// Variável para armazenar os participantes
let participants = [];

// Carrega os dados do localStorage
function loadParticipants() {
  const stored = localStorage.getItem('participants');
  if (stored) {
    try {
      participants = JSON.parse(stored);
    } catch (e) {
      participants = [];
    }
  }
}

// Salva os dados no localStorage
function saveParticipants() {
  localStorage.setItem('participants', JSON.stringify(participants));
}

// Cronômetro
let stopwatchInterval, startTime = 0, elapsedTime = 0, running = false;
function updateDisplay() {
  const display = document.getElementById('display');
  let totalSeconds = Math.floor(elapsedTime / 1000);
  let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  let minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  let seconds = String(totalSeconds % 60).padStart(2, '0');
  display.textContent = `${hours}:${minutes}:${seconds}`;
}
function startStopwatch() {
  if (!running) {
    running = true;
    startTime = Date.now() - elapsedTime;
    stopwatchInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateDisplay();
    }, 1000);
  }
}
function stopStopwatch() {
  running = false;
  clearInterval(stopwatchInterval);
}
function resetStopwatch() {
  running = false;
  clearInterval(stopwatchInterval);
  elapsedTime = 0;
  updateDisplay();
}

// Adicionar participante
function addParticipant() {
  const name = document.getElementById('newName').value.trim();
  const number = document.getElementById('newNumber').value.trim();
  const kit = document.getElementById('newKit').value.trim();
  const tshirt = document.getElementById('newTshirt').value.trim();
  const gender = document.getElementById('newGender').value;
  if (name === '' || number === '') {
    alert('Nome e Número são obrigatórios.');
    return;
  }
  participants.push({ name, number, kit, tshirt, gender, time: null });
  saveParticipants();
  updateParticipantTable();
  document.getElementById('newName').value = '';
  document.getElementById('newNumber').value = '';
  document.getElementById('newKit').value = '';
  document.getElementById('newTshirt').value = '';
}

// Atualiza a tabela de participantes
function updateParticipantTable(filteredList) {
  const tbody = document.getElementById('participantTable').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  const list = filteredList || participants;
  list.forEach(p => {
    const row = tbody.insertRow();
    row.insertCell().textContent = p.name;
    row.insertCell().textContent = p.number;
    row.insertCell().textContent = p.kit;
    row.insertCell().textContent = p.tshirt;
    row.insertCell().textContent = p.gender;
    row.insertCell().textContent = p.time !== null ? formatTime(p.time) : '';
  });
}

// Formata o tempo (ms) para hh:mm:ss
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  let minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  let seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Pesquisa participantes pelo nome
function searchParticipant() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = participants.filter(p => p.name.toLowerCase().includes(query));
  updateParticipantTable(filtered);
}

// Registra o tempo do corredor utilizando o número informado
function registerTime() {
  const number = document.getElementById('runnerNumber').value.trim();
  if (number === '') {
    alert('Insira o número do corredor.');
    return;
  }
  const participant = participants.find(p => p.number === number);
  if (!participant) {
    alert('Participante não encontrado.');
    return;
  }
  if (participant.time !== null) {
    alert('Tempo já registrado para este corredor.');
    return;
  }
  participant.time = elapsedTime;
  saveParticipants();
  updateParticipantTable();
  document.getElementById('runnerNumber').value = '';
}

// Gera a planilha Excel separando feminino e masculino
function generateExcel() {
  let sorted = [...participants].sort((a, b) => {
    if (a.time === null) return 1;
    if (b.time === null) return -1;
    return a.time - b.time;
  });
  let female = sorted.filter(p => p.gender === 'Feminino');
  let male = sorted.filter(p => p.gender === 'Masculino');
  
  let femaleData = [['Posição', 'Nome', 'Número', 'Tempo']];
  female.forEach((p, index) => {
    femaleData.push([index + 1, p.name, p.number, p.time !== null ? formatTime(p.time) : '']);
  });
  
  let maleData = [['Posição', 'Nome', 'Número', 'Tempo']];
  male.forEach((p, index) => {
    maleData.push([index + 1, p.name, p.number, p.time !== null ? formatTime(p.time) : '']);
  });
  
  let wb = XLSX.utils.book_new();
  let wsFemale = XLSX.utils.aoa_to_sheet(femaleData);
  let wsMale = XLSX.utils.aoa_to_sheet(maleData);
  XLSX.utils.book_append_sheet(wb, wsFemale, "Feminino");
  XLSX.utils.book_append_sheet(wb, wsMale, "Masculino");
  
  XLSX.writeFile(wb, 'resultado_sport_run.xlsx');
}

// Reseta todos os dados e recarrega a página
function resetAll() {
  if (confirm("Tem certeza que deseja resetar a página? Todos os dados serão perdidos.")) {
    localStorage.removeItem('participants');
    location.reload();
  }
}

// Inicializa os dados ao carregar a página
window.onload = function() {
  loadParticipants();
  updateParticipantTable();
  updateDisplay();
};
