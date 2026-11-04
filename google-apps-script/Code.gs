const ROOT_FOLDER_NAME = 'Frequência de turmas do Goiás Esporte Clube';
const DEFAULT_EMAIL = 'professorjoaogec@gmail.com';
const ALLOWED_CLASSES = {
  'VAG-01': { category: 'Sub-11', start: '16:00', end: '17:00' },
  'VAG-02': { category: 'Sub-13', start: '17:20', end: '18:20' },
  'VAG-03': { category: 'Sub-15', start: '18:20', end: '19:20' },
  'VAG-04': { category: 'Sub-13', start: '19:20', end: '20:20' },
  'VAG-05': { category: 'Sub-15', start: '20:20', end: '21:20' }
};

function doGet() {
  return json_({ ok: true, service: 'frequencia-goias', message: 'Endpoint ativo.' });
}

function authorizeServices() {
  DriveApp.getRootFolder().getName();
  const testDocument = DocumentApp.create('teste-autorizacao-goias');
  DriveApp.getFileById(testDocument.getId()).setTrashed(true);
  MailApp.getRemainingDailyQuota();
  Logger.log('Drive, Documentos e Gmail autorizados.');
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (payload.action === 'saveClass') return json_(saveClass_(payload));
    if (payload.action === 'completeDay') return json_(completeDay_(payload));
    return json_({ ok: false, error: 'Ação inválida.' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function saveClass_(payload) {
  validatePayload_(payload);
  const root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const weekday = safeWeekday_(payload.weekday);
  const weekdayFolder = getOrCreateFolder_(root, weekday);
  const dateFolder = getOrCreateFolder_(weekdayFolder, payload.date);
  const fileName = payload.classId + ' - ' + (payload.start || '') + ' às ' + (payload.end || '') + '.pdf';
  const pdf = createPdf_(dateFolder, fileName, payload);
  return { ok: true, action: 'saveClass', classId: payload.classId, fileId: pdf.getId(), url: pdf.getUrl(), folderUrl: dateFolder.getUrl() };
}

function completeDay_(payload) {
  if (!payload.date || !Array.isArray(payload.files)) throw new Error('Data e arquivos são obrigatórios.');
  validateDate_(payload.date);
  if (payload.weekday !== 'Terça-feira' && payload.weekday !== 'Quinta-feira') throw new Error('O dia deve ser terça ou quinta-feira.');
  payload.files.forEach(function(file) { validateClassId_(file.classId); });
  const email = PropertiesService.getScriptProperties().getProperty('DESTINATION_EMAIL') || DEFAULT_EMAIL;
  if (!email || email === DEFAULT_EMAIL) return { ok: true, pendingEmail: true, files: payload.files.length };
  const key = 'email-sent-' + payload.date + '-' + (payload.weekday || 'dia');
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(key)) return { ok: true, alreadySent: true };
  const subject = 'Frequência do dia ' + payload.date + ' atualizada — Goiás Esporte Clube';
  const lines = [
    'As frequências foram atualizadas e salvas no Google Drive.',
    '',
    'Dia: ' + (payload.weekday || ''),
    'Data: ' + payload.date,
    '',
    'Arquivos salvos:'
  ];
  payload.files.forEach(function(file) { lines.push('- ' + file.classId + ': ' + (file.url || 'arquivo salvo')); });
  lines.push('', 'Pasta: ' + (payload.folderUrl || 'Frequência de turmas do Goiás Esporte Clube'));
  MailApp.sendEmail(email, subject, lines.join('\n'));
  props.setProperty(key, new Date().toISOString());
  return { ok: true, action: 'completeDay', sentTo: email, files: payload.files.length };
}

function createPdf_(folder, fileName, payload) {
  const temp = DocumentApp.create('temp-' + fileName.replace(/[^a-zA-Z0-9-]/g, '-'));
  const body = temp.getBody();
  body.appendParagraph('GOIÁS ESPORTE CLUBE').setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('Frequência de turma').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Turma: ' + payload.classId + ' | Categoria: ' + (payload.category || '') + '\nData: ' + payload.date + ' | ' + (payload.weekday || '') + '\nHorário: ' + (payload.start || '') + ' às ' + (payload.end || ''));
  const table = body.appendTable([['Aluna', 'Situação']]);
  payload.students.forEach(function(student) {
    const row = table.appendTableRow();
    row.appendTableCell(String(student.name || ''));
    row.appendTableCell(labelStatus_(student.status));
  });
  body.appendParagraph('Gerado em ' + new Date().toLocaleString('pt-BR'));
  temp.saveAndClose();
  const tempFile = DriveApp.getFileById(temp.getId());
  const old = folder.getFilesByName(fileName);
  while (old.hasNext()) old.next().setTrashed(true);
  const pdf = folder.createFile(tempFile.getAs(MimeType.PDF).setName(fileName));
  tempFile.setTrashed(true);
  return pdf;
}

function labelStatus_(status) {
  return status === 'present' ? 'Presente' : status === 'absent' ? 'Faltou' : 'Não marcado';
}

function validatePayload_(payload) {
  if (!payload.date || !payload.classId || !Array.isArray(payload.students)) throw new Error('Data, turma e lista de alunas são obrigatórios.');
  validateDate_(payload.date);
  if (payload.weekday !== 'Terça-feira' && payload.weekday !== 'Quinta-feira') throw new Error('O dia deve ser terça ou quinta-feira.');
  validateClassId_(payload.classId);
  if (payload.students.length < 1 || payload.students.length > 80) throw new Error('Quantidade de alunas inválida.');
  payload.students.forEach(function(student) {
    if (!student || !String(student.name || '').trim()) throw new Error('Nome de aluna inválido.');
    if (student.status !== 'present' && student.status !== 'absent') throw new Error('Situação inválida para ' + student.name + '.');
  });
}

function validateDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error('Data inválida.');
}

function validateClassId_(value) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,30}$/.test(String(value || ''))) throw new Error('Código de turma inválido: ' + value);
}

function safeWeekday_(value) {
  return value === 'Quinta-feira' ? 'Quinta-feira' : 'Terça-feira';
}

function getOrCreateFolder_(parent, name) {
  const found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}

function setDestinationEmail(email) {
  if (!email || email.indexOf('@') < 1) throw new Error('Informe um Gmail válido.');
  PropertiesService.getScriptProperties().setProperty('DESTINATION_EMAIL', email);
  return 'E-mail configurado.';
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
