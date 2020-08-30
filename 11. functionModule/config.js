module.exports = {
    server_port : 3000,
    db_url : 'mongodb://localhost:27017/phg',
    db_schemas : [
        {
            file : './user_schema',
            collection : 'cryptUsers',
            schemaName : 'UserSchema',
            modelName : 'UserModel'
        }
    ]
};