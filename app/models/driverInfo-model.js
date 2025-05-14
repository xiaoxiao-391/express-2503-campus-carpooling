// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
// 这个函数将创建并返回 User 模型
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    // 使用 sequelize 对象的 define 方法定义一个新的模型，命名为 
    const DriverInfo = sequelize.define('driverinfos', {
        // 关联用户表的user_id主键
        driver_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            unique: true,
            allowNull: false,
        },
        // 驾驶证编号（如A123456789）
        license_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        //车辆型号（如特斯拉Model 3/别克GL8）
        vehicle_model: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        // 车牌号（如粤A12345）
        plate_number: {
            type: DataTypes.STRING(10),
            unique: true,
            allowNull: false,
        },
    });
    // 返回 User 模型，这样它就可以在其他地方被引用和使用
    return DriverInfo;
};