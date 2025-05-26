import { Session } from '@flok-editor/session';
import { getRandomName } from './random.js';
import { base64ToUnicode, unicodeToBase64 } from '@strudel/core';

export function showSongText() {
  const footer = document.querySelector('#global-footer');
  if (footer) {
    console.log('showSongText');
    footer.insertAdjacentHTML(
      'beforeend',
      '<h3>✅ You are viewing a song! ✅ go <a href="/">back to jamming</a>?</h3>',
    );
  }
}

export function createNewRoomFromSongData(songData) {
  const roomName = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const session = new Session(roomName, {
    hostname: 'flok.cc',
    isSecure: true,
  });
  console.log(songData);

  session.on('sync', () => {
    session.setActiveDocuments(
      songData.map(({ type }, index) => ({
        id: index + 1,
        target: type,
      })),
    );
    songData.forEach(({ type, content }, index) => {
      session.setTextString(index + 1, content);
    });

    setTimeout(() => {
      window.location.href = `/?song=${roomName}`;
    }, 10);
  });

  session.initialize();
}

export async function createShortNameFromSongData(songData) {
  const songDataStr = encodeURIComponent(unicodeToBase64(JSON.stringify(songData)));
  const name = getRandomName(5);
  await fetch(`https://reckter--261b47a8f2ef11efa511569c3dd06744.web.val.run`, {
    method: 'POST',
    body: JSON.stringify({
      data: songDataStr,
      name: name,
    }),
  });
  return name;
}

export async function getSongDataFromShortName(shortName) {
  const response = await fetch(`https://reckter--a0e3631a011a11f09539569c3dd06744.web.val.run/${shortName}`);
  const body = await response.json();
  return JSON.parse(base64ToUnicode(decodeURIComponent(body.data)));
}
