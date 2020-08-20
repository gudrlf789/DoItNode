// exports를 이용해서 전역변수로 등록
// 한계 : exports에 속성을 추가하는 방식은 가능 하지만 객체를 바로 할당하면 문제가 생긴다.
exports.getUser = function(){
    return {
        id : 'test01',
        name : '홍길동'
    };
};

exports.group = {
    id : 'group01',
    name : '친구'
};