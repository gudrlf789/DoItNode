var user = {
    getUser : function(){
        return {
            id : 'test01',
            name : '홍길동'
        };
    },
    group : {
        id : 'group01',
        name : '친구'
    }
};

// module.exports 를 사용하여 객체 및 함수 할당가능
module.exports = user;