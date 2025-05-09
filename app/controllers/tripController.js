// 引入数据库模型
const db = require('../models/index');
// 从db对象中解构出需要的模型
const { Trip, User, UserRole, DriverInfo, TeamMembers } = db;
// 引入队伍成员控制器

/**
 * 获取所有行程信息列表
 */
const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.findAll({
            include: [
                {
                    model: User,
                    as: 'publisher',//as 定义关联关系的别名
                    attributes: ['id', 'nickname', 'avatar', 'real_name', 'real_status',
                        [
                            // 计算发布者平均评分
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = publisher.id
                            )`),
                            'averageRating'
                        ]
                    ]
                },
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'nickname', 'avatar', 'real_name', 'real_status']
                }
            ],
            order: [['start_time', 'DESC']]
        });

        res.status(200).json({ code: 200, data: trips });
    } catch (error) {
        res.status(500).json({ code: 500, error: error.message });
    }
};



/**
 * 获取行程详细信息
 */
const getTripDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const trip = await Trip.findOne({
            where: { id: Number(id) },
            include: [
                {
                    model: User,
                    as: 'publisher',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = publisher.id   
                            )`),
                            'averageRating'
                        ]
                    ]
                },
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = driver.id
                            )`),
                            'averageRating'
                        ]
                    ],
                    include: [
                        {
                            model: DriverInfo,
                            attributes: ['license_number', 'vehicle_model', 'plate_number', 'certification_status']
                        }
                    ]
                },
                {
                    model: TeamMembers, // 加入队伍成员模型
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'nickname', 'avatar',
                                [
                                    db.sequelize.literal(`(
                                        SELECT ROUND(AVG(score), 1)
                                        FROM ratings
                                        WHERE rated_id = driver.id
                                    )`),
                                    'averageRating'
                                ]

                            ]
                        }
                    ]
                }
            ]
        });

        if (!trip) {
            return res.status(404).json({ code: 404, error: '未找到该行程' });
        }

        res.status(200).json({
            code: 200,
            data: trip,
            message: '获取行程详情成功'
        });
    } catch (error) {
        console.error('获取行程详情错误:', error);
        res.status(500).json({ code: 500, error: error.message });
    }
};

/**
 * 创建新拼车信息并自动添加发布者为队伍成员
 */
const createTrip = async (req, res) => {
    const userId = req.user.userId;
    const {
        start_name,
        start_latitude,
        start_longitude,
        end_name,
        end_latitude,
        end_longitude,
        start_time,
        total_seats,
        occupied_seats,
        trip_status,
        base_price,
        total_price,
        distance,
        remark,
        extra_info
    } = req.body;

    try {
        // 创建行程
        const trip = await Trip.create({
            publish_user_id: userId,
            start_name,
            start_latitude: Number(start_latitude),
            start_longitude: Number(start_longitude),
            end_name,
            end_latitude: Number(end_latitude),
            end_longitude: Number(end_longitude),
            start_time: new Date(start_time),
            total_seats: Number(total_seats),
            occupied_seats: Number(occupied_seats) || 1,
            trip_status: Number(trip_status) || 0,
            base_price: Number(base_price) || 0,
            total_price: Number(total_price) || 0,
            distance: Number(distance) || 0,
            remark,
            extra_info: extra_info || {}
        });


        const teamMember = await TeamMembers.create({
            trip_id: trip.id,
            passenger_id: userId,
            amount: 0,
            status: 0
        });

        // 发送成功响应
        res.status(201).json({
            code: 201,
            message: '拼车信息创建成功',
            data: trip
        });
    } catch (error) {
        console.error('创建行程失败:', error);
        res.status(500).json({ code: 500, error: error.message });
    }
};

/**
 * 删除行程
 */
const deleteTrip = async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    try {
        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ code: 404, error: '未找到该行程' });
        }

        // 验证是否为发布者
        if (trip.publish_user_id !== userId) {
            return res.status(403).json({ code: 403, error: '只有发布者才能删除行程' });
        }

        // 验证行程状态
        if (trip.trip_status !== 0) {
            return res.status(400).json({ code: 400, error: '只能删除待接单状态的行程' });
        }

        await trip.destroy();

        res.status(200).json({ code: 200, message: '行程已删除' });
    } catch (error) {
        res.status(500).json({ code: 500, error: error.message });
    }
};

/**
 * 更新行程信息
 */
const updateTrip = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    try {
        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ code: 404, error: '未找到该行程' });
        }

        // 验证是否为发布者或司机
        if (trip.publish_user_id !== userId && trip.driver_id !== userId) {
            return res.status(403).json({ code: 403, error: '只有发布者或司机才能修改行程信息' });
        }

        // // 检查行程状态
        // if (trip.trip_status !== 0) { // 只有在待接单状态下才能修改
        //     return res.status(400).json({ code: 400, error: '只能修改待接单状态的行程' });
        // }

        await trip.update(updateData);

        res.status(200).json({
            code: 200,
            message: '行程更新成功',
            data: trip
        });
    } catch (error) {
        res.status(500).json({ code: 500, error: error.message });
    }
};

/**
 * 获取用户发布的行程列表
 */
const getUserPublishedTrips = async (req, res) => {
    const { user_id } = req.params;
    try {
        const trips = await Trip.findAll({
            where: { publish_user_id: user_id },
            include: [
                {
                    model: User,
                    as: 'publisher',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = publisher.id
                            )`),
                            'averageRating'
                        ]
                    ]
                },
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                }
            ],
            order: [['start_time', 'DESC']]
        });


        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 获取用户参与的行程列表
 */
