const reportsList = document.querySelector('#reports-list');
const reportsStatus = document.querySelector('#reports-status');
const reportFormSection = document.querySelector('#report-form-section');
const reportForm = document.querySelector('#report-form');
const reportFormStatus = document.querySelector('#report-form-status');
const channelId = new URLSearchParams(location.search).get('channelId');
const reportStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

async function loadUser() {
  const response = await fetch('/api/users/me');
  if (!response.ok) { location.href = '/login'; return false; }
  const user = await response.json();
  document.querySelector('#welcome').textContent = `Welcome, ${user.email}`;
  return true;
}

function formatReason(reason) {
  return reason.toLowerCase().split('_').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
}

function createReportItem(report) {
  const item = document.createElement('article');
  item.className = 'report-item';
  const channel = document.createElement('h3');
  channel.textContent = report.channelId?.name || 'Channel unavailable';
  const reason = document.createElement('p');
  reason.textContent = `Reason: ${formatReason(report.reason)}`;
  const description = document.createElement('p');
  description.textContent = report.description;
  const status = document.createElement('p');
  status.className = 'report-status';
  status.textContent = report.status;
  const created = document.createElement('p');
  created.className = 'report-date';
  created.textContent = new Date(report.createdAt).toLocaleString();
  item.append(channel, reason, description, status, created);

  const evidenceUrls = report.evidenceUrls || [];
  if (evidenceUrls.length > 0) {
    const evidenceList = document.createElement('ul');
    evidenceList.className = 'evidence-list';
    evidenceUrls.forEach((evidenceUrl, index) => {
      const evidenceItem = document.createElement('li');
      const evidence = document.createElement('a');
      evidence.href = evidenceUrl;
      evidence.target = '_blank';
      evidence.rel = 'noopener';
      evidence.textContent = `View evidence image ${index + 1}`;
      evidenceItem.append(evidence);
      evidenceList.append(evidenceItem);
    });
    item.append(evidenceList);
  }

  // TODO v4.5 13:
  // Permite editar reason, description y status desde la lista.
  // Objetivo: enviar los cambios con PATCH al Report seleccionado.
  // Resultado esperado: la lista mostrará el Report actualizado.
  const actions = document.createElement('div');
  actions.className = 'report-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    actions.replaceWith(createEditForm(report));
  });
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteReport(report._id));
  actions.append(editButton, deleteButton);
  item.append(actions);
  return item;
}

function createSelect(options, selectedValue) {
  const select = document.createElement('select');
  options.forEach((optionValue) => {
    const option = new Option(formatReason(optionValue), optionValue, false, optionValue === selectedValue);
    select.append(option);
  });
  return select;
}

function createEditForm(report) {
  const form = document.createElement('form');
  form.className = 'report-edit-form';
  const reason = createSelect(['STREAM_DOES_NOT_LOAD', 'WRONG_CHANNEL', 'AUDIO_PROBLEM', 'VIDEO_PROBLEM', 'OTHER'], report.reason);
  const description = document.createElement('textarea');
  description.maxLength = 1000;
  description.required = true;
  description.value = report.description;
  const status = createSelect(reportStatuses, report.status);
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Save changes';
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', loadReports);
  form.append(reason, description, status, saveButton, cancelButton);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/reports/${report._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.value, description: description.value, status: status.value })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      reportFormStatus.textContent = payload.error?.message || 'Could not update the report.';
      return;
    }
    reportFormStatus.textContent = 'Report updated.';
    await loadReports();
  });
  return form;
}

// TODO v4.5 16:
// Elimina un Report desde la lista después de una confirmación simple.
// Objetivo: solicitar DELETE para el Report seleccionado.
// Resultado esperado: la lista se actualizará sin el Report eliminado.
async function deleteReport(reportId) {
  if (!confirm('Delete this report?')) return;
  const response = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    reportFormStatus.textContent = payload.error?.message || 'Could not delete the report.';
    return;
  }
  reportFormStatus.textContent = 'Report deleted.';
  await loadReports();
}

async function loadReports() {
  const response = await fetch('/api/reports');
  if (!response.ok) { reportsStatus.textContent = 'Could not load reports.'; return; }
  const { reports } = await response.json();
  reportsStatus.textContent = `${reports.length} report${reports.length === 1 ? '' : 's'}`;
  if (reports.length === 0) {
    reportsList.replaceChildren(Object.assign(document.createElement('p'), { className: 'empty-state', textContent: 'You have not reported a channel yet.' }));
    return;
  }
  reportsList.replaceChildren(...reports.map(createReportItem));
}

async function submitReport(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('channelId', channelId);
  formData.append('reason', document.querySelector('#report-reason').value);
  formData.append('description', document.querySelector('#report-description').value);
  // TODO v4.5 10:
  // Envía cada evidencia seleccionada con el mismo nombre de campo.
  // Objetivo: relacionar todos los archivos con upload.array().
  // Resultado esperado: Multer recibirá hasta cinco imágenes en request.files.
  const evidenceFiles = document.querySelector('#report-evidence').files;
  // TODO v4.5 4:
  // Completa el nombre del campo utilizado para enviar la imagen.
  // Objetivo: relacionar el archivo del formulario con upload.single().
  // Resultado esperado: Multer reconocerá la evidencia enviada por el navegador.
  for (const file of evidenceFiles) {
    formData.append('evidence', file);
  }

  reportFormStatus.textContent = 'Submitting report…';
  // TODO v4.5 5:
  // Completa el body de la petición utilizando el FormData construido.
  // Objetivo: enviar los campos de texto y la evidencia en una misma solicitud.
  // Resultado esperado: POST /api/reports recibirá correctamente multipart/form-data.
  const response = await fetch('/api/reports', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    reportFormStatus.textContent = payload.error?.message || 'Could not submit the report.';
    return;
  }

  reportForm.reset();
  reportFormStatus.textContent = 'Report saved.';
  await loadReports();
}

function configureReportForm() {
  if (!channelId) return;
  reportFormSection.hidden = false;
  document.querySelector('#report-channel-id').value = channelId;
  document.querySelector('#report-channel').textContent = 'Report the selected channel.';
  reportForm.addEventListener('submit', submitReport);
}

document.querySelector('#logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/login'; });
async function start() { if (await loadUser()) { configureReportForm(); await loadReports(); } }
start();
