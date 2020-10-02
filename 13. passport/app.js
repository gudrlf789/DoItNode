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

//====== Passport Strategy 설정 =====//
var LocalStrategy = require('passport-local').Strategy;

passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done){
    console.log('passport의 local-login 호출됨 : ' + email + ', ' + password);

    var database = app.get('database');
    database.UserModel.findOne({'email' : email}, function(err, user){
        if(err){
            console.log('에러 발생함.');0
            return done(err);
        }

        if(!user){
            console.log('사용자 아이디가 일치하지 않습니다.');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        }

        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);

        if(!authenticated){
            console.log('비밀번호가 일치하지 않습니다.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }

        console.log('아이디와 비밀번호가 일치합니다.');
        return done(null, user);
    });
}));

passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done){
    var paramName = req.body.name || req.query.name;
    console.log('passport의 loca-signup 호출됨 : ' + email + password);

    var database = app.get('database');
    database.UserModel.findOne({'email' : email}, function(err, user){
        if(err){
            console.log('에러 발생');
            return done(err);
        }

        if(user){
            console.log('기존에 계정이 있습니다.');
            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
        }else{
            var user = new database.UserModel({'email' : email, 'password' : password, 'name' : paramName});
            user.save(function(err){
                if(err){
                    console.log('데이터베이스에 저장 시 에러');
                    return done(null, false, req.flash('signupMessage', '사용자 정보 저장 시 에러가 발생했습니다.'));
                }

                console.log('사용자 데이터 저장함');
                return done(null, user);
            });
        }
    });
}));

// 사용자 인증을 처음에 성공한 경우
passport.serializeUser(function(user, done){
    console.log('serializeUser 호출됨.');
    console.dir(user);

    done(null, user);
});

// 요청들에 대한 확인 작업시
passport.deserializeUser(function(user, done){
    console.log('deserializeUser 호출됨');
    console.dir(user);

    done(null, user);
});



// 라우팅 함수 초기화
route_loader.init(app, express.Router());

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/404.html'
    }
});