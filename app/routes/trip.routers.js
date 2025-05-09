// 定义一个模块，该模块将导出一个函数，这个函数会配置一些路由规则
module.exports = app => {
    // 引入 tripController.js 文件，这个文件中定义了行程相关的控制器逻辑
    const {
        getAllTrips,
        getTripDetail,
        createTrip,
        deleteTrip,
        updateTrip,
        getUserPublishedTrips,
        getUserJoinedTrips,
        getTripsByStatus,
        getUserTripsByMemberStatus
    } = require('../controllers/tripController.js');

    // 保护路由，确保只有登录用户可以访问
    const authenticateToken = require('../middleware/authenticateToken');
    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    // 这个路由器对象可以挂载多个路由规则
    var router = require('express').Router();
    // 应用 authenticateToken 中间件来保护以下路由
    router.use(authenticateToken);

    // 为路由器对象添加路由处理器
    router.get('/getAllTrips', getAllTrips);
    router.get('/getTripDetail/:id', getTripDetail);
    router.get('/getUserPublishedTrips/:user_id', getUserPublishedTrips);
    router.get('/getUserJoinedTrips/:user_id', getUserJoinedTrips);
    router.post('/createTrip', createTrip);
    router.delete('/deleteTrip/:id', deleteTrip);
    router.put('/updateTrip/:id', updateTrip);
    router.post('/getTripsByStatus', getTripsByStatus);
    router.get('/getUserTripsByMemberStatus', getUserTripsByMemberStatus);
    // 使用 app.use() 方法将路由器对象挂载到 Express 应用上
    // '/api/trip' 是路由的前缀，这意味着所有通过 router 定义的路由都会添加这个前缀
    app.use('/api/trip', router);
}; 