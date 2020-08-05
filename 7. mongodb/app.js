var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

// mongodb 모듈 사용
var MongoClient = require('mongodb').MongoClient;

var database;

// 데이터베이스 연결하기
function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/phg';

    MongoClient.connect(databaseUrl, function(err, db){
        if(err){
            console.log('데이터베이스 연결 시 에러 발생');
            return;
        }

        console.log('데이터베이스에 연결');
        database = db;
    });
}

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('/public', static(path.join(__dirname, 'public')));

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

router.route('/process/login').post(function(req, res){
    console.log('/process/login 라우팅 함수 호출됨');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    // 데이터 베이스가 연결된 경우
    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err){
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>에러 발생</h1>');
                res.end();
                return;
            }

            if(docs){
                console.dir(docs);

                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>사용자 로그인 성공</h1>');
                res.write('<div><p>사용자 :'  + docs[0].name + '</p></div>');
                res.write('<br><br><a href="/public/login.html">다시 로그인하기</a>');
                res.end();
            }else{
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>사용자 데이터가 없음</h1>');
                res.end();
            }
        });
    }
    // 데이터 베이스가 연결 되지 않은 경우
    else{
        console.log('에러발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
        res.write('<h1>데이터베이스 연결 안됨</h1>');
        res.end();
    }
});

app.use('/', router);

// db 라는 데이터베이스 객체를 받는다.
var authUser = function(db, id, password, callback){
    console.log('authUser 호출됨 :' + id + ',' + password);

    // users 라는 컬렉션을 참조할수 있다.
    var users = db.collection('users');

    users.find({
        "id" : id,
        "password" : password
    }).toArray(function(err, docs){
        // 에러가 발생한 경우
        if(err){
            callback(err,null);
            return;
        }

        if(docs.length > 0){
            console.log('일치하는 사용자를 찾음');
            callback(null, docs);
        }else{
            console.log('일치하는 사용자를 찾지 못함.');
            callback(null, null);
        }
    });
};

var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/login.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));

    connectDB();
});