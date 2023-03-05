$(function methods() {
    let nick = '';
    const socket = io();

    const messageForm = $('#messages-form');
    const messageBox = $('#message');
    const chat = $('#chat');

    const imageForm = $('#images-form');
    const imageBox = $('#image-box');
    const nickForm = $('#nick-form');
    const nickError = $('#nick-error');
    const nickName = $('#nick-name');

    const userNames = $('#usernames');

    messageForm.submit(e => {
        e.preventDefault();
        if (messageBox.val().includes('/')) {
            console.log(true);
            socket.emit('private message', messageBox.val());
            messageBox.val('');
        }

        if (messageBox.val() !== '') {
            socket.emit('send message', messageBox.val());
            messageBox.val('');
        }
    });

    imageForm.submit(e => {
        e.preventDefault();
        console.log(imageBox);
        socket.emit('new image', imageBox[0].files[0], (status) => {
            console.log(status);
        });
    });

    socket.on('new message', function (data) {
        let color = '#f5f4f4';
        let side = 'start';
        if (nick == data.nick) {
            color = '#9ff4c5';
            side = 'end';
        }

        chat.append(`
        <div class="w-100 d-flex justify-content-${side}">
        <div class="w-50">
        <div class="msg-area mb-2" style="background-color:${color}">
            <p class="msg"><b>${data.nick} :</b> ${data.msg}</p>
        </div>
        </div>
        </div>
        `);
    });

    socket.on('new image message', function (data) {
        let color = '#f5f4f4';
        let side = 'start';
        if (nick == data.nick) {
            color = '#9ff4c5';
            side = 'end';
        }
        console.log(data.nick);

        const arrayBufferView = new Uint8Array(data.msg);
        const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blob);

        chat.append(`
        <div class="w-100 d-flex justify-content-${side}">
        <div class="w-50">
        <div class="msg-area mb-2 d-flex flex-column" style="background-color:${color}">
            <p class="msg"><b>${data.nick} :</b></p><img src="${imageUrl}">
        </div>
        </div>
        </div>
        `);
    });


    nickForm.submit(e => {
        e.preventDefault();
        if (nickName.val() !== '') {
            console.log('Sending...');
            socket.emit('new user', nickName.val(), data => {
                if (data) {
                    nick = nickName.val();
                    $('#nick-wrap').hide();
                    $('#content-wrap').show();
                } else {
                    nickError.html(`
                    <div class="alert alert-danger">
                    User already exists
                    </div>
                    `);
                }
                nickName.val('');
            });
        }
    });

    socket.on('usernames', data => {
        let html = '';
        let color = '#000';
        let goOut = '';
        console.log(nick);
        for (let i = 0; i < data.length; i++) {
            if (nick == data[i]) {
                color = '#027f43';
                goOut = `<a class="link-go-out" href="/"><i class="fas fa-sign-out-alt go-out"></i></a>`;
            } else {
                color = '#000';
                goOut = '';
            }
            html += `<p style="color:${color}"><i class="fas fa-user"></i> ${data[i]} ${goOut}</p>`;
        }
        userNames.html(html);
    });
});