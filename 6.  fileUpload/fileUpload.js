var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require('cors');

var app = express();

app.set('port', process.env.PORT || 3000);

//미들웨어
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());
app.use(static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname,'uploads')));
app.use(cors());

var storage = multer.diskStorage({
    destination : function(req, file, callback){
        // 업로드 폴더로 목적지 설정
        callback(null, 'uploads');
    },
    filename : function(req, file, callback){
        // 아래와 같은 경우 확장자 뒤에 날짜가 붙게 된다.
        //callback(null, file.originalname + Date.now());

        //확장자만 빼내는 방법
        var extension = path.extname(file.originalname);
        //파일이름만 빼내는 방법
        var basename = path.basename(file.originalname, extension);
        callback(null, basename + Date.now() + extension);

    }
});

var upload = multer({
    storage : storage,
    limits : {
        //파일 개수 지정
        files : 10,
        fileSize : 1024*1024*1024
    }
});

var router = express.Router();

//photo 라는 파일의 이름을 배열의 형태로 받는다.
router.route('/process/photo').post(upload.array('photo', 1), function(req, res){
    console.log('/process/photo 라우팅 함수 호출');

    var files = req.files;

    console.log('업로드된 파일');
    if(files.length > 0){
        console.dir(files[0]);
    }else{
        console.log('파일이 없습니다.')
    }
    
    var originalName;
    var filename;
    var mimetype;
    var sieze;

    if(Array.isArray(files)){
        for(var i = 0 ; i< files.length ; i++){
            originalName = files[i].originalname;
            filename = files[i].filename;
            mimetype = files[i].mimetype;
            size = files[i].size;
        }
    }

    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"})
    res.write("<h1>파일 업로드 성공</h1>");
    res.write("<p>원본파일 :" + originalName + "</p>");
    res.write("<p>저장파일 :" + filename + "</p>");
    res.end();
});

app.use('/', router);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스로 웹 서버 실행 : ' + app.get('port'));
});


