// 引入数据库模型
const db = require('../models/index');
// 从db对象中解构出需要的模型
const { Trip, User, UserRole, DriverInfo, TeamMembers } = db;
const { Op } = require('sequelize'); // 确保导入 Op
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
            order: [['start_time', 'ASC']]
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
                            attributes: ['license_number', 'vehicle_model', 'plate_number']
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

        // // 验证是否为发布者或司机
        // if (trip.publish_user_id !== userId && trip.driver_id !== userId) {
        //     return res.status(403).json({ code: 403, error: '只有发布者或司机才能修改行程信息' });
        // }

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
        const {
            time_filter,      // 时间筛选条件
            location_filter,  // 地点筛选条件
            price_filter,     // 价格筛选条件
            search_text,      // 搜索框中的文本
            page = 1,        // 当前页码，默认为1
            page_size = 10,  // 每页数量，默认为10
            trip_status       // 行程状态
        } = req.body;

        const whereClause = {};
        const priceRange = price_filter ? price_filter.split('-').map(Number) : null;

        // 处理行程状态
        if (trip_status) {
            whereClause.trip_status = Array.isArray(trip_status) ? trip_status : [Number(trip_status)];
        }

        // 处理时间筛选条件
        if (time_filter) {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            if (time_filter === '今天') {
                whereClause.start_time = { [Op.between]: [startOfDay, endOfDay] };
            } else if (time_filter === '明天') {
                startOfDay.setDate(startOfDay.getDate() + 1);
                endOfDay.setDate(endOfDay.getDate() + 1);
                whereClause.start_time = { [Op.between]: [startOfDay, endOfDay] };
            } else if (time_filter === '本周内') {
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6));
                whereClause.start_time = { [Op.between]: [startOfWeek, endOfWeek] };
            } else if (time_filter === '下周') {
                const startOfNextWeek = new Date(today.setDate(today.getDate() + (7 - today.getDay())));
                const endOfNextWeek = new Date(today.setDate(startOfNextWeek.getDate() + 6));
                whereClause.start_time = { [Op.between]: [startOfNextWeek, endOfNextWeek] };
            }
        }

        // 处理地点筛选条件
        if (location_filter) {
            if (location_filter === '学校') {
                whereClause.start_name = { [Op.like]: '%大学%' }; // 含有"大学"
            } else if (location_filter === '高铁站') {
                whereClause.start_name = { [Op.like]: '%站%' }; // 含有"站"
            } else if (location_filter === '机场') {
                whereClause.start_name = { [Op.like]: '%机场%' }; // 含有"机场"
            } else if (location_filter === '市区') {
                whereClause.start_name = { [Op.notLike]: '%大学%' }; // 不含有"大学"
                whereClause.start_name = { [Op.notLike]: '%站%' }; // 不含有"站"
                whereClause.start_name = { [Op.notLike]: '%机场%' }; // 不含有"机场"
            }
        }

        // 处理价格筛选条件
        if (priceRange && priceRange.length === 2) {
            whereClause.total_price = { [Op.between]: [priceRange[0], priceRange[1]] };
        }

        // 处理搜索文本
        if (search_text) {
            whereClause.start_name = { [Op.like]: `%${search_text}%` }; // 模糊匹配地点
        }

        // 查询行程数据
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
                            attributes: ['license_number', 'vehicle_model', 'plate_number']
                        }
                    ]
                }
            ],
            order: [['start_time', 'ASC']],
            limit: page_size,
            offset: (page - 1) * page_size // 分页处理
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
 * 获取用户对应状态参与的行程
 */
const getUserTripsByMemberStatus = async (req, res) => {
    const userId = req.user.userId; // 从认证中间件获取的用户ID
    
    const  status  = req.params.status; // 从查询参数获取状态

    try {
        // 处理多个状态的情况
        let statusCondition;
        if (status.includes(',')) {
            // 如果状态是以逗号分隔的字符串，转换为数组
            statusCondition = status.split(',').map(s => Number(s));
        } else {
            // 否则直接转换为数字
            statusCondition = [Number(status)];
        }

        // 查找用户参与的对应状态的行程
        const teamMembers = await TeamMembers.findAll({
            where: { passenger_id: userId, status: statusCondition }, // 根据用户ID和状态过滤
            include: [
                {
                    model: Trip,
                    as: 'trip', // 确保使用正确的别名
                    include: [
                        {
                            model: User,
                            as: 'publisher', // 使用模型定义中的别名
                            attributes: ['id', 'nickname', 'avatar', 'userPhone', 'real_name', 'real_status',
                                [
                                    db.sequelize.literal(`(
                                        SELECT ROUND(AVG(score), 1)
                                        FROM ratings
                                        WHERE rated_id = \`trip\`.\`publish_user_id\` -- 使用正确的表字段和别名
                                    )`),
                                    'averageRating'
                                ]
                            ]
                        }
                    ],
                    order: [['start_time', 'ASC']] // 按开始时间升序排列
                }
            ]
        });

        res.status(200).json({
            code: 200,
            message: '获取用户参与的行程及其状态成功',
            data: teamMembers
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