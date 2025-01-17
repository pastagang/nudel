import { nudelAlert } from './alert.js';
import { pastamirror } from './main.js';
import { getSettings } from './settings.js';

const exportButton = document.querySelector('#export-button');
const exportDialog = document.querySelector('#export-dialog');
const exportCloseButton = document.querySelector('#export-close-button');

const exportCopyButton = document.querySelector('#export-copy-button');
const exportDownloadButton = document.querySelector('#export-download-button');
const exportOpenFlokButton = document.querySelector('#export-open-flok-button');

exportButton.addEventListener('click', () => {
  exportDialog.showModal();
  exportOpenFlokButton.href = `https://${getFlokLink()}`;
  exportCloseButton.focus();
});

// Return the lines of a panel view.
function getDocumentText(view) {
  const doc = view.viewState.state.doc;
  return doc.children ? doc.children.flatMap((c) => c.text) : doc.text;
}

export function getFlokLink() {
  const prettyDate = getPrettyDate();
  const prefix = `// "nudel ${prettyDate}" @by pastagang\n//\n`;

  const panels = [];
  const targets = [];
  pastamirror.currentEditors.forEach((it, key) => {
    panels.push(`${key == '1' ? prefix : ''}${getDocumentText(it.view).join('\n')}`);
    targets.push(it.doc.target);
  });
  return `flok.cc#targets=${targets.join(
    ',',
  )}&${panels.map((it, index) => `c${index}=${btoa(unescape(encodeURIComponent(it)))}`).join('&')}`;
}

export function copyToClipboard(txt, { message } = {}) {
  // Copy to the clipboard
  navigator.clipboard.writeText(txt);
  if (message) {
    nudelAlert(`Copied ${message} to clipboard`);
  } else {
    nudelAlert('Copied to clipboard');
  }
}

export function getPrettyDate() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

export function downloadAsFile(txt, { fileName = `nuddle-export-${getPrettyDate()}.txt` } = {}) {
  // Download file
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURI(txt);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}

export function getCode() {
  const prettyDate = getPrettyDate();
  const bundle = [`// "nudel ${prettyDate}" @by pastagang`, '//'];
  pastamirror.editorViews.forEach((view, key) => {
    bundle.push(`// panel ${key}`);
    bundle.push(...getDocumentText(view));
    bundle.push('\n\n');
  });
  return bundle.join('\n');
}

exportCopyButton.addEventListener('click', () => {
  const txt = getCode();
  copyToClipboard(txt, { message: 'code' });
});

exportDownloadButton.addEventListener('click', () => {
  const txt = getCode();
  downloadAsFile(txt);
});
