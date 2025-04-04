// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    // 使用 sequelize 对象的 define 方法定义评价模型
    const Rating = sequelize.define('ratings', {
        // 关联行程 ID（外键）
        related_trip_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'trips',
                key: 'id'
            }
        },
        // 评价人 ID（外键）
        rater_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 被评价人 ID（外键）
        rated_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 评分（1-5 分）
        score: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        // 评价内容
        comment: {
            type: DataTypes.TEXT,
        },
        // 扩展信息（JSON 格式）
        extra_info: {
            type: DataTypes.TEXT,
            defaultValue: '{}',
        }
    });

    return Rating;
}; 