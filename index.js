// 引入express库，express是一个用于Node.js的极简Web框架
const express = require('express');
// 引入http模块，用于创建HTTP服务器
const http = require('http');
// 引入db模块，该模块应包含数据库的配置和模型定义
const db = require('./app/models/index.js');
// 引入body-parser中间件，用于解析传入的请求体
const bodyParser = require('body-parser');
// 引入 'cors' 模块，这是一个Node.js中间件，用于处理CORS请求,处理跨域问题
const cors = require('cors');
// 引入WebSocket管理器
const socketManager = require('./app/utils/socketManager.js');


// 创建Express应用的实例
const app = new express();
// 创建HTTP服务器，将Express应用作为请求处理程序
const server = http.createServer(app);

// 创建一个CORS选项对象corsOptions，用于配置CORS策略
var corsOptions = {
    // 设置允许的源（Origin），这意味着只有来自该地址的请求才会被接受
    origin: 'http://localhost:5173'
};
app.use(cors(corsOptions))
// 使用body-parser中间件解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 调用db模块的sequelize对象的sync静态方法
// 这个方法将根据模型定义同步（创建或更新）数据库表结构
db.sequelize.sync();

// 引入user.routers.js文件，并传递app实例作为参数
// 这个文件应包含Express路由的定义，app实例将被传递给该文件的导出函数
require('./app/routes/user.routers.js')(app);
require('./app/routes/trip.routers.js')(app);
require('./app/routes/rating.routers.js')(app);
require('./app/routes/chat.routes.js')(app);
require('./app/routes/teamMembers.routes.js')(app);
// 初始化WebSocket服务
socketManager.initialize(server);

// 使用server.listen代替app.listen启动HTTP服务器
// 一旦服务器启动成功，将打印控制台日志提示项目已成功运行
server.listen(3000, () => {
    console.log('自动更新项目成功运行,端口3000');
});