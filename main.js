const path = require('path');
const dgram = require("dgram");
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const isDev = false;

var socket = dgram.createSocket("udp4");

var host = "224.0.0.114";
var port = 5700;

var username = 'user';

let mainWindow, optionsWindow;

class Message {
    constructor(date, time, username, message) {
        this.date = date;
        this.time = time;
        this.username = username;
        this.message = message;
    }
}

app.whenReady().then(() => {
    mainWindow = createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })

    bindSocket();

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    
});

const menu = [
    {
        label: 'Options',
        click: () => openOptionsMenu(),
    },
    {
        label: 'Quit',
        click: () => app.quit
    }
]

ipcMain.on('sendMessage', (event, options) => {
    let dateTime = getDateAndTime();

    let messageObject = new Message(dateTime.date, dateTime.time, username, options.message);
    let messageJson = JSON.stringify(messageObject);

    broadcastMessage(messageJson);
});

ipcMain.on('saveOptions', (event, options) => {
    socket.dropMembership(host);
    
    username = options.username;
    port = options.port;

    socket.close();

    socket = dgram.createSocket("udp4");
    bindSocket();

    optionsWindow.close();

    mainWindow.webContents.send('usernameChange', username);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit;
    }
});

function openOptionsMenu() {
    optionsWindow = new BrowserWindow({
        title: 'Options',
        width: isDev ? 800 : 400,
        height: 400,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (isDev) {
        optionsWindow.webContents.openDevTools();
    }

    optionsWindow.loadFile(path.join(__dirname, './renderer/options.html'))
}

function getDateAndTime() {
    let currentDate = new Date();

    let date = currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(); 

    return { date, time };
}

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Chat",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
    return mainWindow;
}

function bindSocket() {
    socket.bind(port, () => {
        socket.addMembership(host);
    });

    socket.on('message', function(msg, rinfo) {
        let unbuffered = " " + msg
        mainWindow.webContents.send('messageRecieved', unbuffered);
    });
}

function broadcastMessage(message) {
    socket.send(message, port);
}