import { updateMiniLocations } from '@strudel/codemirror';
import { nudelConfirm } from './confirm.js';
import { Frame, pastamirror, session } from './main.js';
import { nudelAlert } from './alert.js';

//=====//
// API //
//=====//
// Use these exported functions if you want to interact with settings from the outside.
let loadedSettingsCache = null;

export function getSettings() {
  if (!loadedSettingsCache) {
    loadedSettingsCache = getSettingsFromLocalStorage();
  }
  return loadedSettingsCache;
}

export function setSettings(settings) {
  loadedSettingsCache = { ...settings };
  saveSettingsToLocalStorage(settings);
  applySettingsToNudel(settings);
}

export function changeSettings(changes) {
  setSettings({ ...getSettings(), ...changes });
}

//========================//
// SETTINGS CONFIGURATION //
//========================//
// Here's where you can make changes to the settings.
const defaultSettings = {
  username: '',
  strudelEnabled: true,
  hydraEnabled: true,
  shaderEnabled: true,
  kabelsalatEnabled: true,
  zenMode: false,
  panelMode: 'scroll', // "scroll" | "boxed" | |tabbed
  vimMode: false,
  lineWrapping: false,
  lineNumbers: false,
  closeBrackets: true,
  welcomeMessage: true,
};

const usernameInput = document.querySelector('#settings-username');
const strudelCheckbox = document.querySelector('#settings-strudel-enabled');
const hydraCheckbox = document.querySelector('#settings-hydra-enabled');
const shaderCheckbox = document.querySelector('#settings-shader-enabled');
const kabelsalatCheckbox = document.querySelector('#settings-kabelsalat-enabled');
const zenModeCheckbox = document.querySelector('#settings-zen-mode');
const panelModeSelect = document.querySelector('#settings-panel-mode');
const vimModeCheckbox = document.querySelector('#settings-vim-mode');
const lineWrappingCheckbox = document.querySelector('#settings-line-wrapping');
const lineNumbersCheckbox = document.querySelector('#settings-line-numbers');
const closeBracketsCheckbox = document.querySelector('#settings-close-brackets');
const welcomeMessageCheckbox = document.querySelector('#settings-welcome-message');

const welcomeUsernameInput = document.querySelector('#welcome-username');

function inferSettingsFromDom() {
  const inferredSettings = {
    username: usernameInput ? usernameInput.value : defaultSettings.username,
    strudelEnabled: strudelCheckbox ? strudelCheckbox.checked : defaultSettings.strudelEnabled,
    hydraEnabled: hydraCheckbox ? hydraCheckbox.checked : defaultSettings.hydraEnabled,
    shaderEnabled: shaderCheckbox ? shaderCheckbox.checked : defaultSettings.shaderEnabled,
    kabelsalatEnabled: kabelsalatCheckbox ? kabelsalatCheckbox.checked : defaultSettings.kabelsalatEnabled,
    zenMode: zenModeCheckbox ? zenModeCheckbox.checked : defaultSettings.zenMode,
    panelMode: panelModeSelect ? panelModeSelect.value : defaultSettings.panelMode,
    vimMode: vimModeCheckbox ? vimModeCheckbox.checked : defaultSettings.vimMode,
    lineWrapping: lineWrappingCheckbox ? lineWrappingCheckbox.checked : defaultSettings.lineWrapping,
    lineNumbers: lineNumbersCheckbox ? lineNumbersCheckbox.checked : defaultSettings.lineNumbers,
    closeBrackets: closeBracketsCheckbox ? closeBracketsCheckbox.checked : defaultSettings.closeBrackets,
    welcomeMessage: welcomeMessageCheckbox ? welcomeMessageCheckbox.checked : defaultSettings.welcomeMessage,
  };
  return inferredSettings;
}

usernameInput?.addEventListener('input', setSettingsFromDom);
strudelCheckbox?.addEventListener('change', setSettingsFromDom);
hydraCheckbox?.addEventListener('change', setSettingsFromDom);
shaderCheckbox?.addEventListener('change', setSettingsFromDom);
kabelsalatCheckbox?.addEventListener('change', setSettingsFromDom);
zenModeCheckbox?.addEventListener('change', setSettingsFromDom);
panelModeSelect?.addEventListener('change', setSettingsFromDom);
vimModeCheckbox?.addEventListener('change', setSettingsFromDom);
welcomeMessageCheckbox?.addEventListener('change', setSettingsFromDom);
lineWrappingCheckbox?.addEventListener('change', setSettingsFromDom);
lineNumbersCheckbox?.addEventListener('change', setSettingsFromDom);
closeBracketsCheckbox?.addEventListener('change', setSettingsFromDom);

function setSettingsFromDom() {
  setSettings(inferSettingsFromDom());
}

let appliedSettings = null;

function addFrame(key) {
  Frame[key] = document.createElement('iframe');
  Frame[key].src = `/${key}`;
  Frame[key].id = key;
  Frame[key].sandbox = 'allow-scripts allow-same-origin';
  document.body.appendChild(Frame[key]);
}

function removeFrame(key) {
  Frame[key]?.remove();
  Frame[key] = null;
}

