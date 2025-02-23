import { nudelAlert } from './alert.js';
import { pastamirror } from './main.js';
import { nudelPrompt } from './prompt.js';
import { changeSettings, getSettings } from './settings.js';

const menuButton = document.querySelector('#menu-button');
const menuContainer = document.querySelector('#menu-container');

const aboutButton = document.querySelector('#about-button');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const playButton = document.querySelector('#about-yes-button');
const docsButton = document.querySelector("#docs-button");

const root = document.documentElement;

menuButton?.addEventListener('click', (e) => {
  menuContainer?.classList.toggle('open');
});

helpButton?.addEventListener('click', () => {
  nudelAlert('Coming soon');
});

let playButtonClicked = false;
playButton?.addEventListener('click', () => {
  if (playButton?.classList.contains('loading')) {
    playButtonClicked = true;
    return;
  }
  const runButtons = document.querySelectorAll('.run');
  runButtons.forEach((runButton) => runButton.click());
});

aboutButton?.addEventListener('click', () => {
  aboutDialog?.showModal();
  playButton?.focus();
});

docsButton?.addEventListener('click', () => {
  if (root?.classList.contains('sidebarOpen')) {
    root?.classList.remove('sidebarOpen');
  } else {
    root?.classList.add('sidebarOpen');
  }
})

const html = document.documentElement;

html.addEventListener('click', (e) => {
  if (e.target === html) {
    aboutDialog?.close();
  }
});

(async () => {
  if (!getSettings().username) {
    const username = await nudelPrompt('hello! what name do you want to go by?');
    changeSettings({ username });
    aboutDialog?.showModal();
    playButton?.focus();
  } else {
    if (getSettings().welcomeMessage3) {
      aboutDialog?.showModal();
      playButton?.focus();
    }
  }
})();

// This is to stop people running their old local code
// TODO: make this actually happen after the editors have been updated with the most recent content
setTimeout(() => {
  playButton?.classList.remove('loading');
  if (playButtonClicked) {
    setTimeout(() => {
      playButton?.click();
    }, 1000);
  }
}, 1000);
