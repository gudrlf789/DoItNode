/*
1. static 미들웨어
특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
*/
var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
//__dirname : 현재 파일이 위치해 있는 경로
app.use(static(path.join(__dirname, 'public')));

var server = http.createServer(app).listen(app.get('port'),function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});