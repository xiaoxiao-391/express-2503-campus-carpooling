// 定义一个模块，该模块将导出一个函数，这个函数会配置一些路由规则
module.exports = app => {
    // 引入userControl.js文件，这个文件中应该定义了用户相关的控制器逻辑
    const { login, getUserInfo } = require('../controllers/userController.js');

    // 引入认证中间件
    const authenticateToken = require('../middleware/authenticateToken');

    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    var router = require('express').Router();

    // 登录接口不需要认证
    router.post('/Login', login);
    
    // 获取用户信息需要认证
    router.get('/getUserInfo/:id', authenticateToken, getUserInfo);

    // 使用 app.use() 方法将路由器对象挂载到 Express 应用上
    app.use('/api/user', router);
};