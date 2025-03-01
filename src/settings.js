import { nudelAlert } from './alert.js';
import { nudelConfirm } from './confirm.js';
import { clearStrudelHighlights, Frame, pastamirror } from './main.js';
import { getRandomName } from './random.js';
import { getSession, refreshSession } from './session.js';

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

export function setSettingsFromDom() {
  setSettings(inferSettingsFromDom());
}

window.getSettings = getSettings;
window.setSettings = setSettings;
window.changeSettings = changeSettings;
window.setSettingsFromDom = setSettingsFromDom;

//========================//
// SETTINGS CONFIGURATION //
//========================//
// Here's where you can make changes to the settings.
const defaultSettings = {
  username: '',
  userHue: getRandomUserHue(),
  strudelEnabled: true,
  hydraEnabled: true,
  shaderEnabled: true,
  kabelsalatEnabled: true,
  zenMode: false,
  panelMode: 'scroll', // "scroll" | "boxed" | |tabbed
  vimMode: false,
  lineWrapping: false,
  lineNumbers: false,
  strudelAutocomplete: false,
  closeBrackets: true,
  trackRemoteCursors2: false,
  welcomeMessage3: true,
  pastingMode: false,
  fontFamily: 'monospace',
  strudelHighlightsEnabled: true,
  workerTimers2: true,
  customRoomEnabled: false,
  customRoomName: getRandomName(3),
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
const workerTimersCheckbox = document.querySelector('#settings-strudel-worker-timers-enabled');
const lineNumbersCheckbox = document.querySelector('#settings-line-numbers');
const strudelAutocompleteCheckbox = document.querySelector('#settings-strudel-autocomplete');
const closeBracketsCheckbox = document.querySelector('#settings-close-brackets');
const trackRemoteCursorsCheckbox = document.querySelector('#settings-track-cursors');
const welcomeMessageCheckbox = document.querySelector('#settings-welcome-message');
const pastingModeCheckbox = document.querySelector('#settings-pasting-mode');
const fontFamilySelect = document.querySelector('#settings-font-family');
const strudelHighlightsEnabledCheckbox = document.querySelector('#settings-strudel-highlights-enabled');
const customRoomDisabledRadio = document.querySelector('input[name="settings-room"][value="public"]');
const customRoomEnabledRadio = document.querySelector('input[name="settings-room"][value="custom"]');
const customRoomNameInput = document.querySelector('#settings-room-name');
const roomPickerFieldset = document.querySelector('#room-picker');
const usernamePreview = document.querySelector('#username-preview');
const userHueRange = document.querySelector('#settings-color');

function inferSettingsFromDom() {
  const inferredSettings = {
    username: usernameInput?.value ?? defaultSettings.username,
    userHue: userHueRange?.value ?? defaultSettings.userHue,
    strudelEnabled: strudelCheckbox?.checked ?? defaultSettings.strudelEnabled,
    hydraEnabled: hydraCheckbox?.checked ?? defaultSettings.hydraEnabled,
    shaderEnabled: shaderCheckbox?.checked ?? defaultSettings.shaderEnabled,
    kabelsalatEnabled: kabelsalatCheckbox?.checked ?? defaultSettings.kabelsalatEnabled,
    zenMode: zenModeCheckbox?.checked ?? defaultSettings.zenMode,
    panelMode: panelModeSelect?.value ?? defaultSettings.panelMode,
    vimMode: vimModeCheckbox?.checked ?? defaultSettings.vimMode,
    lineWrapping: lineWrappingCheckbox?.checked ?? defaultSettings.lineWrapping,
    workerTimers2: workerTimersCheckbox?.checked ?? defaultSettings.workerTimers2,
    lineNumbers: lineNumbersCheckbox?.checked ?? defaultSettings.lineNumbers,
    strudelAutocomplete: strudelAutocompleteCheckbox?.checked ?? defaultSettings.strudelAutocomplete,
    closeBrackets: closeBracketsCheckbox?.checked ?? defaultSettings.closeBrackets,
    trackRemoteCursors2: trackRemoteCursorsCheckbox?.checked ?? defaultSettings.trackRemoteCursors2,
    welcomeMessage3: welcomeMessageCheckbox?.checked ?? defaultSettings.welcomeMessage3,
    pastingMode: pastingModeCheckbox?.checked ?? defaultSettings.pastingMode,
    fontFamily: fontFamilySelect?.value ?? defaultSettings.fontFamily,
    strudelHighlightsEnabled: strudelHighlightsEnabledCheckbox?.checked ?? defaultSettings.strudelHighlightsEnabled,
    customRoomEnabled: customRoomEnabledRadio?.checked ?? defaultSettings.customRoomEnabled,
    customRoomName: customRoomNameInput?.value ?? defaultSettings.customRoomName,
  };
  return inferredSettings;
}

[
  strudelCheckbox,
  hydraCheckbox,
  shaderCheckbox,
  kabelsalatCheckbox,
  zenModeCheckbox,
  panelModeSelect,
  vimModeCheckbox,
  welcomeMessageCheckbox,
  lineWrappingCheckbox,
  workerTimersCheckbox,
  lineNumbersCheckbox,
  strudelAutocompleteCheckbox,
  closeBracketsCheckbox,
  trackRemoteCursorsCheckbox,
  pastingModeCheckbox,
  fontFamilySelect,
  strudelHighlightsEnabledCheckbox,
  roomPickerFieldset,
  customRoomNameInput,
  // userHueRange,
].forEach((v) => v?.addEventListener('change', setSettingsFromDom));
[usernameInput, userHueRange].forEach((v) => v?.addEventListener('input', setSettingsFromDom));

let appliedSettings = null;

function addFrame(key) {
  Frame[key] = document.createElement('iframe');
  Frame[key].src = `/panels/${key}`;
  Frame[key].id = key;
  Frame[key].sandbox = 'allow-scripts allow-same-origin';
  Frame[key].setAttribute('scrolling', 'no');
  document.body.appendChild(Frame[key]);
}

function removeFrame(key) {
  Frame[key]?.remove();
  Frame[key] = null;
}

function isSettingChanged(settingName, { previous, next }) {
  return previous?.[settingName] !== next?.[settingName];
}

export async function applySettingsToNudel(settings = getSettings()) {
  const previous = appliedSettings;
  const next = settings;
  const diff = { previous, next };

  // We may as well begin by asking for any needed reloads first
  // ... which we only need to do if settings have already been applied
  // If they're already applied, that means the page has only just been opened!
  if (appliedSettings) {
    if (isSettingChanged('vimMode', diff)) {
      const confirmed = await nudelConfirm(
        `${next.vimMode ? 'Enabling' : 'Disabling'} vim mode triggers a reload. Are you sure you want to ${next.vimMode ? 'enable' : 'disable'} it?`,
      );
      if (confirmed) window.location.reload();
      else next.vimMode = previous.vimMode;
    }

    if (isSettingChanged('trackRemoteCursors2', diff)) {
      const confirmed = await nudelConfirm(
        `${next.trackRemoteCursors2 ? 'Enabling' : 'Disabling'} cursor tracking triggers a reload. Are you sure you want to ${next.trackRemoteCursors2 ? 'enable' : 'disable'} it?`,
      );
      if (confirmed) window.location.reload();
      else next.trackRemoteCursors2 = previous.trackRemoteCursors2;
    }

    if (isSettingChanged('workerTimers2', diff)) {
      const confirmed = await nudelConfirm(
        `${next.workerTimers2 ? 'Enabling' : 'Disabling'} worker timers triggers a reload. Are you sure you want to ${next.workerTimers2 ? 'enable' : 'disable'} it?`,
      );
      if (confirmed) window.location.reload();
      else next.workerTimers2 = previous.workerTimers2;
    }

    if (isSettingChanged('customRoomEnabled', diff)) {
      if (next.customRoomEnabled) {
        const confirmed = await nudelConfirm(
          `You're leaving the jam. Every time you do this, the power of pastagang fades a little bit. Are you sure you want to continue?`,
        );
        if (!confirmed) next.customRoomEnabled = false;
      } else {
        nudelAlert('Welcome home.');
      }
    }
  }

  zenModeCheckbox && (zenModeCheckbox.checked = next.zenMode);
  panelModeSelect && (panelModeSelect.value = next.panelMode);
  vimModeCheckbox && (vimModeCheckbox.checked = next.vimMode);
  lineWrappingCheckbox && (lineWrappingCheckbox.checked = next.lineWrapping);
  workerTimersCheckbox && (workerTimersCheckbox.checked = next.workerTimers2);
  lineNumbersCheckbox && (lineNumbersCheckbox.checked = next.lineNumbers);
  strudelAutocompleteCheckbox && (strudelAutocompleteCheckbox.checked = next.strudelAutocomplete);
  closeBracketsCheckbox && (closeBracketsCheckbox.checked = next.closeBrackets);
  trackRemoteCursorsCheckbox && (trackRemoteCursorsCheckbox.checked = next.trackRemoteCursors2);
  usernameInput && (usernameInput.value = next.username);
  userHueRange && (userHueRange.value = next.userHue);
  strudelCheckbox && (strudelCheckbox.checked = next.strudelEnabled);
  hydraCheckbox && (hydraCheckbox.checked = next.hydraEnabled);
  shaderCheckbox && (shaderCheckbox.checked = next.shaderEnabled);
  kabelsalatCheckbox && (kabelsalatCheckbox.checked = next.kabelsalatEnabled);
  welcomeMessageCheckbox && (welcomeMessageCheckbox.checked = next.welcomeMessage3);
  pastingModeCheckbox && (pastingModeCheckbox.checked = next.pastingMode);
  fontFamilySelect && (fontFamilySelect.value = next.fontFamily);
  strudelHighlightsEnabledCheckbox && (strudelHighlightsEnabledCheckbox.checked = next.strudelHighlightsEnabled);
  customRoomDisabledRadio && (customRoomDisabledRadio.checked = !next.customRoomEnabled);
  customRoomEnabledRadio && (customRoomEnabledRadio.checked = next.customRoomEnabled);
  customRoomNameInput && (customRoomNameInput.value = next.customRoomName);

  if (isSettingChanged('customRoomEnabled', diff)) {
    customRoomNameInput?.toggleAttribute('disabled', !next.customRoomEnabled);
  }

  if (
    isSettingChanged('customRoomEnabled', diff) ||
    (next.customRoomEnabled && isSettingChanged('customRoomName', diff))
  ) {
    refreshSession();
  }

  const session = getSession();

  if (isSettingChanged('username', diff)) {
    session.user = next.username.trim() || 'anonymous nudelfan';
  }

  if (isSettingChanged('username', diff) || isSettingChanged('userHue', diff)) {
    session.userColor = { color: getColorFromUserHue(next.userHue), light: `hsla(${next.userHue}, 100%, 75%, 0.1875)` };
    usernamePreview?.style.setProperty('background-color', session.userColor.color);
    usernamePreview && (usernamePreview.textContent = session.user);
  }

  if (isSettingChanged('strudelEnabled', diff)) {
    if (next.strudelEnabled) {
      !Frame.strudel && addFrame('strudel');
    } else {
      removeFrame('strudel');
      clearStrudelHighlights();
    }
  }

  // Clear all active strudel highlights if the setting is turned off
  if (isSettingChanged('strudelHighlightsEnabled', diff)) {
    if (next.strudelHighlightsEnabled) {
      window.strudel?.framer?.start();
    } else {
      clearStrudelHighlights();
      window.strudel?.framer?.stop();
    }
  }

  if (isSettingChanged('hydraEnabled', diff)) {
    if (next.hydraEnabled) {
      !Frame.hydra && addFrame('hydra');
    } else {
      removeFrame('hydra');
    }
  }

  if (isSettingChanged('shaderEnabled', diff)) {
    if (next.shaderEnabled) {
      !Frame.shader && addFrame('shader');
    } else {
      removeFrame('shader');
    }
  }

  if (isSettingChanged('kabelsalatEnabled', diff)) {
    if (next.kabelsalatEnabled) {
      !Frame.kabesalat && addFrame('kabelsalat');
    } else {
      Frame.shader?.remove();
      Frame.shader = null;
    }
  }

  if (isSettingChanged('zenMode', diff)) {
    if (next.zenMode) {
      document.body.classList.add('zen-mode');
    } else {
      document.body.classList.remove('zen-mode');
    }
  }

  if (isSettingChanged('panelMode', diff)) {
    document.body.classList.remove('scroll-mode', 'boxed-mode', 'tabbed-mode');
    switch (next.panelMode) {
      case 'scroll': {
        document.body.classList.add('scroll-mode');
        break;
      }
      case 'boxed': {
        document.body.classList.add('boxed-mode');
        break;
      }
      case 'tabbed': {
        document.body.classList.add('tabbed-mode');
        break;
      }
    }
  }

  if (isSettingChanged('fontFamily', diff)) {
    document.documentElement.style.cssText = `--font-family: ${next.fontFamily}`;
  }

  pastamirror.updateExtensions(diff);
  appliedSettings = { ...next };

  // console.log('APPLIED SETTINGS', getSettings());
}

//=========//
// INNARDS //
//=========//
// You don't need to mess with these innards if you're [just] add/removing/changing settings.
// But go ahead if you want to of course!

const settingsButton = document.querySelector('#settings-button');
const settingsDialog = document.querySelector('#settings-dialog');
const doneButton = document.querySelector('#settings-done-button');
settingsButton?.addEventListener('click', () => {
  settingsDialog?.showModal();
  doneButton?.focus();
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
resetButton?.addEventListener('click', async () => {
  const response = await nudelConfirm('Are you sure you want to reset your settings?');
  if (response) setSettings(defaultSettings);
});

function getRandomUserHue() {
  return Math.floor(Math.random() * 360);
}

export function getColorFromUserHue(hue) {
  return `hsl(${hue}, 100%, 75%)`;
}
