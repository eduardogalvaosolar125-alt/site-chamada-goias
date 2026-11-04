const STORAGE_KEY = 'gec-frequency-v1';
const $ = (id) => document.getElementById(id);
let currentView = 'homeView';
let currentClassId = null;
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { records: saved.records || {}, completed: saved.completed || {}, rosters: saved.rosters || {}, customClasses: saved.customClasses || [] };
  } catch (_) {
    return { records: {}, completed: {}, rosters: {}, customClasses: [] };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function localDateInput(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateLabel(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${value}T12:00:00`));
}

function weekdayFor(value) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(`${value}T12:00:00`));
}

function capitalise(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function recordKey(date, classId) {
  return `${date}__${classId}`;
}

function currentClass() {
  return allClasses().find((item) => item.id === currentClassId);
}

function allClasses() {
  return [...CLASSES, ...(state.customClasses || [])];
}

function studentsFor(item) {
  return state.rosters[item.id] || item.students;
}

function recordFor(date, classId) {
  return state.records[recordKey(date, classId)];
}

function activeClasses() {
  return allClasses().filter((item) => !item.pending && studentsFor(item).length);
}

function selectedDate() {
  return $('callDate').value || localDateInput();
}

function showView(id) {
  ['homeView', 'callView', 'attendanceView', 'historyView', 'manageView'].forEach((viewId) => {
    $(viewId).classList.toggle('hidden', viewId !== id);
  });
  currentView = id;
  $('backButton').classList.toggle('hidden', id === 'homeView');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderClasses() {
  const date = selectedDate();
  const weekday = capitalise(weekdayFor(date));
  const validDay = weekday === 'Terça-feira' || weekday === 'Quinta-feira';
  $('callDateLabel').textContent = validDay ? dateLabel(date) : `${dateLabel(date)} · escolha uma terça ou quinta-feira`;
  $('classGrid').innerHTML = allClasses().map((item) => {
    const record = recordFor(date, item.id);
    const saved = Boolean(record);
    const disabled = item.pending || !validDay;
    const status = item.pending ? 'Lista pendente' : saved ? `${record.present} presentes · ${record.absent} faltas` : 'Ainda não salva';
    return `<article class="class-row${item.pending ? ' pending' : ''}">
      <div><div class="class-code">${escapeHtml(item.code)}</div><div class="class-time">${item.start} às ${item.end}</div></div>
      <div><b>${escapeHtml(item.category)}</b><div class="class-detail"><span class="tag">${escapeHtml(weekday)}</span><span class="tag${item.pending ? ' pending' : ''}">${escapeHtml(status)}</span></div></div>
      <button class="open-class" data-class="${item.id}" ${disabled ? 'disabled' : ''}>${item.pending ? 'Aguardando lista' : saved ? 'Editar chamada' : 'Abrir chamada'}</button>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-class]').forEach((button) => {
    button.addEventListener('click', () => openAttendance(button.dataset.class));
  });
  const required = activeClasses();
  const savedCount = required.filter((item) => recordFor(date, item.id)).length;
  const completed = state.completed[`${date}__${weekday}`];
  if (completed) {
    $('completionBanner').classList.remove('hidden');
    $('completionBanner').textContent = completed.remote && !completed.pendingEmail ? 'Todas as turmas do dia foram salvas. O aviso foi enviado e os PDFs estão no Drive.' : completed.remote && completed.pendingEmail ? 'Todas as turmas estão no Drive, mas o Gmail ainda não foi configurado.' : completed.submitted ? 'Todas as turmas estão salvas. O envio para o Drive foi solicitado; confirme a resposta do backend quando ele estiver configurado.' : 'Todas as turmas do dia foram salvas neste dispositivo. Configure o Drive para gerar os PDFs e enviar o e-mail.';
  } else if (savedCount === required.length && required.length) {
    $('completionBanner').classList.remove('hidden');
    $('completionBanner').textContent = 'Todas as turmas estão salvas. O fechamento do dia será concluído automaticamente.';
  } else {
    $('completionBanner').classList.add('hidden');
  }
}

function openAttendance(classId) {
  const item = allClasses().find((entry) => entry.id === classId);
  if (!item || item.pending) return;
  currentClassId = classId;
  const date = selectedDate();
  const students = studentsFor(item);
  $('attendanceTitle').textContent = `${item.code} · ${item.start} às ${item.end}`;
  $('attendanceMeta').textContent = `${item.category} · ${capitalise(weekdayFor(date))} · ${dateLabel(date)}`;
  $('attendanceEyebrow').textContent = `CHAMADA · ${students.length} ALUNAS`;
  renderAttendance();
  showView('attendanceView');
}

