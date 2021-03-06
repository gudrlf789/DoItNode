var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var expressErrorHandler = require('express-error-handler');
var mongoose = require('mongoose');

// 암호화 모듈
var crypto = require('crypto');

// 설정 파일 불러오기
var config = require('./config');
var database_loader = require('./database/database_loader');

var database;
var UserSchema;
var UserModel;

var app = express();

//app.set('port', process.env.PORT || 3000);
console.log('config.server_port -> ' + config.server_port);
// 설정 파일에 있는 포트 사용하기
app.set('port', config.server_port || 3000);

app.use('/public', static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));

var router = express.Router();

router.route('/process/adduser').post(function(req, res){
    console.log('/process/adduser 라우팅 함수 호출');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err){
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>에러 발생</h1>');
                res.end();
                return;
            }
            
            if(result){
                console.dir(result);

                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>사용자 추가 성공</h1>');
                res.write('<div><p>사용자 :'  + paramName + '</p></div>');
                res.end();
            }else{
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>사용자 추가 안됨</h1>');
                res.end();
            }
        });
    }else{
        console.log('에러발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
        res.write('<h1>데이터베이스 연결 안됨</h1>');
        res.end();
    }
});

app.use('/', router);

var authUser = function(db , id, password, callback){

    // static 으로 등록했던 findById 함수를 사용한다.
    UserModel.findById(id, function(err, results){
        if(err){
            callback(err, null);
            return;
        }

        console.log('아이디 %s로 검색됨.');
        if(results.length > 0){
            var user = new UserModel({id:id});
            // 암호화된 비밀번호 인증작업
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if(authenticated){
                console.log('비밀번호 일치');
                callback(null, results);
            }else{
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        }else{
            console.log('아이디 일치하는 사용자 없음');
            callback(null, null);
        }
    });
};

var addUser = function(db, id, password, name, callback){
    var user = new UserModel({
        "id" : id,
        "password" : password,
        "name" : name
    });

    user.save(function(err){
        if(err){
            callback(err, null);
            return;
        }

        console.log('사용자 데이터 추가');
        callback(null, user);
    });
};

var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));

    database_loader.init(app, config);
});
