// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    // 使用 sequelize 对象的 define 方法定义一个新的模型，命名为 Trip
    const Trip = sequelize.define('trips', {
        // 发布用户 ID（外键）
        publish_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 司机 ID（外键）
        driver_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 出发地名称
        start_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        // 出发地纬度
        start_latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: false
        },
        // 出发地经度
        start_longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: false
        },
        // 目的地名称
        end_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        // 目的地纬度
        end_latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: false
        },
        // 目的地经度
        end_longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: false
        },
        // 出发时间
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // 总座位数
        total_seats: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        // 已有人数
        occupied_seats: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        // 行程状态（0=待发布，1=待接单，2=已接单,3=司机已到达出发地,4=用户上车，进行中,5=已到达目的地---开始更改乘客status）
        trip_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        // 基础价格（可选）
        base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        // 总价
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        // 行程距离（可选）
        distance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        // 备注信息
        remark: {
            type: DataTypes.STRING(255)
        },
        // 扩展信息（JSON 格式）
        extra_info: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    });

    // 返回 Trip 模型，这样它就可以在其他地方被引用和使用
    return Trip;
}; 