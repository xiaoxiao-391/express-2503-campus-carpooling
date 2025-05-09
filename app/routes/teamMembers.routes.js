// 定义一个模块，该模块将导出一个函数，这个函数会配置队伍成员相关的路由规则
module.exports = app => {
    // 引入队伍成员控制器，这个文件中定义了队伍成员相关的控制器逻辑
    const {
        addTeamMember,
        getTeamMembers,
        getTeamMember,
        updateTeamMember,
        deleteTeamMember
    } = require('../controllers/teamMembersController');

    // 引入认证中间件，确保只有登录用户可以访问
    const authenticateToken = require('../middleware/authenticateToken');
    
    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    var router = require('express').Router();

    // 应用 authenticateToken 中间件来保护以下路由
    router.use(authenticateToken);

    // 为路由器对象添加路由处理器
    router.post('/addTeamMember', addTeamMember); // 增加队伍成员
    router.get('/getTeamMembers/:trip_id', getTeamMembers); // 获取队伍成员列表
    router.get('/getTeamMember/:id', getTeamMember); // 获取特定队伍成员
    router.put('/updateTeamMember', updateTeamMember); // 更新队伍成员
    router.delete('/deleteTeamMember/:id', deleteTeamMember); // 删除队伍成员

    // 使用 app.use() 方法将路由器对象挂载到 Express 应用上
    // '/api/teamMembers' 是路由的前缀，这意味着所有通过 router 定义的路由都会添加这个前缀
    app.use('/api/teamMembers', router);
};
