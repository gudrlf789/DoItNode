var express = require('express');
var http = require('http');

// express를 함수로 실행
var app = express();

// 포트 설정
// process.env -> 환경변수
app.set('port', process.env.PORT || 3000);

// user()를 사용해서 미들웨어 등록
// 클라이언트의 요청을 받아서 처리
app.use(function(req, res, next){
    console.log('첫번째 미들웨어 호출');

    req.user = 'mike';

    /* 요청 파라미터 확인 방법
    1. GET 방식 : req 객체의 query 속성을 사용하여 가져온다. (ex: req.query.파라미터 이름)
    2. POST 방식 : body-parser 와 같은 외장 모듈을 사용한다.
    */

    // 현 미들웨어 종료 다음 미들웨어 호출
    next();

});

app.use('/', function(req, res, next){
    console.log('두번째 미들웨어 호출');

    // res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    // res.end('<h1>서버에서 응답한 결과 : ' + req.user + '</h1>');

    // send를 사용하면 자바스크립트 객체도 보낼수 있다.
    var person = {
        name : 'phg',
        age : 29
    };

    var personJSON = JSON.stringify(person);
    // res.send(person);
    // res.send('<h1>서버에서 응답한 결과 : ' + req.user + '</h1>');

    // redirect 사용
    res.redirect('https://www.naver.com/');
});

// express를 사용해서 서버 생성
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});