const fs = require('fs');

module.exports = (io) => {

    let nickNames = [];
    let socketsUsers = new Map();

    io.on('connection', socket => {
        console.log('New socket conected');

        socket.on('new image', (file, callback) => {
            console.log(file);

            io.sockets.emit('new image message', {
                msg: file,
                nick: socket.nickname
            });
            fs.writeFile("images/img", file, (err) => {
                callback({ message: err ? "failure" : "success" });
            });
        });

        socket.on('send message', (data) => {
            io.sockets.emit('new message', {
                msg: data,
                nick: socket.nickname
            });
        });

        socket.on('private message', (data) => {
            console.log(data);
            let str = data;
            let res = str.split(" ");

            const user = res[0].slice(1);

            if (nickNames.indexOf(user) != -1) {

                const socketid = socketsUsers.get(user).id;

                const space = data.indexOf(" ");

                if (space !== -1) {
                    data = data.substring(space + 1);
                }

                io.to(socketid).emit('new message', {
                    msg: `Priv: ${data}`,
                    nick: socket.nickname
                });

                io.to(socket.id).emit('new message', {
                    msg: `Priv[${user}]: ${data}`,
                    nick: socket.nickname
                });
            }
        });

        socket.on('new user', (data, callback) => {

            if (nickNames.indexOf(data) != -1) {
                callback(false);
            } else {
                callback(true);
                socket.nickname = data;
                console.log(`New user ${socket.nickname}`)
                nickNames.push(socket.nickname);
                socketsUsers.set(data, socket);
                updateUsers();
            }
        });

        socket.on('disconnect', data => {
            if (!socket.nickname) {
                return;
            } else {
                nickNames.splice(nickNames.indexOf(socket.nickname), 1);
                updateUsers();
            }
        });

        function updateUsers() {
            io.sockets.emit('usernames', nickNames);
        }

    });
}