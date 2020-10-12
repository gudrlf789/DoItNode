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


io.sockets.on('connection', function(socket){
    console.log('connection info -> ' + JSON.stringify(socket.request.connection._peername));

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
});