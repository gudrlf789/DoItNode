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
            if(login_ids[message.recepient]){
                io.socket.connected[login_ids[message.recepient]].emit('message', message);

                sendResponse(socket, 'message', 200, 'OK');
            }else{
                sendResponse(socket, 'message', 400, '수신자 ID를 찾을 수 없습니다.');
            }
        }
    });
});

function sendResponse(socket, command, code, message){
    var output = {
        command : command,
        code : code,
        message : message
    };
    socket.emit('response', output);
}