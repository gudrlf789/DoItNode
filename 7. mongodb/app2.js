var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

var MongoClient = require('mongodb').MongoClient;

var database;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/phg';

    MongoClient.connect(databaseUrl, function(err, db){
        if(err){
            console.log('데이터베이스 연결 시 에러 발생');
            return;
        }

        console.log('데이터베이스에 연결');
        database = db.db('phg');
    })
};

var app = express();

app.set('port', process.env.PORT || 3000);
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

var addUser = function(db, id, password, name, callback){
    console.log('addUser 호출됨 :' + id + ', ' + password);

    var users = db.collection('users');

    users.insertMany([{
        "id" : id,
        "password" : password,
        "name" : name
    }], function(err,  result){
        if(err){
            callback(err, null);
            return;
        }

        if(result.insertedCount > 0){
            console.log('사용자 추가됨');
            callback(null, result);
        }else{
            console.log('추가된 데이터가 없음');
            callback(null, null);
        }
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

    connectDB();
});