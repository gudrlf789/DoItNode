var express = require('expres');
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

        UserSchema = mongoose.Schema({
            id : {type : String, required : true, unique : true, 'default' : ''},
            hashed_password : {type : String, required : true, 'default' : ''},
            salt : {type : String, required : true},
            name : {type : String, index : 'hashed', 'default' : ''},
            age : {type : Number, 'default' : -1},
            created_at : {type : Date, index : {unique : false}, 'default' : Date.now()},
            updated_at : {type : Date, index : {unique : false}, 'default' : Date.now()}
        });
        console.log('UserSchema 정의');

        // 가상 속성 설정
        UserSchema.virtual('password')
            .set(function(password){
                this.salt = this.makeSalt();
                this.hashed_password = this.encryptPassword(password);
                console.log('virtual password 저장됨');
            });

        UserSchema.method('encryptPassword', function(plainText, inSalt){
            if(inSalt){
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            }else{
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hext');
            }
        });

        UserSchema.method('makeSalt', function(){
            return Math.round((new Date().valueOf() * Math.random())) + '';
        });

        UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
            if(inSalt){
                console.log('authenticate 호출');
                return this.encryptPassword(plainText, inSalt) === hashed_password;
            }else{
                console.log('authenticate 호출');
                return this.encryptPassword(plainText) === hashed_password;
            }
        });

        UserModel = mongoose.model('cryptUsers', UserSchema);
    });

    database.on('disconnected', function(){
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, 'mongoose 연결 에러'));
};

var app = express();

app.set('port', process.env.PORT || 3000);