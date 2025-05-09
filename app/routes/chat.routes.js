// 定义一个模块，该模块将导出一个函数，这个函数会配置聊天相关的路由规则
module.exports = app => {
    // 引入聊天控制器，这个文件中定义了聊天相关的控制器逻辑
    const {
        getChatList,
        getChatMessages,
        sendMessage,
        getOrCreatePrivateChat,
        getUnreadCount,
        getNotices,
        markNoticeAsRead
    } = require('../controllers/chatController');

    // 引入认证中间件，确保只有登录用户可以访问
    const authenticateToken = require('../middleware/authenticateToken');
    // 通过 require('express').Router() 创建一个新的 Express 路由器对象
    // 这个路由器对象可以挂载多个路由规则
    var router = require('express').Router();

    // 应用 authenticateToken 中间件来保护以下路由
    router.use(authenticateToken);

    // 为路由器对象添加路由处理器
    // 获取聊天列表
    router.get('/getChatList', getChatList);

    // 获取未读消息数量
    router.get('/getUnreadCount', getUnreadCount);

    // 获取或创建与指定用户的私聊（注意：这个路由必须在带参数的路由之前）
    router.post('/getOrCreatePrivateChat/:targetUserId', getOrCreatePrivateChat);

    // 获取特定聊天的消息
    router.get('/getChatMessages/:chatId', getChatMessages);

    // 发送消息
    router.post('/sendMessage/:chatId', sendMessage);

    // 使用 app.use() 方法将聊天路由器对象挂载到 Express 应用上
    // '/api/chat' 是路由的前缀，这意味着所有通过 router 定义的路由都会添加这个前缀
    app.use('/api/chat', router);

    // 创建通知路由
    var noticeRouter = require('express').Router();

    // 应用 authenticateToken 中间件来保护通知路由
    noticeRouter.use(authenticateToken);

    // 获取通知列表
    noticeRouter.get('/getNotices', getNotices);
    // 标记通知为已读
    noticeRouter.put('/markNoticeAsRead/:noticeId', markNoticeAsRead);
    // 挂载通知路由
    app.use('/api/notices', noticeRouter);
}; 