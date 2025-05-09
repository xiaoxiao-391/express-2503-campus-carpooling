// 定义一个模块，该模块将导出一个函数，这个函数会配置一些路由规则
module.exports = app => {
    // 引入 ratingController.js 文件，这个文件中定义了评价相关的控制器逻辑
    const {
        createRating,
        getUserReceivedRatings,
        getUserGivenRatings,
        getTripRatings,
        getUserRatingStats
    } = require('../controllers/ratingController.js');

    // 保护路由，确保只有登录用户可以访问
    const authenticateToken = require('../middleware/authenticateToken');
    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    // 这个路由器对象可以挂载多个路由规则
    var router = require('express').Router();
    // 应用 authenticateToken 中间件来保护以下路由
    router.use(authenticateToken);

    // 为路由器对象添加路由处理器
    router.post('/createRating', createRating);
    router.get('/getUserReceivedRatings/:user_id', getUserReceivedRatings);
    router.get('/getUserGivenRatings/:user_id', getUserGivenRatings);
    router.get('/getTripRatings/:trip_id', getTripRatings);
    router.get('/getUserRatingStats/:user_id', getUserRatingStats);

    // 使用 app.use() 方法将路由器对象挂载到 Express 应用上
    // '/api/rating' 是路由的前缀，这意味着所有通过 router 定义的路由都会添加这个前缀
    app.use('/api/rating', router);
}; 