var mongoose = require('mongoose');

var database;
var UserSchema;
var UserModel;

function connectDB(){
    var databaseUrl = "mongodb://localhost:27017/phg";

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, {useNewUrlParser : true});
    database = mongoose.connection;

    database.on('open', function(){
        console.log('데이터베이스 연결 : ' + databaseUrl);

        createUserSchema();

        doTest();
    });

    database.on('disconnected', function(){
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, 'mongoose 연결 에러'));
}

function createUserSchema(){
    // 스키마에 인덱스 설정
    UserSchema = mongoose.Schema({
        id : {type : String, required : true, unique : true},
        name : {type : String, index : 'hashed'},
        age : {type : Number, 'default' : -1},
        created_at : {type : Date, index : {unique : false}, 'default' : Date.now()},
        updated_at : {type : Date, index : {unique : false}, 'default' : Date.now()}
    });
    console.log('UserSchema 정의');

    // virtual 속성 사용 (실제 데이터베이스에 저장되는것은 아님)
    UserSchema.virtual('info')
        // 속성 설정
        .set(function(info){
            var splitted = info.split(' ');
            // this -> 스키마 객체를 가르킨다.
            this.id = splitted[0];
            this.name = splitted[1];
            console.log('virtual info 속성 설정 : ' + this.id + ', ' + this.name);
        })
        // 속성 조회
        .get(function(){ return this.id + ' ' + this.name});

    UserModel = mongoose.model("users3", UserSchema);
    console.log('UserModle 정의');
}

function doTest(){
    var user = new UserModel({"info" : "test01 홍길동"});

    user.save(function(err){
        if(err){
            console.log('에러 발생');
            return;
        }

        console.log('데이터 추가 완료');
    });
}

connectDB();