function renderAttendance() {
  const item = currentClass();
  const students = studentsFor(item);
  const date = selectedDate();
  const record = recordFor(date, item.id);
  const statuses = record ? record.statuses : {};
  const marked = students.filter((name) => statuses[name]).length;
  $('attendanceCount').textContent = `${marked} de ${students.length} marcadas`;
  $('attendanceHint').textContent = record ? `Salva às ${new Date(record.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Você pode editar e salvar novamente.` : 'Marque todas antes de salvar.';
  $('saveState').textContent = record ? 'SALVA' : 'NÃO SALVA';
  $('saveState').classList.toggle('saved', Boolean(record));
  $('studentList').innerHTML = students.map((name, index) => {
    const status = statuses[name] || '';
    return `<div class="student"><div class="student-name"><span class="student-number">${index + 1}</span>${escapeHtml(name)}</div><div class="status-buttons"><button class="${status === 'present' ? 'active present' : ''}" data-status="present" data-name="${escapeAttr(name)}">Presente</button><button class="${status === 'absent' ? 'active absent' : ''}" data-status="absent" data-name="${escapeAttr(name)}">Faltou</button><span class="student-tools"><button type="button" title="Editar nome" aria-label="Editar nome" data-rename="${escapeAttr(name)}">✎</button><button type="button" title="Trocar aluna de turma" aria-label="Trocar aluna de turma" data-transfer="${escapeAttr(name)}">↔</button><button type="button" class="delete-student" title="Excluir aluna" aria-label="Excluir aluna" data-delete="${escapeAttr(name)}">×</button></span></div></div>`;
  }).join('');
  document.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => setStatus(button.dataset.name, button.dataset.status));
  });
  document.querySelectorAll('[data-transfer]').forEach((button) => {
    button.addEventListener('click', () => openStudentDialog('transfer', button.dataset.transfer));
  });
  document.querySelectorAll('[data-rename]').forEach((button) => {
    button.addEventListener('click', () => openStudentDialog('rename', button.dataset.rename));
  });
  document.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteStudent(button.dataset.delete));
  });
  const pending = students.filter((name) => !statuses[name]);
  if (pending.length) {
    $('pendingNotice').classList.remove('hidden');
    $('pendingNotice').textContent = `${pending.length} aluna(s) ainda não marcada(s).`;
    $('saveAttendance').disabled = true;
  } else {
    $('pendingNotice').classList.add('hidden');
    $('saveAttendance').disabled = false;
  }
}

function setStatus(name, status) {
  const date = selectedDate();
  const item = currentClass();
  const key = recordKey(date, item.id);
  const existing = recordFor(date, item.id) || { statuses: {} };
  existing.statuses[name] = status;
  state.records[key] = existing;
  persist();
  renderAttendance();
}

function markAllPresent() {
  const date = selectedDate();
  const item = currentClass();
  if (!item) return;
  const students = studentsFor(item);
  const key = recordKey(date, item.id);
  const existing = recordFor(date, item.id) || { statuses: {} };
  students.forEach((name) => { existing.statuses[name] = 'present'; });
  state.records[key] = existing;
  persist();
  renderAttendance();
  toast('Todas as alunas foram marcadas como presentes.');
}

async function saveAttendance() {
  const date = selectedDate();
  const item = currentClass();
  const studentsInClass = studentsFor(item);
  const record = recordFor(date, item.id);
  if (!record || studentsInClass.some((name) => !record.statuses[name])) return;
  const weekday = capitalise(weekdayFor(date));
  const students = studentsInClass.map((name) => ({ name, status: record.statuses[name] }));
  const summary = {
    action: 'saveClass', date, weekday, classId: item.id, category: item.category,
    start: item.start, end: item.end, students
  };
  $('saveAttendance').disabled = true;
  $('saveAttendance').textContent = 'Salvando...';
  try {
    const response = await postToBackend(summary);
    const present = students.filter((student) => student.status === 'present').length;
    const absent = students.length - present;
    state.records[recordKey(date, item.id)] = { ...record, date, classId: item.id, savedAt: new Date().toISOString(), present, absent, statuses: record.statuses, remote: response.remote, submitted: response.submitted, folderUrl: response.folderUrl || record.folderUrl || '' };
    persist();
    toast(response.remote ? `${item.id} salva no Drive.` : response.submitted ? `${item.id} enviada para sincronização.` : `${item.id} salva neste dispositivo.`);
    await maybeCompleteDay(date, weekday);
    showView('callView');
    renderClasses();
  } catch (error) {
    toast(error.message || 'Não foi possível salvar a chamada.');
  } finally {
    $('saveAttendance').textContent = 'Salvar chamada desta turma';
    renderAttendance();
  }
}

