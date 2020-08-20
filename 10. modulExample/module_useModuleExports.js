var user = require('./user2');

function showUser(){
    return user.getUser().name + ', ' + user.group.name;
};

console.log('사용자 정보 : ' + showUser());