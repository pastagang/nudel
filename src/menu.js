import { nudelAlert } from './alert.js';
import { pastamirror } from './main.js';
import { nudelPrompt } from './prompt.js';
import { changeSettings, getSettings } from './settings.js';

const menuButton = document.querySelector('#menu-button');
const menuContainer = document.querySelector('#menu-container');
// const menuContent = document.querySelector('#menu-content');

const aboutButton = document.querySelector('#about-button');
// const aboutDialogContainer = document.querySelector('#about-dialog-container');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const exportButton = document.querySelector('#export-button');
const copyAsFlokButton = document.querySelector('#copy-as-flok-button');
const yesButton = document.querySelector('#about-yes-button');

menuButton.addEventListener('click', (e) => {
  menuContainer.classList.toggle('open');
});

// menuContainer.addEventListener(
//   'blur',
//   (e) => {
//     console.log(e);
//     menuContainer.classList.remove('open');
//   },
//   { bubbles: true },
// );

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

if (!getSettings().username) {
  const username = await nudelPrompt('hello! what name do you want to go by?');
  changeSettings({ username });
  aboutDialog.showModal();
  yesButton.focus();
} else {
  if (getSettings().welcomeMessage3) {
    aboutDialog.showModal();
    yesButton.focus();
  }
}

// settingsDialog.showModal();
