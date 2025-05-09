// 引入数据库模型
const db = require('../models');
const { TeamMembers, User } = db;

/**
 * 增加队伍成员
 */
const addTeamMember = async (req, res) => {
    const { trip_id, passenger_id, amount, status } = req.body;

    try {
        const teamMember = await TeamMembers.create({
            trip_id,
            passenger_id,
            amount,
            status
        });

        res.status(201).json({
            code: 201,
            message: '队伍成员创建成功',
            data: teamMember
        });
    } catch (error) {
        console.error('创建队伍成员失败', error);
        res.status(500).json({ code: 500, message: '创建队伍成员失败' });
    }
};

/**
 * 获取队伍成员列表
 */
const getTeamMembers = async (req, res) => {
    const { trip_id } = req.params;

    try {
        const teamMembers = await TeamMembers.findAll({
            where: { trip_id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'nickname', 'avatar']
                }
            ]
        });

        return res.status(200).json({
            code: 200,
            message: '获取队伍成员列表成功',
            data: teamMembers
        });
    } catch (error) {
        console.error('获取队伍成员列表失败', error);
        return res.status(500).json({ code: 500, message: '获取队伍成员列表失败' });
    }
};

/**
 * 获取特定队伍成员
 */
const getTeamMember = async (req, res) => {
    const { id } = req.params;

    try {
        const teamMember = await TeamMembers.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'nickname', 'avatar']
                }
            ]
        });

        if (!teamMember) {
            return res.status(404).json({ code: 404, message: '未找到该队伍成员' });
        }

        res.status(200).json({
            code: 200,
            message: '获取队伍成员成功',
            data: teamMember
        });
    } catch (error) {
        console.error('获取队伍成员失败', error);
        res.status(500).json({ code: 500, message: '获取队伍成员失败' });
    }
};

/**
 * 更新队伍成员在对应行程中的状态
 */
const updateTeamMember = async (req, res) => {
    const { trip_id, passenger_id,amount, status } = req.body; // 从请求体中获取要更新的字段

    try {
        // 查找对应的队伍成员
        const teamMember = await TeamMembers.findOne({
            where: {
                trip_id: trip_id,
                passenger_id: passenger_id
            }
        });

        if (!teamMember) {
            return res.status(404).json({ code: 404, message: '未找到该队伍成员' });
        }

        // 更新队伍成员的状态和金额
        await teamMember.update({
            amount: amount !== undefined ? amount : teamMember.amount, // 如果没有提供 amount，则保持原值
            status: status !== undefined ? status : teamMember.status // 如果没有提供 status，则保持原值
        });

        res.status(200).json({
            code: 200,
            message: '队伍成员状态更新成功',
            data: teamMember
        });
    } catch (error) {
        console.error('更新队伍成员状态失败', error);
        res.status(500).json({ code: 500, message: '更新队伍成员状态失败' });
    }
};

/**
 * 删除队伍成员
 */
const deleteTeamMember = async (req, res) => {
    const { id } = req.params;

    try {
        const teamMember = await TeamMembers.findByPk(id);

        if (!teamMember) {
            return res.status(404).json({ code: 404, message: '未找到该队伍成员' });
        }

        await teamMember.destroy();

        res.status(200).json({
            code: 200,
            message: '队伍成员删除成功'
        });
    } catch (error) {
        console.error('删除队伍成员失败', error);
        res.status(500).json({ code: 500, message: '删除队伍成员失败' });
    }
};

// 导出所有控制器方法
module.exports = {
    addTeamMember,
    getTeamMembers,
    getTeamMember,
    updateTeamMember,
    deleteTeamMember
};
