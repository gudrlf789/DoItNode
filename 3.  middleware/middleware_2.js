var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');

//post 방식으로 넘길때 body-parser 사용
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({
    extended : false
}));

app.use(bodyParser.json());
app.use(static(path.join(__dirname,'public')));

app.use(function(req, res, next){
    console.log('첫번째 미들웨어');

    var userAgent = req.header('User-Agent');
    var paramName = req.body.name || req.body.id || req.query.name;

    res.send('<h3> 서버 응답. User-Agent -> ' + userAgent + '</h3><br/>'+
        '<h3>Param Name -> ' + paramName + '</h3>');
})

var server = http.createServer(app).listen(app.get('port'),function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});