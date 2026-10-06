const reportsList = document.querySelector('#reports-list');
const reportsStatus = document.querySelector('#reports-status');
const reportFormSection = document.querySelector('#report-form-section');
const reportForm = document.querySelector('#report-form');
const reportFormStatus = document.querySelector('#report-form-status');

const channelId =
  new URLSearchParams(location.search).get('channelId');

async function loadUser() {
  const response = await fetch('/api/users/me');

  if (!response.ok) {
    location.href = '/login';
    return false;
  }

  const user = await response.json();

  document.querySelector('#welcome').textContent =
    `Welcome, ${user.email}`;

  return true;
}

function formatReason(reason) {
  if (!reason) {
    return 'Other';
  }

  return reason
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        `${word[0].toUpperCase()}${word.slice(1)}`
    )
    .join(' ');
}

function createReasonSelect(currentReason) {
  const select = document.createElement('select');

  const reasons = [
    'STREAM_DOES_NOT_LOAD',
    'WRONG_CHANNEL',
    'AUDIO_PROBLEM',
    'VIDEO_PROBLEM',
    'OTHER'
  ];

  reasons.forEach((reason) => {
    const option = document.createElement('option');

    option.value = reason;
    option.textContent = formatReason(reason);
    option.selected = reason === currentReason;

    select.append(option);
  });

  return select;
}

function showEditForm(report, item) {
  const form = document.createElement('form');

  const reasonLabel = document.createElement('label');
  reasonLabel.textContent = 'Reason';

  const reasonSelect = createReasonSelect(report.reason);
  reasonLabel.append(reasonSelect);

  const descriptionLabel =
    document.createElement('label');

  descriptionLabel.textContent = 'Description';

  const descriptionInput =
    document.createElement('textarea');

  descriptionInput.value = report.description || '';
  descriptionInput.maxLength = 1000;
  descriptionInput.required = true;

  descriptionLabel.append(descriptionInput);

  const statusLabel = document.createElement('label');
  statusLabel.textContent = 'Status';

  const statusSelect = document.createElement('select');

  const openOption = document.createElement('option');
  openOption.value = 'OPEN';
  openOption.textContent = 'Open';
  openOption.selected = true;

  statusSelect.append(openOption);
  statusLabel.append(statusSelect);

  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Save changes';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';

  cancelButton.addEventListener('click', async () => {
    await loadReports();
  });

  form.append(
    reasonLabel,
    reasonSelect,
    descriptionLabel,
    descriptionInput,
    statusLabel,
    statusSelect,
    saveButton,
    cancelButton
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    const response = await fetch(
      `/api/reports/${report._id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reasonSelect.value,
          description: descriptionInput.value,
          status: statusSelect.value
        })
      }
    );

    if (!response.ok) {
      const payload =
        await response.json().catch(() => ({}));

      alert(
        payload.error?.message ||
        'Could not update the report.'
      );

      saveButton.disabled = false;
      saveButton.textContent = 'Save changes';

      return;
    }

    await loadReports();
  });

  item.replaceChildren(form);
}

function createReportItem(report) {
  const item = document.createElement('article');
  item.className = 'report-item';

  const channel = document.createElement('h3');

  channel.textContent =
    report.channelId?.name ||
    'Channel unavailable';

  const reason = document.createElement('p');

  reason.textContent =
    `Reason: ${formatReason(report.reason)}`;

  const description = document.createElement('p');

  description.textContent =
    report.description || 'No description';

  const status = document.createElement('p');

  status.className = 'report-status';
  status.textContent =
    report.status || 'OPEN';

  const created = document.createElement('p');

  created.className = 'report-date';

  created.textContent = report.createdAt
    ? new Date(report.createdAt).toLocaleString()
    : '';

  item.append(
    channel,
    reason,
    description,
    status,
    created
  );

  /*
   * Compatibilidad:
   * - evidenceUrls = nueva versión con varias imágenes
   * - evidenceUrl = reportes viejos con una sola imagen
   */
  let evidenceUrls = [];

  if (Array.isArray(report.evidenceUrls)) {
    evidenceUrls = report.evidenceUrls;
  } else if (report.evidenceUrl) {
    evidenceUrls = [report.evidenceUrl];
  }

  evidenceUrls.forEach((evidenceUrl, index) => {
    const evidence = document.createElement('a');

    evidence.href = evidenceUrl;
    evidence.target = '_blank';
    evidence.rel = 'noopener';

    evidence.textContent =
      `View evidence image ${index + 1}`;

    item.append(evidence);

    if (index < evidenceUrls.length - 1) {
      item.append(document.createElement('br'));
    }
  });

  const actions = document.createElement('div');

  const editButton = document.createElement('button');

  editButton.type = 'button';
  editButton.textContent = 'Edit';

  editButton.addEventListener('click', () => {
    showEditForm(report, item);
  });

  const deleteButton = document.createElement('button');

  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';

  deleteButton.addEventListener('click', async () => {
    const confirmed =
      confirm('Delete this report?');

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/reports/${report._id}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const payload =
        await response.json().catch(() => ({}));

      alert(
        payload.error?.message ||
        'Could not delete the report.'
      );

      return;
    }

    await loadReports();
  });

  actions.append(
    editButton,
    deleteButton
  );

  item.append(actions);

  return item;
}

async function loadReports() {
  const response = await fetch('/api/reports');

  if (!response.ok) {
    reportsStatus.textContent =
      'Could not load reports.';

    return;
  }

  const { reports } = await response.json();

  reportsStatus.textContent =
    `${reports.length} report${
      reports.length === 1 ? '' : 's'
    }`;

  if (reports.length === 0) {
    const empty = document.createElement('p');

    empty.className = 'empty-state';
    empty.textContent =
      'You have not reported a channel yet.';

    reportsList.replaceChildren(empty);

    return;
  }

  const reportItems =
    reports.map(createReportItem);

  reportsList.replaceChildren(...reportItems);
}

async function submitReport(event) {
  event.preventDefault();

  const formData = new FormData();

  formData.append(
    'channelId',
    channelId
  );

  formData.append(
    'reason',
    document.querySelector('#report-reason').value
  );

  formData.append(
    'description',
    document.querySelector('#report-description').value
  );

  const evidenceFiles =
    document.querySelector('#report-evidence').files;

  for (const file of evidenceFiles) {
    formData.append('evidence', file);
  }

  reportFormStatus.textContent =
    'Submitting report…';

  const response = await fetch(
    '/api/reports',
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const payload =
      await response.json().catch(() => ({}));

    reportFormStatus.textContent =
      payload.error?.message ||
      'Could not submit the report.';

    return;
  }

  reportForm.reset();

  reportFormStatus.textContent =
    'Report saved.';

  await loadReports();
}

function configureReportForm() {
  if (!channelId) {
    return;
  }

  reportFormSection.hidden = false;

  document.querySelector(
    '#report-channel-id'
  ).value = channelId;

  document.querySelector(
    '#report-channel'
  ).textContent =
    'Report the selected channel.';

  reportForm.addEventListener(
    'submit',
    submitReport
  );
}

document
  .querySelector('#logout')
  .addEventListener('click', async () => {
    await fetch(
      '/api/auth/logout',
      {
        method: 'POST'
      }
    );

    location.href = '/login';
  });

async function start() {
  if (await loadUser()) {
    configureReportForm();
    await loadReports();
  }
}

start();