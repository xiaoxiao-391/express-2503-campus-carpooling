module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;

    const TeamMembers = sequelize.define('teammembers', {
        trip_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'trips',
                key: 'id'
            }
        },
        passenger_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // 乘客需支付金额
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        // 乘客状态（- 0: 待发布- 1：进行中- 2: 待支付- 3: 已支付- 4: 待评价- 5: 已评价）
    status: {
        type: DataTypes.TINYINT,
            allowNull: false,
                defaultValue: 0
    }
});

return TeamMembers;
};
