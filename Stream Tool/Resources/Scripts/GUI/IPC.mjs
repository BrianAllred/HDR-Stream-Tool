import { updateGUI } from './Remote Update.mjs';
import { writeScoreboard } from './Write Scoreboard.mjs';

const ipc = require('electron').ipcRenderer;

// ipc is the communication bridge between us and nodejs
// we can send signals to do node exclusive stuff,
// and recieve messages from it with data

// node code is the only thing thats embbeded on the executable
// meaning that to see it or modify it, you will need to
// be able to build this project yourself... check the repo's wiki!


// we will store data to send to the browsers here
let gameData;
let bracketData;


// when a new browser connects
ipc.on('requestData', () => {

    // send the current (not updated) data
    sendGameData();
    sendBracketData();

})

/** Sends current game data object to websocket clients */
export function sendGameData() {
    ipc.send('sendData', gameData);
}
export function updateGameData(data) {
    gameData = data;
}
/** Sends current bracket object to websocket clients */
export function sendBracketData() {
    ipc.send('sendData', bracketData);
}
export function updateBracketData(data) {
    bracketData = data;
}

/** Sends current data to remote GUIs */
export function sendRemoteData() {
    ipc.send("sendData", JSON.stringify(remoteID(gameData), null, 2));
    ipc.send("sendData", JSON.stringify(remoteID(bracketData), null, 2));
}
/**
 * Changes the ID of an object so a Remote GUI can receive it
 * @param {Object} data - Data that will change its ID
 * @returns Data with changed ID
 */
function remoteID(data) {
    const newData = JSON.parse(data);
    newData.id = "remoteGUI";
    return newData;
}

/**
 * Sends the signal to Electron to keep the window
 * on top of others (or not) at all times
 * @param {Boolean} value - Verdadero o Falso
 */
export function alwaysOnTop(value) {
    ipc.send('alwaysOnTop', value);
}

// when we get data remotely, update GUI
ipc.on('remoteGuiData', async (event, data) => {

    // parse that json so we send an object we can read
    await updateGUI(JSON.parse(data));
    writeScoreboard();

});