async function maybeCompleteDay(date, weekday) {
  const required = activeClasses();
  const saved = required.filter((item) => recordFor(date, item.id));
  if (saved.length !== required.length) return;
  const key = `${date}__${weekday}`;
  if (state.completed[key]) return;
  const files = saved.map((item) => ({ classId: item.id, url: recordFor(date, item.id).url || '' }));
  const folderUrl = saved.map((item) => recordFor(date, item.id).folderUrl).find(Boolean) || '';
  const response = await postToBackend({ action: 'completeDay', date, weekday, files, folderUrl });
  state.completed[key] = { date, weekday, completedAt: new Date().toISOString(), remote: response.remote, submitted: response.submitted, pendingEmail: response.pendingEmail };
  persist();
}

async function postToBackend(payload) {
  const config = window.FREQUENCIA_CONFIG || {};
  if (!config.apiUrl) return { ok: true, remote: false };
  const options = { method: 'POST', mode: config.apiMode || 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) };
  const response = await fetch(config.apiUrl, options);
  if (options.mode === 'no-cors') return { ok: true, remote: false, submitted: true };
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'O backend recusou o salvamento.');
  return { ...data, remote: true, submitted: false };
}

let dialogMode = 'add';
let dialogStudent = '';

function openStudentDialog(mode, name = '') {
  const item = currentClass();
  if (!item) return;
  dialogMode = mode;
  dialogStudent = name;
  $('studentName').value = name;
  $('studentName').readOnly = mode === 'transfer';
  $('dialogTitle').textContent = mode === 'transfer' ? 'Trocar aluna de turma' : mode === 'rename' ? 'Editar nome da aluna' : 'Adicionar nova aluna';
  $('dialogEyebrow').textContent = mode === 'transfer' ? 'TRANSFERIR ALUNA' : mode === 'rename' ? 'EDITAR NOME' : `NOVA ALUNA · ${item.code}`;
  $('targetClassLabel').classList.toggle('hidden', mode !== 'transfer');
  if (mode === 'transfer') {
    $('targetClass').innerHTML = allClasses().filter((entry) => entry.id !== item.id && !entry.pending).map((entry) => `<option value="${entry.id}">${entry.code} · ${entry.start} às ${entry.end}</option>`).join('');
  }
  $('studentDialog').showModal();
  if (mode !== 'transfer') $('studentName').focus();
}

function closeStudentDialog() {
  $('studentDialog').close();
  $('studentName').value = '';
  $('studentName').readOnly = false;
}

function setRoster(classId, names) {
  state.rosters[classId] = [...new Set(names)];
}

function addStudent(name) {
  const item = currentClass();
  const trimmed = name.trim().replace(/\s+/g, ' ').toUpperCase();
  if (!trimmed) return;
  const duplicate = allClasses().find((entry) => studentsFor(entry).some((student) => student.toLowerCase() === trimmed.toLowerCase()));
  if (duplicate) { toast(`Essa aluna já está cadastrada na ${duplicate.id}.`); return; }
  setRoster(item.id, [...studentsFor(item), trimmed]);
  persist();
  closeStudentDialog();
  renderAttendance();
  toast(`${trimmed} adicionada à ${item.id}.`);
}

function transferStudent(name, targetId) {
  const source = currentClass();
  const target = allClasses().find((entry) => entry.id === targetId);
  if (!source || !target || source.id === target.id) return;
  const sourceNames = studentsFor(source).filter((student) => student !== name);
  const targetNames = studentsFor(target);
  if (targetNames.some((student) => student.toLowerCase() === name.toLowerCase())) { toast(`Essa aluna já está na ${target.id}.`); return; }
  setRoster(source.id, sourceNames);
  setRoster(target.id, [...targetNames, name]);
  Object.values(state.records).forEach((record) => { if (record.classId === source.id && record.statuses) delete record.statuses[name]; });
  persist();
  closeStudentDialog();
  renderAttendance();
  toast(`${name} transferida para ${target.id}.`);
}

function deleteStudent(name) {
  const item = currentClass();
  if (!item || !window.confirm(`Excluir ${name} da ${item.id}?`)) return;
  setRoster(item.id, studentsFor(item).filter((student) => student !== name));
  Object.values(state.records).forEach((record) => { if (record.classId === item.id && record.statuses) delete record.statuses[name]; });
  persist();
  renderAttendance();
  toast(`${name} excluída da ${item.id}.`);
}

function renameStudent(oldName, newName) {
  const item = currentClass();
  const name = newName.trim().replace(/\s+/g, ' ').toUpperCase();
  if (!item || !name) return;
  if (studentsFor(item).some((student) => student !== oldName && student.toLowerCase() === name.toLowerCase())) { toast('Já existe uma aluna com esse nome nesta turma.'); return; }
  setRoster(item.id, studentsFor(item).map((student) => student === oldName ? name : student).sort((a, b) => a.localeCompare(b, 'pt-BR')));
  Object.values(state.records).forEach((record) => { if (record.classId === item.id && record.statuses && record.statuses[oldName]) { record.statuses[name] = record.statuses[oldName]; delete record.statuses[oldName]; } });
  persist(); closeStudentDialog(); renderAttendance(); toast('Nome atualizado.');
}

