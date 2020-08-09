var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

// mongoose 모듈 사용
var mongoose = require('mongoose');

var database;
var UserSchema;
var UserModel;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/local';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    // 이벤트가 발생했을때 처리할 함수 설정
    database.on('open', function(){
        console.log('데이터베이스에 연결됨 :' + databaseUrl);

        // 스크마 생성
        UserSchema = mongoose.Schema({
            id : String,
            name : String,
            password : String
        });
        console.log('UserSchema 정의함');

        // user 란 이름의 실제 컬렉션과 연결
        UserModel = mongoose.model('users', UserSchema);
        console.log('UserModel 정의함');
    });

    database.on('disconnected', function(){
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error',console.error.bind(console, 'mongoose 연결 에러'));
}

var app = express();

app.set('port', process.env.PORT || 3000);
app.use('/public', static(path.join(__dirname, 'publid')));

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

var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port', function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));

    connectDB();
}));