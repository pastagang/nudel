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
};

const usernameInput = document.querySelector('#settings-username');
const strudelCheckbox = document.querySelector('#settings-strudel-enabled');
const hydraCheckbox = document.querySelector('#settings-hydra-enabled');

function inferSettingsFromDom() {
  const inferredSettings = {
    username: usernameInput ? usernameInput.value : defaultSettings.username,
    strudelEnabled: strudelCheckbox ? strudelCheckbox.checked : defaultSettings.strudelEnabled,
    hydraEnabled: hydraCheckbox ? hydraCheckbox.checked : defaultSettings.hydraEnabled,
  };
  return inferredSettings;
}

let previousSettings = null;
function applySettingsToNudel(settings) {
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
        document.body.appendChild(Frame.hydra);
      }
    } else {
      Frame.hydra?.remove();
      Frame.hydra = null;
    }
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

const loadedSettings = getSettingsFromLocalStorage();
applySettingsToNudel(loadedSettings);
