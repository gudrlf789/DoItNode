var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//express-session 외장모듈 사용하기
var expressSession = require('express-session');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());

app.use(cookieParser());
//미들웨어에 등록
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitiallized : true
}));

var router = express.Router();

router.route('/process/product').get(function(req, res){
    console.log('/process/product 라우팅 함수');

    if(req.session.user){
        res.redirect('/product.html');
    }else{
        res.redirect('/login2.html');
    }
});

router.route('/process/login').post(function(req, res){
    console.log('/process/login 라우팅 함수');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if(req.session.user){
        console.log('이미 로그인되어 있습니다.');

        res.redirect('/product.html');
    }else{
        //세션 설정
        req.session.user = {
             id : paramId,
             name : '형길',
             authorized : true
        }

        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>로그인 성공</h1>');
        res.write('<p>Id : '+ paramId + '</p>');
        res.write('<br><br><a href="/process/product">상품 페이지로 이동</a>');
        res.end();
    }
});

router.route('/process/logout').get(function(req, res){
    console.log('/process/logout 라우팅 함수');

    if(req.session.user){
        console.log('로그아웃');

        //세션 정보 삭제
        req.session.destroy(function(err){
            if(err){
                console.log('세션 삭제 시 에러 발생');
                return;
            }

            console.log('세션 삭제 성공');
            res.redirect('/login2.html');
        });
    }else{
        console.log('로그인 되어 있지 않습니다.');
        res.redirect('/login2.html');
    }
});

app.use('/', router);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});