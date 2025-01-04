import { updateMiniLocations } from '@strudel/codemirror';
import { nudelConfirm } from './confirm.js';
import { editorViews, Frame } from './main.js';

//=======//
// ADMIN //
//=======//
// Scroll down to configure settings ...

const settingsButton = document.querySelector('#settings-button');
const settingsDialog = document.querySelector('#settings-dialog');

settingsButton.addEventListener('click', () => {
  settingsDialog.showModal();
});

const LOCAL_STORAGE_KEY = 'nudelsalat-settings-v0';

function getSettingsFromLocalStorage() {
  const rawSettings = localStorage.getItem(LOCAL_STORAGE_KEY);

  let parsedSettings = { ...defaultSettings };
  if (rawSettings) {
    try {
      parsedSettings = { ...defaultSettings, ...JSON.parse(rawSettings) };
    } catch (e) {
      console.warn('failed to parse settings. defaulting to defaults.', e);
    }
  }

  // Re-affirm!
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedSettings));
  return parsedSettings;
}

function saveSettingsToLocalStorage(settings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

function setSettings(settings) {
  saveSettingsToLocalStorage(settings);
  loadedSettings = settings;
  applySettingsToNudel(settings);
}

export function getSettings() {
  return getSettingsFromLocalStorage();
}

const resetButton = document.querySelector('#settings-reset-button');
resetButton.addEventListener('click', async () => {
  const response = await nudelConfirm();
  if (response) {
    setSettings(defaultSettings);
  }
});

//========================//
// SETTINGS CONFIGURATION //
//========================//
// Here's where you can make changes to the settings.

const defaultSettings = {
  username: '',
  strudelEnabled: true,
  hydraEnabled: true,
  defaultZenMode: false,
  vimMode: false,
};

const usernameInput = document.querySelector('#settings-username');
const strudelCheckbox = document.querySelector('#settings-strudel-enabled');
const hydraCheckbox = document.querySelector('#settings-hydra-enabled');
const defaultZenModeCheckbox = document.querySelector('#settings-default-zen-mode');
const vimModeCheckbox = document.querySelector('#settings-vim-mode');

function inferSettingsFromDom() {
  const inferredSettings = {
    username: usernameInput ? usernameInput.value : defaultSettings.username,
    strudelEnabled: strudelCheckbox ? strudelCheckbox.checked : defaultSettings.strudelEnabled,
    hydraEnabled: hydraCheckbox ? hydraCheckbox.checked : defaultSettings.hydraEnabled,
    defaultZenMode: defaultZenModeCheckbox ? defaultZenModeCheckbox.checked : defaultSettings.defaultZenMode,
    vimMode: vimModeCheckbox ? vimModeCheckbox.checked : defaultSettings.vimMode,
  };
  return inferredSettings;
}

let previousSettings = null;

export function applySettingsToNudel(settings) {
  if (previousSettings?.username !== settings.username) {
    if (usernameInput) usernameInput.value = settings.username;
    session.user = settings.username || 'anonymous nudelfan';
  }

  if (previousSettings?.strudelEnabled !== settings.strudelEnabled) {
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

  if (previousSettings?.hydraEnabled !== settings.hydraEnabled) {
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

  defaultZenModeCheckbox.checked = settings.defaultZenMode;
  vimModeCheckbox.checked = settings.vimMode;

  if (settings.defaultZenMode && settings.defaultZenMode !== previousSettings?.hydraEnabled) {
    document.querySelector('body').classList.add('zen-mode');
  }

  previousSettings = { ...settings };
}

if (usernameInput) {
  usernameInput.addEventListener('input', () => {
    setSettings(inferSettingsFromDom());
  });
}

if (strudelCheckbox) {
  strudelCheckbox.addEventListener('change', () => {
    setSettings(inferSettingsFromDom());
  });
}

if (hydraCheckbox) {
  hydraCheckbox.addEventListener('change', () => {
    setSettings(inferSettingsFromDom());
  });
}

if (defaultZenModeCheckbox) {
  defaultZenModeCheckbox.addEventListener('change', () => {
    setSettings(inferSettingsFromDom());
  });
}

if (vimModeCheckbox) {
  vimModeCheckbox.addEventListener('change', () => {
    setSettings(inferSettingsFromDom());
  });
}

export let loadedSettings = getSettingsFromLocalStorage();

//=======//
// ABOUT //
//=======//

const aboutButton = document.querySelector('#about-button');
const aboutDialog = document.querySelector('#about-dialog');
const zenButton = document.querySelector('#zen-button');
const yesButton = document.querySelector('#about-yes-button');

aboutButton.addEventListener('click', () => aboutDialog.showModal());
yesButton.onclick = () => aboutDialog.close();
zenButton.onclick = () => {
  document.querySelector('body').classList.toggle('zen-mode');
};
