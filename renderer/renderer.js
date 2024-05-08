const inputMessage = document.getElementById("inputMessage");
const sendButton = document.getElementById("sendButton");

function sendMessage() {
    let message = inputMessage.value;
   // if (message === "") return;

    console.log(message);

    ipcRenderer.send('messageSend', {
        message
    });
}

sendButton.addEventListener('click', sendMessage);