// exports 한 모듈을 불러온다.
var user1 = require('./user1');

function showUser(){
    return user1.getUser().name + ', ' + user1.group.name;
};

console.log('사용자 정보 -> ' + showUser());