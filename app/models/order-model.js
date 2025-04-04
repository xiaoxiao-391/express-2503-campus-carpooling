// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    // 使用 sequelize 对象的 define 方法定义订单模型
    const Order = sequelize.define('orders', {
        // 关联行程 ID（外键）
        related_trip_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'trips',
                key: 'id'
            }
        },
        // 乘客 ID（外键）
        passenger_id: {
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
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 订单状态（0=待支付，1=已支付，2=待评价，3=完成）
        order_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        // 订单创建时间
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        // 扩展信息（JSON 格式）
        extra_info: {
            type: DataTypes.TEXT,
            defaultValue: '{}',
        }
    });

    return Order;
}; 