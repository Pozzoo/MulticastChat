const saveButton = document.getElementById('saveButton');
const inputPort = document.getElementById('inputPort');
const inputUsername = document.getElementById('inputUsername');

saveButton.addEventListener('click', saveOptions);

function saveOptions() {
    if (inputPort.value < 0 || inputPort.value > 65536 || inputPort.value == "") return;
    if (inputUsername.value == null || inputUsername.value == "") return;

    let username = inputUsername.value;
    let port = inputPort.value;

    ipcRenderer.send('saveOptions', {
        username,
        port
    });
}