import { updateMiniLocations } from '@strudel/codemirror';
import { nudelConfirm } from './confirm.js';
import { editorViews, Frame } from './main.js';

//=====//
// API //
//=====//
// Use these functions if you want to interact with settings from the outside.
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

//========================//
// SETTINGS CONFIGURATION //
//========================//
// Here's where you can make changes to the settings.
const defaultSettings = {
  username: '',
  strudelEnabled: true,
  hydraEnabled: true,
  shaderEnabled: true,
  zenMode: false,
  panelMode: 'scroll', // "scroll" | "boxed" | |tabbed
  vimMode: false,
  lineWrapping: false,
  welcomeMessage: true,
};

const usernameInput = document.querySelector('#settings-username');
const strudelCheckbox = document.querySelector('#settings-strudel-enabled');
const hydraCheckbox = document.querySelector('#settings-hydra-enabled');
const shaderCheckbox = document.querySelector('#settings-shader-enabled');
const defaultZenModeCheckbox = document.querySelector('#settings-default-zen-mode');
const panelModeSelect = document.querySelector('#settings-panel-mode');
const vimModeCheckbox = document.querySelector('#settings-vim-mode');
const lineWrappingCheckbox = document.querySelector('#settings-line-wrapping');
const welcomeMessageCheckbox = document.querySelector('#settings-welcome-message');
const welcomeUsernameInput = document.querySelector('#welcome-username');

function inferSettingsFromDom() {
  const inferredSettings = {
    username: usernameInput ? usernameInput.value : defaultSettings.username,
    strudelEnabled: strudelCheckbox ? strudelCheckbox.checked : defaultSettings.strudelEnabled,
    hydraEnabled: hydraCheckbox ? hydraCheckbox.checked : defaultSettings.hydraEnabled,
    shaderEnabled: shaderCheckbox ? shaderCheckbox.checked : defaultSettings.shaderEnabled,
    zenMode: defaultZenModeCheckbox ? defaultZenModeCheckbox.checked : defaultSettings.zenMode,
    panelMode: panelModeSelect ? panelModeSelect.value : defaultSettings.panelMode,
    vimMode: vimModeCheckbox ? vimModeCheckbox.checked : defaultSettings.vimMode,
    lineWrapping: lineWrappingCheckbox ? lineWrappingCheckbox.checked : defaultSettings.lineWrapping,
    welcomeMessage: welcomeMessageCheckbox ? welcomeMessageCheckbox.checked : defaultSettings.welcomeMessage,
  };
  return inferredSettings;
}

let appliedSettings = null;
export function applySettingsToNudel(settings = getSettings()) {
  if (appliedSettings?.username !== settings.username) {
    if (usernameInput) usernameInput.value = settings.username;
    if (welcomeUsernameInput) welcomeUsernameInput.value = settings.username;
    session.user = settings.username || 'anonymous nudelfan';
  }

  if (appliedSettings?.strudelEnabled !== settings.strudelEnabled) {
    strudelCheckbox.checked = settings.strudelEnabled;
    if (settings.strudelEnabled) {
      if (!Frame.strudel) {
        Frame.strudel = document.createElement('iframe');
        Frame.strudel.src = '/strudel';
        Frame.strudel.id = 'strudel';
        Frame.strudel.sandbox = 'allow-scripts allow-same-origin';
        document.body.appendChild(Frame.strudel);
      }
    } else {
      Frame.strudel?.remove();
      Frame.strudel = null;
      // Remove all highlighted haps
      for (const view of editorViews.values()) {
        updateMiniLocations(view, []);
      }
    }
  }

  if (appliedSettings?.hydraEnabled !== settings.hydraEnabled) {
    hydraCheckbox.checked = settings.hydraEnabled;
    if (settings.hydraEnabled) {
      if (!Frame.hydra) {
        Frame.hydra = document.createElement('iframe');
        Frame.hydra.src = '/hydra';
        Frame.hydra.id = 'hydra';
        Frame.hydra.sandbox = 'allow-scripts allow-same-origin';
        document.body.appendChild(Frame.hydra);
      }
    } else {
      Frame.hydra?.remove();
      Frame.hydra = null;
    }
  }

  if (appliedSettings?.shaderEnabled !== settings.shaderEnabled) {
    shaderCheckbox.checked = settings.shaderEnabled;
    if (settings.shaderEnabled) {
      if (!Frame.shader) {
        Frame.shader = document.createElement('iframe');
        Frame.shader.src = '/shader';
        Frame.shader.id = 'shader';
        Frame.shader.sandbox = 'allow-scripts allow-same-origin';
        document.body.appendChild(Frame.shader);
      }
    } else {
      Frame.shader?.remove();
      Frame.shader = null;
    }
  }

  defaultZenModeCheckbox.checked = settings.zenMode;
  panelModeSelect.value = settings.boxedMode;
  vimModeCheckbox.checked = settings.vimMode;
  lineWrappingCheckbox.checked = settings.lineWrapping;

  if (settings.zenMode !== appliedSettings?.zenMode) {
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

  appliedSettings = { ...settings };
}

usernameInput?.addEventListener('input', setSettingsFromDom);
strudelCheckbox?.addEventListener('change', setSettingsFromDom);
hydraCheckbox?.addEventListener('change', setSettingsFromDom);
shaderCheckbox?.addEventListener('change', setSettingsFromDom);
defaultZenModeCheckbox?.addEventListener('change', setSettingsFromDom);
panelModeSelect?.addEventListener('change', setSettingsFromDom);
vimModeCheckbox?.addEventListener('change', setSettingsFromDom);
welcomeMessageCheckbox?.addEventListener('change', setSettingsFromDom);
lineWrappingCheckbox?.addEventListener('change', setSettingsFromDom);

function setSettingsFromDom() {
  setSettings(inferSettingsFromDom());
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
const aboutDialog = document.querySelector('#about-dialog');
const exportButton = document.querySelector('#export-button');
const zenButton = document.querySelector('#zen-button');
const boxedButton = document.querySelector('#boxed-button');
const yesButton = document.querySelector('#about-yes-button');

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
  return doc.children ? doc.children.flatmap((c) => c.text) : doc.text;
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

exportButton.addEventListener('click', () => {
  const date = new Date().toISOString().substr(0, 16).replace('T', ' ');
  const bundle = [`// "nudel ${date}" @by pastagang`, '//'];
  editorViews.forEach((view, key) => {
    bundle.push(`// panel ${key}`);
    bundle.push(...getDocumentText(view));
    bundle.push('\n\n');
  });
  const txt = bundle.join('\n');
  navigator.clipboard.writeText(txt);
  console.log(`Copied ${txt.length} bytes`);
});

aboutButton.addEventListener('click', () => {
  aboutDialog.showModal();
  yesButton.focus();
});
zenButton.onclick = () => {
  const settings = getSettings();
  setSettings({ ...settings, zenMode: !settings.zenMode });
};
boxedButton.onclick = () => {
  const settings = getSettings();
  setSettings({ ...settings, boxedMode: !settings.boxedMode });
};

const { welcomeMessage } = getSettings();
welcomeMessageCheckbox.checked = welcomeMessage;
if (getSettings().welcomeMessage) {
  aboutDialog.showModal();
  yesButton.focus();
}