function parseNames(text) {
  return [...new Set(text.split(/[\n,;]+/).map((name) => name.trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function renderManage() {
  $('manageList').innerHTML = allClasses().map((item) => `<article class="manage-card card"><div class="manage-card-head"><div><b>${escapeHtml(item.code)}</b><span>${escapeHtml(item.start)} às ${escapeHtml(item.end)} · ${escapeHtml(item.category)}</span></div><span class="tag">${studentsFor(item).length} alunas</span></div><textarea data-roster="${escapeAttr(item.id)}" rows="5">${escapeHtml(studentsFor(item).join('\n'))}</textarea><button class="open-class save-roster" data-save-roster="${escapeAttr(item.id)}">Salvar lista em ordem alfabética</button></article>`).join('');
  document.querySelectorAll('[data-save-roster]').forEach((button) => button.addEventListener('click', () => {
    const item = allClasses().find((entry) => entry.id === button.dataset.saveRoster);
    const names = parseNames(document.querySelector(`[data-roster="${CSS.escape(item.id)}"]`).value);
    setRoster(item.id, names); persist(); renderManage(); toast(`${item.code}: lista atualizada com ${names.length} alunas.`);
  }));
}

function createClass(form) {
  const code = form.code.value.trim().toUpperCase();
  if (allClasses().some((item) => item.id === code || item.code === code)) { toast('Já existe uma turma com esse código.'); return; }
  const days = form.day.value === 'Terça e quinta' ? ['Terça-feira', 'Quinta-feira'] : [form.day.value];
  const item = { id: code, code, days, start: form.start.value, end: form.end.value, category: form.category.value.trim(), students: parseNames(form.students.value), pending: false };
  state.customClasses.push(item); setRoster(item.id, item.students); persist(); $('classDialog').close(); $('classForm').reset(); renderManage(); toast(`${code} criada com ${item.students.length} alunas.`);
}

function renderHistory() {
  const records = Object.values(state.records).sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  if (!records.length) {
    $('historyList').innerHTML = '<div class="empty-state">Nenhuma chamada foi salva ainda. Abra “Chamada” para começar.</div>';
    return;
  }
  const groups = {};
  records.forEach((record) => {
    const key = `${record.date}__${record.classId}`;
    groups[key] = record;
  });
  $('historyList').innerHTML = Object.values(groups).map((record) => `<article class="history-card card"><h2>${escapeHtml(record.classId)}</h2><p>${escapeHtml(dateLabel(record.date))} · salva às ${new Date(record.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p><div class="history-badges"><span class="badge-present">${record.present || 0} presentes</span><span class="badge-absent">${record.absent || 0} faltas</span><span class="tag">${record.remote ? 'Drive confirmado' : record.submitted ? 'Envio solicitado' : 'Dispositivo'}</span></div></article>`).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function toast(message) {
  const element = $('toast');
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove('show'), 3200);
}

$('callDate').value = localDateInput();
$('callDate').addEventListener('change', () => { if (currentView === 'callView') renderClasses(); });
$('openCall').addEventListener('click', () => { showView('callView'); renderClasses(); });
$('openHistory').addEventListener('click', () => { showView('historyView'); renderHistory(); });
$('openManage').addEventListener('click', () => { showView('manageView'); renderManage(); });
$('brandButton').addEventListener('click', () => showView('homeView'));
$('backButton').addEventListener('click', () => {
  if (currentView === 'attendanceView') { showView('callView'); renderClasses(); }
  else showView('homeView');
});
$('markAllPresent').addEventListener('click', markAllPresent);
$('saveAttendance').addEventListener('click', saveAttendance);
$('addStudent').addEventListener('click', () => openStudentDialog('add'));
$('cancelDialog').addEventListener('click', closeStudentDialog);
$('studentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (dialogMode === 'add') addStudent($('studentName').value);
  else if (dialogMode === 'rename') renameStudent(dialogStudent, $('studentName').value);
  else transferStudent(dialogStudent, $('targetClass').value);
});
$('newClass').addEventListener('click', () => $('classDialog').showModal());
$('cancelClass').addEventListener('click', () => $('classDialog').close());
$('classForm').addEventListener('submit', (event) => { event.preventDefault(); createClass({ code: $('classCode'), day: $('classDay'), category: $('classCategory'), start: $('classStart'), end: $('classEnd'), students: $('classStudents') }); });

window.setTimeout(() => {
  $('splash').classList.add('hidden');
  showView('homeView');
}, 2400);
