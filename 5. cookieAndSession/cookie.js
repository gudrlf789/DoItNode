var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
//cookie-parser 외부 모듈 사용
var cookieParser = require('cookie-parser');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());
//미들웨어로 등록
app.use(cookieParser());

var router = express.Router();

router.route('/process/setUserCookie').get(function(req, res){
    console.log('/process/setUserCookie 라우팅 함수 호출');

    //쿠키 생성
    res.cookie('user', {
        id : 'phg',
        name : '형길',
        authorized : true
    });

    res.redirect('/process/showCookie');
});

router.route('/process/showCookie').get(function(req, res){
    console.log('/process/showCookie 라우팅 함수 호출');

    //응답객체 안에 쿠키라는 메소드를 제공해준다
    res.send(req.cookies);
});

app.use('/', router);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});