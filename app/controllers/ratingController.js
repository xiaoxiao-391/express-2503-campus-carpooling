// 引入数据库模型
const db = require('../models/index');
const { Rating, Trip, User } = db;

/**
 * 创建评价
 */
const createRating = async (req, res) => {
    const { related_trip_id, rated_id, score, comment } = req.body;
    const rater_id = req.user.userId;

    try {
        // 验证评分范围
        if (score < 1 || score > 5) {
            return res.status(400).json({
                message: '评分必须在1-5分之间',
                code: 400
            });
        }

        // 查找行程和订单信息
        const trip = await Trip.findByPk(related_trip_id);
        if (!trip) {
            return res.status(404).json({
                message: '未找到该行程',
                code: 401
            });
        }
        // 检查是否已经评价过
        const existingRating = await Rating.findOne({
            where: {
                related_trip_id,
                rater_id,
                rated_id
            },
        });

        if (existingRating) {
            return res.status(400).json({
                message: '您已经评价过该用户',
                code: 400
            });
        }

        // 创建评价
        const rating = await Rating.create({
            related_trip_id,
            rater_id,
            rated_id,
            score,
            comment
        });

        res.status(201).json({
            code: 201,
            message: '评价成功',
            data: rating
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            error: error.message
        });
    }
};

/**
 * 获取用户收到的评价列表
 */
const getUserReceivedRatings = async (req, res) => {
    const { user_id } = req.params;

    try {
        const ratings = await Rating.findAll({
            where: { rated_id: user_id },
            include: [
                {
                    model: User,
                    as: 'raterUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                },
                {
                    model: User,
                    as: 'ratedUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                },
                {
                    model: Trip,
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ code: 200, data: ratings });
    } catch (error) {
        console.error('获取用户收到的评价列表错误:', error);
        res.status(500).json({
            code: 500,
            error: error.message
        });
    }
};

/**
 * 获取用户发出的评价列表
 */
const getUserGivenRatings = async (req, res) => {
    const { user_id } = req.params;

    try {
        const ratings = await Rating.findAll({
            where: { rater_id: user_id },
            include: [
                {
                    model: User,
                    as: 'raterUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                },
                {
                    model: User,
                    as: 'ratedUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                },
                {
                    model: Trip,
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ code: 200, data: ratings });
    } catch (error) {
        console.error('获取用户发出的评价列表错误:', error);
        res.status(500).json({
            code: 500,
            error: error.message
        });
    }
};

/**
 * 获取行程的评价列表
 */
const getTripRatings = async (req, res) => {
    const { trip_id } = req.params;

    try {
        const ratings = await Rating.findAll({
            where: { related_trip_id: trip_id },
            include: [
                {
                    model: User,
                    as: 'raterUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                },
                {
                    model: User,
                    as: 'ratedUser',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ code: 200, data: ratings });
    } catch (error) {
        console.error('获取行程评价列表错误:', error);
        res.status(500).json({
            code: 500,
            error: error.message
        });
    }
};

/**
 * 获取用户的评分统计
 */
const getUserRatingStats = async (req, res) => {
    const { user_id } = req.params;

    try {
        const ratings = await Rating.findAll({
            where: { rated_id: user_id },
            attributes: [
                [db.sequelize.fn('AVG', db.sequelize.col('score')), 'averageScore'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalRatings']
            ]
        });

        const stats = {
            userId: user_id,
            averageScore: parseFloat(ratings[0].dataValues.averageScore || 0).toFixed(1),
            totalRatings: parseInt(ratings[0].dataValues.totalRatings || 0)
        };

        res.status(200).json({ code: 200, data: stats });
    } catch (error) {
        res.status(500).json({
            code: 500,
            error: error.message
        });
    }
};

// 导出所有控制器方法
module.exports = {
    createRating,
    getUserReceivedRatings,
    getUserGivenRatings,
    getTripRatings,
    getUserRatingStats
}; 