export function applySettingsToNudel(settings = getSettings()) {
  zenModeCheckbox.checked = settings.zenMode;
  panelModeSelect.value = settings.boxedMode;
  vimModeCheckbox.checked = settings.vimMode;
  lineWrappingCheckbox.checked = settings.lineWrapping;
  lineNumbersCheckbox.checked = settings.lineNumbers;
  closeBracketsCheckbox.checked = settings.closeBrackets;
  panelModeSelectBurger.value = settings.panelMode;
  panelModeSelect.value = settings.panelMode;

  if (appliedSettings?.username !== settings.username) {
    if (usernameInput) usernameInput.value = settings.username;
    if (welcomeUsernameInput) welcomeUsernameInput.value = settings.username;
    session.user = settings.username || 'anonymous nudelfan';
  }

  if (appliedSettings?.strudelEnabled !== settings.strudelEnabled) {
    strudelCheckbox.checked = settings.strudelEnabled;
    if (settings.strudelEnabled) {
      !Frame.strudel && addFrame('strudel');
    } else {
      removeFrame('strudel');
      // Remove all highlighted haps
      for (const view of pastamirror.editorViews.values()) {
        updateMiniLocations(view, []);
      }
    }
  }

  if (appliedSettings?.hydraEnabled !== settings.hydraEnabled) {
    hydraCheckbox.checked = settings.hydraEnabled;
    if (settings.hydraEnabled) {
      !Frame.hydra && addFrame('hydra');
    } else {
      removeFrame('hydra');
    }
  }

  if (appliedSettings?.shaderEnabled !== settings.shaderEnabled) {
    shaderCheckbox.checked = settings.shaderEnabled;
    if (settings.shaderEnabled) {
      !Frame.shader && addFrame('shader');
    } else {
      removeFrame('shader');
    }
  }

  if (appliedSettings?.kabelsalatEnabled !== settings.kabelsalatEnabled) {
    kabelsalatCheckbox.checked = settings.kabelsalatEnabled;
    if (settings.kabelsalatEnabled) {
      !Frame.kabesalat && addFrame('kabelsalat');
    } else {
      Frame.shader?.remove();
      Frame.shader = null;
    }
  }

  if (appliedSettings?.welcomeMessage !== settings.welcomeMessage) {
    welcomeMessageCheckbox.checked = settings.welcomeMessage;
  }

  if (appliedSettings?.zenMode !== settings.zenMode) {
    zenModeCheckbox.checked = settings.zenMode;
    if (settings.zenMode) {
      document.querySelector('body').classList.add('zen-mode');
    } else {
      document.querySelector('body').classList.remove('zen-mode');
    }
  }

  if (settings.panelMode !== appliedSettings?.panelMode) {
    document.querySelector('body').classList.remove('scroll-mode', 'boxed-mode', 'tabbed-mode');
    switch (settings.panelMode) {
      case 'scroll':
        document.querySelector('body').classList.add('scroll-mode');
        break;
      case 'boxed':
        document.querySelector('body').classList.add('boxed-mode');
        break;
      case 'tabbed':
        document.querySelector('body').classList.add('tabbed-mode');
        break;
    }
  }

  pastamirror.updateExtensions(settings, appliedSettings);

  appliedSettings = { ...settings };
}

//=========//
// INNARDS //
//=========//
// You don't need to mess with these innards if you're [just] add/removing/changing settings.
// But go ahead if you want to of course!

const settingsButton = document.querySelector('#settings-button');
const settingsDialog = document.querySelector('#settings-dialog');
const doneButton = document.querySelector('#settings-done-button');
settingsButton.addEventListener('click', () => {
  settingsDialog.showModal();
  doneButton.focus();
});

const SETTINGS_LOCAL_STORAGE_KEY = 'nudelsalat-settings-v0';

function getSettingsFromLocalStorage() {
  const rawSettings = localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY);
  let parsedSettings = { ...defaultSettings };
  if (rawSettings) {
    try {
      parsedSettings = { ...defaultSettings, ...JSON.parse(rawSettings) };
    } catch (e) {
      console.warn('failed to parse settings. defaulting to defaults.', e);
    }
  }

  // Re-affirm!
  localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(parsedSettings));
  return parsedSettings;
}

function saveSettingsToLocalStorage(settings) {
  localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

const resetButton = document.querySelector('#settings-reset-button');
resetButton.addEventListener('click', async () => {
  const response = await nudelConfirm();
  if (response) {
    setSettings(defaultSettings);
  }
});

//=======//
// ABOUT //
//=======//
const aboutButton = document.querySelector('#about-button');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const exportButton = document.querySelector('#export-button');
const copyAsFlokButton = document.querySelector('#copy-as-flok-button');
const panelModeSelectBurger = document.querySelector('#panel-mode-select-burger');
const yesButton = document.querySelector('#about-yes-button');

helpButton?.addEventListener('click', () => {
  nudelAlert('Coming soon');
});

welcomeUsernameInput?.addEventListener('input', () => {
  const settings = getSettings();
  setSettings({
    ...settings,
    username: welcomeUsernameInput.value,
  });
});

yesButton.addEventListener('click', () => {
  const settings = getSettings();
  if (welcomeUsernameInput?.value) {
    setSettings({
      ...settings,
      username: welcomeUsernameInput.value,
    });
  }
});

// Return the lines of a panel view.
function getDocumentText(view) {
  const doc = view.viewState.state.doc;
  console.log(doc);
  return doc.children ? doc.children.flatMap((c) => c.text) : doc.text;
}

document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.dropdown');
  if (e.target.closest('.dropdown button')) {
    e.preventDefault();
    dropdown.classList.toggle('open');
  } else {
    dropdown.classList.remove('open');
  }
});

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
panelModeSelectBurger?.addEventListener('change', () => {
  updateSettings({ panelMode: panelModeSelectBurger.value });
});

// if (getSettings().welcomeMessage) {
//   aboutDialog.showModal();
//   yesButton.focus();
// }

settingsDialog.showModal();
