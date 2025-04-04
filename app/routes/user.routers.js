// 定义一个模块，该模块将导出一个函数，这个函数会配置一些路由规则
module.exports = app => {
    // 引入userControl.js文件，这个文件中应该定义了用户相关的控制器逻辑
    const {login,getUserInfo} = require('../controllers/userController.js');

    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    // 这个路由器对象可以挂载多个路由规则
    var router = require('express').Router();

    // 为路由器对象添加一个 POST 路由处理器，用于处理用户注册的请求
    router.post('/Login', login);
    router.get('/getUserInfo/:id', getUserInfo);

    // 使用 app.use() 方法将路由器对象挂载到 Express 应用上
    // '/api/user' 是路由的前缀，这意味着所有通过 router 定义的路由都会添加这个前缀
    // 因此，注册接口的完整路由地址将是 '/api/user/Register'
    app.use('/api/user', router);
};