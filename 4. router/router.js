var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require('body-parser');
//외부 모듈 사용하여 오류 페이지 보여주기
var expressErrorHandler = require('express-error-handler');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());
app.use(static(path.join(__dirname,'public')));

//라우터 사용
var router = express.Router();

router.route('/process/login').post(function(req, res){
    console.log('/process/login 라우팅 함수');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    res.write("<h1>서버에서 로그인 응답</h1>");
    res.write("<div><p>"+ paramId + "</p></div>");
    res.write("<div><p>"+ paramPassword + "</p></div>");
    res.end();
});

//url에서 파라미터 사용할때
router.route('/process/login/:name').post(function(req, res){
    console.log('/process/login/:name 라우팅 함수');
    //params 객체를 사용한다
    var paramName = req.params.name;

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    res.write("<h1>서버에서 로그인 응답</h1>");
    res.write("<div><p>"+ paramId + "</p></div>");
    res.write("<div><p>"+ paramPassword + "</p></div>");
    res.write("<div><p>"+ paramName + "</p></div>");
    res.end();
});

app.use('/', router);

// 1번 : 등록되지 않은 요청 패스일 경우 오류 페이지 표시
/*
app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});
*/

// 2번 : express-error-handler 모듈 사용하여 오류 페이지 보여주기
var errorHandler = expressErrorHandler({
    static : {
        '404' : './public/html/error.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});