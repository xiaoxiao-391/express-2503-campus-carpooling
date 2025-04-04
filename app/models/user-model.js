// 使用模块导出语法定义一个函数，该函数接收两个参数：sequelize 和 Sequelize
// 这个函数将创建并返回 User 模型
module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    // 使用 sequelize 对象的 define 方法定义一个新的模型，命名为 User
    const User = sequelize.define('users', {
        // 在这里定义模型的属性和它们的类型以及一些规则
        userPhone: {
            // 用户的手机号码，长度为 11 个字符
            type: DataTypes.STRING(11),
            unique: true
        },
        real_status: {
            // 实名状态：0-未实名 1-已实名
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        real_name: {
            // 用户的真实姓名，长度最大为 20 个字符
            type: DataTypes.STRING(20)
        },
        id_number: {
            // 用户的身份证号码，长度为 18 个字符
            type: DataTypes.STRING(18),
            unique: true
        },
        nickname: {
            // 用户昵称，用于在应用中展示的个性化名称，长度最大为 50 个字符
            type: DataTypes.STRING(50)
        },
        avatar: {
            // 用户头像的 URL 地址，用于存储用户头像的图片链接，长度最大为 255 个字符
            type: DataTypes.STRING(255)
        },
        extra_info: {
            // 备用字段
            type: DataTypes.STRING,
            defaultValue: '{}'
        }
    });
    // 返回 User 模型，这样它就可以在其他地方被引用和使用
    return User;
};