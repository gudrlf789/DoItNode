var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(static(path.join(__dirname, 'public')));

var server = http.createServer(app).listen(app.get('port'),function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});