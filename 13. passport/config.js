module.exports = {
    server_port : 3000,
    db_url : 'mongodb://localhost:27017/phg',
    db_schemas : [{
        file : '../database/user_schema',
        collection : 'user',
        schemaName : 'UserSchema',
        modelName : 'UserModel',
    }],
    route_info : [],
};