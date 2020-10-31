var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');


var crypto = require('crypto');

var passport = require('passport');
var flash = require('connect-flash');

//===== socket.io 사용 ==========//
var socketio = require('socket.io');
var cors = require('cors');
//===============================//

var app = express();

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
//app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));


//===== cors 초기화 =====//
app.use(cors());

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("익스프레스로 웹서버 실행");
});


//====== socket.io 서버 시작 (웹서버 위에서 웹소켓으로 요청온것을 받아서 처리한다.)=======//
var io = socketio.listen(server);
console.log('socket.io 요청을 받아들일 준비완료');

// 로그인 아이디와 소켓아이디를 매칭
var login_ids = {};

io.sockets.on('connection', function(socket){
    console.log('connection info -> ' + JSON.stringify(socket.request.connection._peername));

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    socket.on('login', function(input){
        console.log('login 받음 -> ' + JSON.stringify(input));

        login_ids[input.id] = socket.id;
        socket.login_id = input.id;

        sendResponse(socket, 'login', 200, 'OK');
    });

    socket.on('message', function(message){
        console.log('message 받음 -> ' + JSON.stringify(message));
        
        if(message.recepient == 'ALL'){
            console.log('모든 클라이언트에게 메시지 전송하기');
            
            // io.sockets -> 연결된 모든 소켓을 의미한다.
            io.sockets.emit('message', message);
        }else {
            if(message.command == 'chat'){
                if(login_ids[message.recepient]){
                    io.socket.connected[login_ids[message.recepient]].emit('message', message);
    
                    sendResponse(socket, 'message', 200, 'OK');
                }else{
                    sendResponse(socket, 'message', 400, '수신자 ID를 찾을 수 없습니다.');
                }
            }else if(message.command == 'groupchat'){
                //같은 방에 있는 사람들한테 메세지를 보낸다.
                io.sockets.in(message.recepient).emit('message', message);

                sendResponse(socket, 'message', 200, 'OK');
            }
        }
    });

    socket.on('room', function(input){
        console.log('room 받음 -> ' + JSON.stringify(input));

        if(input.command == 'create'){
            //방에 대한 정보 관리 (io.socket.adapter.rooms)
            if(io.sockets.adapter.rooms[input.roomId]){
                console.log('이미 방이 만들어져 있습니다.');
            }else{
                console.log('새로 방을 만듭니다.');
                
                //새로운 방을 생성
                socket.join(input.roomId);
                
                var curRoom = io.sockets.adapter.rooms[input.roomId];
                curRoom.id = input.roomId;
                curRoom.name = input.roomName;
                curRoom.owner = input.roomOwner;
            }
            
            sendRoomList();
        }else if(input.command == 'update'){    
            var curRoom = io.sockets.adapter.rooms[input.roomId];

            curRoom.name = input.roomName;
            curRoom.owner = input.roomOwner;

            sendRoomList();
        }else if(input.command == 'delete'){
            // 방에서 빠져 나온다.
            socket.leave(input.roomId);

            if(io.sockets.adapter.rooms[input.roomId]){
                delete io.sockets.adapter.rooms[input.roomId];
            }else{
                console.log('방이 만들어져 있지 않습니다.');
            }
            
            sendRoomList();
        }else if(input.command == 'join'){
            socket.join(input.roomId);
            
            sendResponse(socket, 'room', 200, 'OK');
        }else if(input.command == 'leave'){
            socket.leave(input.roomId);

            sendResponse(socket, 'room', 200, 'OK');
        }
        
    });
});

function sendRoomList(){
    var roomList = getRoomList();
    var output = {
        command : 'list',
        rooms : roomList
    };

    // 방이 새로 만들어지면 모든 사용자한테 이벤트를 보낸다.
    io.sockets.emit('room', output);
}

function getRoomList(){
    console.log('getRoomList 호출');
    console.log('ROOMS -> ' + JSON.stringify(io.sockets.adapter.roomList));

    var rooms = [];

    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId){
        console.log('현재 방 ID : ' + roomId);
        var curRoom = io.sockets.adapter.rooms[roomId];

        var found = false;
        Object.keys(curRoom.sockets).forEach(function(key){
            if(roomId == key){
                found = true;
            }
        });

        if(!found){
            rooms.push(curRoom);
        }
    });

    return rooms;
}

function sendResponse(socket, command, code, message){
    var output = {
        command : command,
        code : code,
        message : message
    };
    socket.emit('response', output);
}