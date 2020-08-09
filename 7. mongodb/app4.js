var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');
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
    mongoose.connect(databaseUrl, { useNewUrlParser: true });
    database = mongoose.connection;

    database.on('open', function(){
        console.log('데이터베이스 연결 : ' + databaseUrl);

        // 스키마에 인덱스 설정
        UserSchema = mongoose.Schema({
            id : {type : String, required : true, unique : true},
            password : {tyep : String},
            name : {type : String, index : 'hashed'},
            age : {type : Number, 'default' : -1},
            created_at : {type : Date, index : {unique : false}, 'default' : Date.now()},
            updated_at : {type : Date, index : {unique : false}, 'default' : Date.now()}
        });
        console.log('UserSchema 정의');

        // 스키마에 함수 등록 -> model 객체에서 사용 가능
        UserSchema.static('findById', function(id, callback){
            return this.find({
                id : id
            }, callback);
        });

        /* 속성으로도 등록해줄 수 있다.
        UserSchema.statics.findById = function(id, callback){
            return this.find({
                id : id
            }, callback);
        };
        */

        // 스키마에 함수 등록 -> model 객체에서 사용 가능
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
app.use('/public', serveStatic(path.join(__dirname, 'public')));

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

router.route('/process/listuser').post(function(req, res){
    console.log('/process/listuser 라우팅 함수 호출');

    if(database){
        UserModel.findAll(function(err, results){
            if(err){
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>에러 발생</h1>');
                res.end();
                return;
            }

            if(results){
                console.dir(results);

                res.writeHead(200, {"Content-Type" : "text/html;charset=utf8"});
                res.write("<h3>사용자 리스트</h3>");
                res.write("<div><ul>");

                for(var i=0 ; i < results.length ; i++){
                   var curId = results[i]._doc.id;
                   var curName = results[i]._doc.name;
                   res.write("     <li>#" + i + " -> " + curId + ", " + curName + "</li>");
                }

                res.write("</ul></div>");
                res.end();
            }else{
                console.log('에러발생');
                res.writeHead(200, {"Content-Type":"text/html;charset=urt8"});
                res.write('<h1>조회된 사용자 없음</h1>');
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
            if(results[0]._doc.password === password){
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

    connectDB();
});
