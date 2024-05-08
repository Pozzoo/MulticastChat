const inputMessage = document.getElementById("inputMessage");
const sendButton = document.getElementById("sendButton");

const chatList = document.getElementById('chat');

let username = 'user';

class Message {
    constructor(date, time, username, message) {
        this.date = date;
        this.time = time;
        this.username = username;
        this.message = message;
    }
}

ipcRenderer.on('usernameChange', (event, options) => {
    username = event;
})

function sendMessage() {
    let message = inputMessage.value;
   if (message === "") return;

    ipcRenderer.send('sendMessage', {
        message
    });

    inputMessage.value = "";
}

sendButton.addEventListener('click', sendMessage);

ipcRenderer.on('messageRecieved', (event, options) => {
    let parsedJson = JSON.parse(event);

    let message = new Message(parsedJson.date, parsedJson.time, parsedJson.username, parsedJson.message);

    console.log(message);
    handleMessageRecieved(message);
    
});

function handleMessageRecieved(message) {
    let timeFields = message.time.split(':');
    let minutes;

    if (timeFields[1].length === 1) {
        minutes = '0' + timeFields[1];
    } else {
        minutes = timeFields[1];
    }

    var isOurs = message.username === username;
    console.log(username)
    console.log(message.username)

    const chatMessage = document.createElement('li');
    chatMessage.setAttribute('class', 'chatMessage');

    const directionDiv = document.createElement('div');
    directionDiv.setAttribute('class', isOurs ? 'outgoing' : 'incoming');

    const usernameText = document.createElement('p');
    usernameText.setAttribute('class', 'username');
    usernameText.innerText = message.username;

    const messageText = document.createElement('p');
    messageText.innerText = message.message;

    const timeText = document.createElement('p');
    timeText.setAttribute('class', 'time');
    timeText.innerText = timeFields[0] + ':' + minutes;

    directionDiv.appendChild(usernameText);
    directionDiv.appendChild(messageText);
    directionDiv.appendChild(timeText);

    chatMessage.appendChild(directionDiv);

    chatList.appendChild(chatMessage);
}