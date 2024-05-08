const path = require('path');
const dgram = require("dgram");
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

var host = "224.0.0.114";
var port = 5700;

class Message {
    constructor(date, time, username, message) {
        this.date = date;
        this.time = time;
        this.username = username;
        this.message = message;
    }
}

app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    //Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })
});

const menu = [
    {
        label: 'Options',
        submenu: [
            {
                label: 'Change Port',
                click: () => exampleFunction, //TODO: Add real function
            },
            {
                label: 'Quit',
                click: () => app.quit,
            }
        ],
        
    }
]

ipcMain.on('messageSend', (event, options) => {
    let dateTime = getDateAndTime();

    let messageObject = new Message(dateTime.date, dateTime.time, "batata", options.message); //TODO: Make a username picker
    let messageJson = JSON.stringify(messageObject);

    broadcastMessage(messageJson);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit;
    }
});

function getDateAndTime() {
    let currentDate = new Date();

    let date = currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(); 

    return { date, time };
}

function exampleFunction() {

}

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Chat",
        width: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

const socket = dgram.createSocket("udp4");

socket.bind(port, () => {
    socket.addMembership(host);
});

socket.on('message', function(msg, rinfo) {
    console.log(" " + msg);
});

function broadcastMessage(message) {
    socket.send(message, port);
}