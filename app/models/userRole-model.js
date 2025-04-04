// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
// 这个函数将创建并返回 User 模型
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    // 使用 sequelize 对象的 define 方法定义一个新的模型，命名为 User
    const UserRole = sequelize.define('userroles', {
        userId: {
            type: DataTypes.INTEGER,
            references: { model: 'users', key: 'id' },
            allowNull: false
        },
        role: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: { isIn: [[0, 1]] }, // 0=乘客，1=司机
            comment: '角色类型'
        }
    }, {
        indexes: [
            { fields: ['userId', 'role'], unique: true } // 防止重复角色
        ]
    });
    // 返回 User 模型，这样它就可以在其他地方被引用和使用
    return UserRole;
};