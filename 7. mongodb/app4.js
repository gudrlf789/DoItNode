var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

var mongoose = require('mongoose');

var database;
var UserSchema;
var UserModel;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/phg';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('open', function(){
        console.log('데이터베이스 연결 : ' + databaseUrl);

        // 스키마에 인덱스 설정
        UserSchema = mongoose.Schema({
            id : {type : String, required : true, unique : true},
            password : {tyep : String, required : true},
            name : {type : String, index : 'hashed'},
            age : {type : Number, 'default' : -1},
            created_at : {type : Date, index : {unique : false}, 'default' : Date.now()},
            updated_at : {type : Date, index : {unique : false}, 'default' : Date.now()}
        });
        console.log('UserSchema 정의');

        // 함수 등록 -> model 객체에서 사용 가능
        UserSchema.static('findById', function(id, callback){
            return this.find({
                id : id
            }, callback);
        });

        UserSchema.static('findAll', function(callback){
            this.find({}, callback);
        });

        UserModel = mongoose.model('usersIndex', UserSchema);
        console.log('UserModel 정의');
    });

    database.on('disconnected', function(){
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, 'mongoose 연결 에러'));
};

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(static('/public', path.join(__dirname, 'public')));

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

app.use('/', router);

var authUser = function(db , id, password, callback){
    UserModel.find({
        "id" : id,
        "password" : password
    }, function(err, docs){
        if(err){
            callback(err, null);
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

    connectDB();
});
