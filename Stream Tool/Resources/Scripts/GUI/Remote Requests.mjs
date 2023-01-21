import { displayNotif } from "./Notifications.mjs";
import { updateGUI } from "./Remote Update.mjs";
import { writeScoreboard } from "./Write Scoreboard.mjs";

let webSocket;
const updateButtText = document.getElementsByClassName("botText")[0];
const updateRegion = document.getElementById('updateRegion');

export function startWebsocket() {
    
    updateButtText.textContent = "RECONNECTING";
	// we need to connect to the websocket server
	webSocket = new WebSocket("ws://"+window.location.hostname+":8080?id=remoteGUI");
	webSocket.onopen = () => { // if it connects successfully
        
        // everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			getData(JSON.parse(event.data));
		}

        // request current data to the GUI
        sendRemoteData(JSON.stringify({id: "RemoteRequestData"}));

	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {
        displayNotif("Connection error, please reconnect.")
        updateButtText.textContent = "RECONNECT";
        updateRegion.removeEventListener("click", () => {writeScoreboard()})
        updateRegion.addEventListener("click", () => {startWebsocket()})
        
    }
	// if connection fails for any reason
	webSocket.onerror = () => {
        displayNotif("Connection error, please reconnect.")
        updateButtText.textContent = "RECONNECT";
        updateRegion.removeEventListener("click", () => {writeScoreboard()})
        updateRegion.addEventListener("click", () => {startWebsocket()})
    }

}

async function getData(data) {
    if (data.gamemode) { // demand a GUI update
        await updateGUI(data);
        updateButtText.innerHTML = "UPDATE";
        updateRegion.addEventListener("click", () => {writeScoreboard()})
    }
}

export function sendRemoteData(data) {
    webSocket.send(data);
}