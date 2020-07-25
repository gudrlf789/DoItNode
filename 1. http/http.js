var http = require('http');
var fs = require('fs'); //파일 시스템 모듈

var server = http.createServer();

var host = '192.168.0.11';
var port = 3000;

/*
첫번째 매개변수 : 포트 번호
두번째 매개변수 : 호스트
세번째 매개변수 : 백로그 (동시 접속 가능한 클라이언트의 수)
네번째 매개변수 : 콜백함수
*/

server.listen(port, host, 50000, function(){
    console.log('웹서버 실행 -> ' + host + ':' + port);
});

//서버 이벤트 발생(클라이언트가 접속할때 내부적으로 socket이 생성)
server.on('connection', function(socket){
    console.log('클라이언트 접속');
});

//클라이언트가 요청하는 경우
server.on('request', function(req, res){
    console.log('클라이어트 요청');

    var filename = '';
    //2. 이미지를 출력할때
    fs.readFile(filename, function(err, data){
        res.writeHead(200, {"Content-Type":"image/png"});
        res.write(data);
        res.end();
    });

    //헤더정보
    // 1.html 형태로 보낼때
    //res.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
    //res.write('<h1>웹서버로부터 받은 응답</h1>');
    //res.end();
});