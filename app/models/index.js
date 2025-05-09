// 创建 Sequelize 实例以连接数据库

// 引入数据库配置模块，该模块应包含数据库连接所需的配置信息
const dbConfig = require('../config/db.config.js');

// 引入 Sequelize 库，这是一个用于 Node.js 的 ORM 库，用于操作数据库
const Sequelize = require('sequelize');

// 使用提供的数据库配置信息创建 Sequelize 实例
// DB, USER, PASSWORD 是连接数据库所需的参数
// host 是数据库服务器的地址，dialect 是使用的数据库方言（如 mysql, postgres 等）
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect // 指定数据库方言
    }
);

// 创建一个 db 对象，用于存储 Sequelize 类、sequelize 实例和模型
const db = {};

// 将 Sequelize 类和 sequelize 实例添加到 db 对象中
// 这允许在其他文件中通过 db.Sequelize 和 db.sequelize 访问它们
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 把模型挂载到 db 对象上，便于在其他文件中引用
// 通常，模型定义在单独的文件中，并通过 sequelize 和 Sequelize 类与数据库交互
// 这里通过 require 引入 user-model.js（用户模型定义文件）
// 并将 sequelize 和 Sequelize 作为参数传递给它，以创建和返回模型
db.User = require('./user-model.js')(sequelize, Sequelize);
db.UserRole = require('./userRole-model.js')(sequelize, Sequelize);
db.DriverInfo = require('./driverInfo-model.js')(sequelize, Sequelize);
db.Trip = require('./trip-model.js')(sequelize, Sequelize);
db.Rating = require('./rating-model.js')(sequelize, Sequelize);

// 引入聊天相关模型
const chatModels = require('./chat-model.js')(sequelize, Sequelize);
db.Chat = chatModels.Chat;
db.ChatParticipant = chatModels.ChatParticipant;
db.Message = chatModels.Message;
db.Notice = chatModels.Notice;
db.UserNoticeStatus = chatModels.UserNoticeStatus;

// 引入乘客行程模型
db.TeamMembers = require('./teammembers-model.js')(sequelize, Sequelize);

// 模型间的关联关系
// 建立 User 和 UserRole 的关联关系
db.User.hasMany(db.UserRole, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserRole.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
// 建立 User 和 DriverInfo 的关联关系
db.User.hasOne(db.DriverInfo, { foreignKey: 'driver_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.DriverInfo.belongsTo(db.User, { foreignKey: 'driver_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
// 建立 User 和 Trip 的关联关系，as 用来定义关联关系的别名
db.User.hasMany(db.Trip, { foreignKey: 'publish_user_id', as: 'publishedTrips', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Trip.belongsTo(db.User, { foreignKey: 'publish_user_id', as: 'publisher', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
// 建立 User 和 Trip 的司机关联关系，as 用来定义关联关系的别名
db.User.hasMany(db.Trip, { foreignKey: 'driver_id', as: 'driverTrips', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Trip.belongsTo(db.User, { foreignKey: 'driver_id', as: 'driver', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// 建立 Trip 和 Rating 的关联关系
db.Trip.hasMany(db.Rating, { foreignKey: 'related_trip_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Rating.belongsTo(db.Trip, { foreignKey: 'related_trip_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 User 和 Rating 的关联关系（评价人）
db.User.hasMany(db.Rating, { foreignKey: 'rater_id', as: 'givenRatings', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Rating.belongsTo(db.User, { foreignKey: 'rater_id', as: 'raterUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 User 和 Rating 的关联关系（被评价人）
db.User.hasMany(db.Rating, { foreignKey: 'rated_id', as: 'receivedRatings', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Rating.belongsTo(db.User, { foreignKey: 'rated_id', as: 'ratedUser', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 User 和 ChatParticipant 的关联关系
db.User.hasMany(db.ChatParticipant, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ChatParticipant.belongsTo(db.User, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 User 和 Message 的关联关系
db.User.hasMany(db.Message, { foreignKey: 'sender_id', as: 'sentMessages', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Message.belongsTo(db.User, { foreignKey: 'sender_id', as: 'sender', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 User 和 UserNoticeStatus 的关联关系
db.User.hasMany(db.UserNoticeStatus, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserNoticeStatus.belongsTo(db.User, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立 Trip 和 TeamMembers 的关联关系
db.Trip.hasMany(db.TeamMembers, { foreignKey: 'trip_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.TeamMembers.belongsTo(db.Trip, { foreignKey: 'trip_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 建立  TeamMembers和 User的关联关系
db.TeamMembers.belongsTo(db.User, { foreignKey: 'passenger_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.User.hasOne(db.TeamMembers, { foreignKey: 'passenger_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 导出 db 对象，这样其他文件就可以通过 require 这个文件来访问 Sequelize 实例和模型
module.exports = db;