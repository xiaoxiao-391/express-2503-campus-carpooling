const db = require('../models');
const Chat = db.Chat;
const ChatParticipant = db.ChatParticipant;
const Message = db.Message;
const Notice = db.Notice;
const User = db.User;
const socketManager = require('../utils/socketManager');
const { Op } = require('sequelize');

// 获取用户的聊天列表
exports.getChatList = async (req, res) => {
    try {
        const userId = req.user.userId; // 从认证中间件获取的用户ID

        // 查询用户参与的所有聊天
        const chats = await ChatParticipant.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Chat,
                    include: [
                        {
                            model: ChatParticipant,
                            include: [
                                {
                                    model: User,
                                    attributes: ['id', 'nickname', 'avatar']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // 处理结果，获取每个聊天的最后一条消息和未读消息数
        const chatList = await Promise.all(chats.map(async (chatParticipant) => {
            const chat = chatParticipant.chat;

            // 获取最后一条消息
            const lastMessage = await Message.findOne({
                where: { chat_id: chat.id },
                order: [['createdAt', 'DESC']]
            });

            // 获取未读消息数
            const unreadCount = await Message.count({
                where: {
                    chat_id: chat.id,
                    sender_id: { [Op.ne]: userId },
                    is_read: false
                }
            });

            // 获取聊天对象信息（如果是单聊）
            let chatName = chat.name;
            let chatAvatar = null;

            if (chat.type === 'single') {
                // 找到对方用户
                const otherParticipant = chat.chat_participants.find(
                    p => p.user_id !== userId
                );

                if (otherParticipant && otherParticipant.user) {
                    chatName = otherParticipant.user.nickname;
                    chatAvatar = otherParticipant.user.avatar;
                }
            }

            return {
                id: chat.id,
                name: chatName,
                avatar: chatAvatar,
                type: chat.type,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    time: lastMessage.createdAt,
                    senderId: lastMessage.sender_id
                } : null,
                unreadCount: unreadCount
            };
        }));

        // 按最后消息时间排序
        chatList.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
        });

        res.status(200).json({
            code: 200,
            message: '获取聊天列表成功',
            data: chatList
        });
    } catch (error) {
        console.error('获取聊天列表失败', error);
        res.status(500).json({ code: 500, message: '获取聊天列表失败' });
    }
};

// 获取特定聊天的消息
exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, size = 20 } = req.query;
        const userId = req.user.userId;

        // 检查用户是否是该聊天的参与者
        const participant = await ChatParticipant.findOne({
            where: {
                chat_id: chatId,
                user_id: userId
            }
        });

        if (!participant) {
            return res.status(403).json({ message: '您不是该聊天的参与者' });
        }

        // 计算分页参数
        const limit = parseInt(size);
        const offset = (parseInt(page) - 1) * limit;

        // 查询消息
        const messages = await Message.findAll({
            where: { chat_id: chatId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'nickname', 'avatar']
                }
            ],
            order: [['createdAt', 'ASC']],
            limit,
            offset
        });

        // 获取聊天参与者信息（接收者）
        const chatParticipants = await ChatParticipant.findAll({
            where: { chat_id: chatId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'nickname', 'avatar']
                }
            ]
        });

        // 标记消息为已读
        await Message.update(
            { is_read: true },
            {
                where: {
                    chat_id: chatId,
                    sender_id: { [Op.ne]: userId },
                    is_read: false
                }
            }
        );

        // 转换消息格式，便于前端展示
        const formattedMessages = messages.map(message => {
            // 获取接收者信息
            const receiver = chatParticipants.find(participant => participant.user_id !== message.sender_id);
            return {
                id: message.id,
                content: message.content,
                time: message.createdAt,
                isSelf: message.sender_id === userId,
                sender: {
                    id: message.sender.id,
                    nickname: message.sender.nickname,
                    avatar: message.sender.avatar
                },
                receiver: receiver ? {
                    id: receiver.user.id,
                    nickname: receiver.user.nickname,
                    avatar: receiver.user.avatar
                } : null // 如果接收者存在
            };
        });

        res.status(200).json({
            code: 200,
            message: '获取聊天消息成功',
            data: formattedMessages
        });
    } catch (error) {
        console.error('获取聊天消息失败', error);
        res.status(500).json({ code: 500, message: '获取聊天消息失败' });
    }
};