const getUserJoinedTrips = async (req, res) => {
    const { user_id } = req.params;
    try {
        const trips = await Trip.findAll({
            where: db.sequelize.where(
                db.sequelize.fn('JSON_CONTAINS',
                    db.sequelize.col('team_member_ids'),
                    JSON.stringify(user_id)
                ),
                1
            ),
            include: [
                {
                    model: User,
                    as: 'publisher',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = publisher.id
                            )`),
                            'averageRating'
                        ]
                    ]
                },
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status']
                }
            ],
            order: [['start_time', 'DESC']]
        });

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 根据行程状态获取行程列表
 * @param {number|array} status - 行程状态或状态数组
 */
const getTripsByStatus = async (req, res) => {
    try {
        const { trip_status } = req.body;
        let statusCondition;


        // 处理多个状态的情况
        if (trip_status && typeof trip_status === 'string' && trip_status.includes(',')) {
            statusCondition = trip_status.split(',').map(s => Number(s));
        } else if (trip_status !== undefined) {
            // 如果是数字或数组直接使用，否则尝试转换为数字
            if (Array.isArray(trip_status)) {
                statusCondition = trip_status.map(s => Number(s));
            } else {
                statusCondition = [Number(trip_status)];
            }
        }

        const whereClause = {};
        if (statusCondition) {
            whereClause.trip_status = statusCondition;
        }

        const trips = await Trip.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'publisher',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = publisher.id
                            )`),
                            'averageRating'
                        ],
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM ratings
                                WHERE rated_id = publisher.id
                            )`),
                            'totalRatings'
                        ]
                    ]
                },
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                        [
                            db.sequelize.literal(`(
                                SELECT ROUND(AVG(score), 1)
                                FROM ratings
                                WHERE rated_id = driver.id
                            )`),
                            'averageRating'
                        ]
                    ],
                    include: [
                        {
                            model: DriverInfo,
                            attributes: ['license_number', 'vehicle_model', 'plate_number', 'certification_status']
                        }
                    ]
                }
            ],
            order: [['start_time', 'DESC']]
        });

        res.status(200).json({
            code: 200,
            data: trips,
            message: '获取行程列表成功'
        });
    } catch (error) {
        console.error('获取行程列表错误:', error);
        res.status(500).json({ code: 500, error: error.message });
    }
};

/**
 * 获取用户参与的行程及其状态
 */
const getUserTripsByMemberStatus = async (req, res) => {
    const userId = req.user.userId; // 从认证中间件获取的用户ID
    const { status } = req.query; // 从查询参数获取状态

    try {
        // 查找用户参与的所有队伍成员
        const teamMembers = await TeamMembers.findAll({
            where: { passenger_id: userId, status: status }, // 根据用户ID和状态过滤
            include: [
                {
                    model: Trip,
                    include: [
                        {
                            model: User,
                            as: 'publisher',
                            attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                                [
                                    db.sequelize.literal(`(
                                        SELECT ROUND(AVG(score), 1)
                                        FROM ratings
                                        WHERE rated_id = publisher.id
                                    )`),
                                    'averageRating'
                                ]
                            ]
                        }
                    ]
                }
            ]
        });

        // 提取行程信息
        const trips = teamMembers.map(member => ({
            tripId: member.trip.id,
            startName: member.trip.start_name,
            endName: member.trip.end_name,
            startTime: member.trip.start_time,
            totalSeats: member.trip.total_seats,
            occupiedSeats: member.trip.occupied_seats,
            tripStatus: member.trip.trip_status,
            memberStatus: member.status, // 用户在该行程中的状态
            publisher: {
                id: member.trip.publisher.id,
                nickname: member.trip.publisher.nickname,
                avatar: member.trip.publisher.avatar,
                userPhone: member.trip.publisher.userPhone,
                real_name: member.trip.publisher.real_name,
                real_status: member.trip.publisher.real_status,
                averageRating: member.trip.publisher.averageRating
            }
        }));

        res.status(200).json({
            code: 200,
            message: '获取用户参与的行程及其状态成功',
            data: trips
        });
    } catch (error) {
        console.error('获取用户参与的行程失败', error);
        res.status(500).json({ code: 500, message: '获取用户参与的行程失败' });
    }
};

// 导出所有控制器方法
module.exports = {
    getAllTrips,
    getTripDetail,
    createTrip,
    deleteTrip,
    updateTrip,
    getUserPublishedTrips,
    getUserJoinedTrips,
    getTripsByStatus,
    getUserTripsByMemberStatus
}; 