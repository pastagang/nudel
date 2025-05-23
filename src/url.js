import { changeSettings, getSettings } from './settings.js';

const params = Object.fromEntries(new URLSearchParams(location.search));

const { room } = params;
if (room !== undefined) {
  if (room === '') {
    changeSettings({ customRoomEnabled: false });
  } else {
    changeSettings({ customRoomEnabled: true, customRoomName: room });
  }
}