// 发送消息
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user.userId;

        // 检查用户是否是该聊天的参与者
        const participant = await ChatParticipant.findOne({
            where: {
                chat_id: chatId,
                user_id: senderId
            }
        });

        if (!participant) {
            return res.status(403).json({ message: '您不是该聊天的参与者' });
        }

        // 创建消息
        const message = await Message.create({
            chat_id: chatId,
            sender_id: senderId,
            content,
            is_read: false
        });

        // 获取聊天其他参与者
        const otherParticipants = await ChatParticipant.findAll({
            where: {
                chat_id: chatId,
                user_id: { [Op.ne]: senderId }
            }
        });

        // 通过WebSocket通知其他参与者
        otherParticipants.forEach(participant => {
            socketManager.sendToUser(participant.user_id, {
                type: 'new_message',
                chatId,
                messageId: message.id,
                senderId,
                content,
                time: message.createdAt
            });
        });

        // 返回响应
        res.status(201).json({
            code: 201,
            message: '消息发送成功',
            data: message
        });
    } catch (error) {
        console.error('发送消息失败', error);
        res.status(500).json({ code: 500, message: '发送消息失败' });
    }
};

// 创建或获取两个用户之间的私聊
exports.getOrCreatePrivateChat = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user.userId;

        // 检查targetUserId是否有效
        if (!targetUserId) {
            return res.status(400).json({ message: '目标用户ID不能为空' });
        }

        // 检查两个用户是否已经有聊天
        const existingChat = await Chat.findOne({
            include: [
                {
                    model: ChatParticipant,
                    where: { user_id: userId }
                },
                {
                    model: ChatParticipant,
                    where: { user_id: targetUserId }
                }
            ],
            where: {
                type: 'single'
            }
        });

        // 如果已有聊天，返回该聊天
        if (existingChat) {
            return res.status(200).json({
                code: 200,
                message: '已找到会话',
                chatId: existingChat.id
            });
        }

        // 创建新聊天
        const chat = await Chat.create({
            type: 'single'
        });

        // 添加参与者
        await ChatParticipant.bulkCreate([
            { chat_id: chat.id, user_id: userId },
            { chat_id: chat.id, user_id: targetUserId }
        ]);

        res.status(201).json({
            code: 201,
            message: '创建会话成功',
            chatId: chat.id
        });
    } catch (error) {
        res.status(500).json({ message: '创建会话失败' });
    }
};

// 获取未读消息数量
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 获取各聊天的未读消息数
        const result = await Message.findAll({
            attributes: [
                'chat_id',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                is_read: false,
                sender_id: { [Op.ne]: userId }
            },
            include: [
                {
                    model: Chat,
                    include: [
                        {
                            model: ChatParticipant,
                            where: { user_id: userId }
                        }
                    ]
                }
            ],
            group: ['chat_id']
        });

        // 计算总未读数
        const totalUnread = result.reduce((sum, item) => sum + parseInt(item.dataValues.count), 0);

        res.status(200).json({
            code: 200,
            message: '获取未读消息数量成功',
            data: {
                total: totalUnread,
                chats: result.map(item => ({
                    chatId: item.chat_id,
                    count: parseInt(item.dataValues.count)
                }))
            }
        });
    } catch (error) {
        console.error('获取未读消息数量失败', error);
        res.status(500).json({ code: 500, message: '获取未读消息数量失败' });
    }
};

// 获取通知列表
exports.getNotices = async (req, res) => {
    try {
        const userId = req.user.userId;

        const notices = await Notice.findAll({
            include: [
                {
                    model: db.UserNoticeStatus,
                    where: { user_id: userId },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formattedNotices = notices.map(notice => ({
            id: notice.id,
            title: notice.title,
            content: notice.content,
            icon: notice.icon,
            time: notice.createdAt,
            isRead: notice.user_notice_statuses && notice.user_notice_statuses.length > 0
                ? notice.user_notice_statuses[0].is_read
                : false
        }));

        res.status(200).json({
            code: 200,
            message: '获取通知列表成功',
            data: formattedNotices
        });
    } catch (error) {
        console.error('获取通知列表失败', error);
        res.status(500).json({ code: 500, message: '获取通知列表失败' });
    }
};

// 标记通知为已读
exports.markNoticeAsRead = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const userId = req.user.userId;

        await db.UserNoticeStatus.upsert({
            user_id: userId,
            notice_id: noticeId,
            is_read: true
        });

        res.status(200).json({
            code: 200,
            message: '标记通知已读成功',
            data: { success: true }
        });
    } catch (error) {
        console.error('标记通知已读失败', error);
        res.status(500).json({ code: 500, message: '标记通知已读失败' });
    }
}; 