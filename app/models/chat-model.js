module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    // 聊天会话模型
    const Chat = sequelize.define('chats', {
        // 聊天会话名称（群聊）
        name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        // 聊天类型：single-单聊，group-群聊
        type: {
            type: DataTypes.ENUM('single', 'group'),
            defaultValue: 'single',
            allowNull: false
        }
    });

    // 创建聊天参与者关联模型
    const ChatParticipant = sequelize.define('chat_participants', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // 聊天ID
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chats',
                key: 'id'
            }
        },
        // 用户ID
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    });

    // 创建消息模型
    const Message = sequelize.define('messages', {
        // 聊天ID
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chats',
                key: 'id'
            }
        },
        // 发送者ID
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 消息内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // 是否已读
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    // 创建通知模型
    const Notice = sequelize.define('notices', {
        // 通知标题
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // 通知内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // 通知类型
        type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    });
    // 创建用户通知状态模型
    const UserNoticeStatus = sequelize.define('user_notice_status', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // 用户ID
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 通知ID
        notice_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'notices',
                key: 'id'
            }
        },
        // 是否已读
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    // 定义关联关系
    Chat.hasMany(ChatParticipant, { foreignKey: 'chat_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    ChatParticipant.belongsTo(Chat, { foreignKey: 'chat_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    Chat.hasMany(Message, { foreignKey: 'chat_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    Message.belongsTo(Chat, { foreignKey: 'chat_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    Notice.hasMany(UserNoticeStatus, { foreignKey: 'notice_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    UserNoticeStatus.belongsTo(Notice, { foreignKey: 'notice_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    return {
        Chat,
        ChatParticipant,
        Message,
        Notice,
        UserNoticeStatus
    };
};
