import { nudelAlert } from './alert.js';
import { getSettings } from './settings.js';

const menuButton = document.querySelector('#menu-button');
const menuContainer = document.querySelector('#menu-container');
// const menuContent = document.querySelector('#menu-content');

const aboutButton = document.querySelector('#about-button');
const aboutDialogContainer = document.querySelector('#about-dialog-container');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const exportButton = document.querySelector('#export-button');
const copyAsFlokButton = document.querySelector('#copy-as-flok-button');
const yesButton = document.querySelector('#about-yes-button');

menuButton.addEventListener('click', (e) => {
  menuContainer.classList.toggle('open');
});

helpButton?.addEventListener('click', () => {
  nudelAlert('Coming soon');
});

// welcomeUsernameInput?.addEventListener('input', () => {
//   const settings = getSettings();
//   setSettings({
//     ...settings,
//     username: welcomeUsernameInput.value,
//   });
// });

// yesButton.addEventListener('click', () => {
//   const settings = getSettings();
//   if (welcomeUsernameInput?.value) {
//     setSettings({
//       ...settings,
//       username: welcomeUsernameInput.value,
//     });
//   }
// });

// Return the lines of a panel view.
function getDocumentText(view) {
  const doc = view.viewState.state.doc;
  console.log(doc);
  return doc.children ? doc.children.flatMap((c) => c.text) : doc.text;
}

copyAsFlokButton.addEventListener('click', () => {
  // Generate the dump
  const date = new Date().toISOString();
  const prettyDate = date.substr(0, 16).replace('T', ' ');
  const prefix = `// "nudel ${prettyDate}" @by pastagang\n//\n`;

  const panels = [];
  const targets = [];
  pastamirror.currentEditors.forEach((it, key) => {
    panels.push(`${key == '1' ? prefix : ''}${getDocumentText(it.view).join('\n')}`);
    targets.push(it.doc.target);
  });
  const txt = `flok.cc#targets=${targets.join(
    ',',
  )}&${panels.map((it, index) => `c${index}=${btoa(unescape(encodeURIComponent(it)))}`).join('&')}`;

  // Copy to the clipboard
  navigator.clipboard.writeText(txt);
  console.log(`Copied ${txt.length} bytes`);
  nudelAlert('Copied flok link to clipboard');
});

exportButton.addEventListener('click', () => {
  // Generate the dump
  const date = new Date().toISOString();
  const prettyDate = date.substr(0, 16).replace('T', ' ');
  const bundle = [`// "nudel ${prettyDate}" @by pastagang`, '//'];
  pastamirror.editorViews.forEach((view, key) => {
    bundle.push(`// panel ${key}`);
    bundle.push(...getDocumentText(view));
    bundle.push('\n\n');
  });
  const txt = bundle.join('\n');

  // Copy to the clipboard
  navigator.clipboard.writeText(txt);
  console.log(`Copied ${txt.length} bytes`);

  // Download file
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURI(txt);
  hiddenElement.target = '_blank';
  hiddenElement.download = `nuddle-export-${date}.txt`;
  hiddenElement.click();
});

aboutButton?.addEventListener('click', () => {
  aboutDialog.showModal();
  yesButton.focus();
});
// panelModeSelectBurger?.addEventListener('change', () => {
//   updateSettings({ panelMode: panelModeSelectBurger.value });
// });

const html = document.documentElement;

html.addEventListener('click', (e) => {
  if (e.target === html) {
    aboutDialog.close();
  }
});

if (getSettings().welcomeMessage) {
  aboutDialog.showModal();
  yesButton.focus();
}

// settingsDialog.showModal();
