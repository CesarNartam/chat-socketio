module.exports = (io) =>{

    let nickNames = [];

    io.on('connection', socket =>{
        console.log('Nuevo usuario conectado');

        //Mensajes enviados
        socket.on('enviar mensaje', (datos) =>{
            
            
            io.sockets.emit('nuevo mensaje', {
                msg: datos,
                nick: socket.nickname
            });
        });


        socket.on('nuevo usuario', (datos, callback) => {

            //Validación de nombre de usuario
            if(nickNames.indexOf(datos) != -1){
                callback(false);
            }else{
                
                callback(true);
                socket.nickname = datos;
                nickNames.push(socket.nickname);
                
                actualizarUsuarios();
            }
        });

        socket.on('disconnect', datos =>{
            //Desconexión de usuario
            if(!socket.nickname){
                return;
            }else{
                
                nickNames.splice(nickNames.indexOf(socket.nickname), 1);

                
                actualizarUsuarios();
            }
        });

        function actualizarUsuarios(){
            io.sockets.emit('usernames', nickNames);
        }

    });
}