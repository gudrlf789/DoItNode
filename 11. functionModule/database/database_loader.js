var mongoose = require('mongoose');
var config = require('../config');

var database = {

};

database.init = function(app, config){
    console.log('init 호출됨');

    connect(app, config);
};

function connect(app, config){
    console.log('connect 호출됨');

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, { useNewUrlParser: true });
    database.db = mongoose.connection;

    database.db.on('open', function(){
        console.log('데이터베이스 연결 : ' + databaseUrl);

        createSchema(app, config);
    });

    database.db.on('disconnected', function(){
        console.log('데이터베이스 연결 끊어짐');
    });

    database.db.on('error', console.error.bind(console, 'mongoose 연결 에러'));
};

function createSchema = function(app, config){
    console.log('설정의 DB 스키마 수 : ' + config.db_schemas.length);

    for(var i = 0 ; i < config.db_schemas.length ; i++){
        var curItem = config.db_schemas[i];

        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s 모듈을 이용해 스키마 생성', curItem.file);

        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위해 모델 정의', curItem.collection);

        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마 [%s], 모델 [%s] 생성됨', curItem.schemaName, curItem.modelName);
    }

    app.set('database', database);
};

module.exports = database;