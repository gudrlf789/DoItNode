var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookiParser = require('cookie-parser');
var expressSession = require('express-session');

var expressErrorHandler = require('express-error-handler');

var user = require('./routes/user');

var config = require('./config');

var database_loader = require('./database/database_loader');
var route_loader = require('./routes/route_loader');

// 암호화 모듈
var crypto = require('crypto');

//=== Passport 사용 =====//
var Passport = require('passport');
var flash = require('connect-flash');
const passport = require('passport');

var app = express();

app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
app.set('view engine', 'pug');

console.log('config 서버 포트 :' + config.server_port);
app.set('port', config.server_port || 3000);

app.use('/public', static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookiParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

//====== Passport 초기화 ======//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// 라우팅 함수 초기화
route_loader.init(app, express.Router());

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/404.html'
    }
})