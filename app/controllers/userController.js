// 导入bcrypt库
const bcrypt = require('bcrypt');
// 引入上一级目录中models文件夹下的index模块
// index模块通常用于导出所有模型，以便在其他文件中可以引用数据库模型
const db = require('../models/index');
// 从db对象中解构出User模型，User模型定义了数据库中users表的结构和行为
const { User, UserRole,DriverInfo } = db;
// 导入JWT工具函数
const { signToken } = require('../utils/jwtUtils');


const login = async (req, res) => {
  const { userPhone, verifyCode, role } = req.body;

  try {
    // 验证固定验证码
    if (verifyCode !== '666666') {
      return res.status(400).json({ error: '验证码错误' });
    }

    // 查找或创建用户
    let user = await User.findOne({ where: { userPhone } });
    // 自动注册新用户
    if (!user) {
      await User.create({
        userPhone,
        nickname: `用户${userPhone.slice(-4)}`,
      });

    }
    // 检测该用户是否有对应的角色
    const existingRole = await UserRole.findOne({
      where: {
        userId: user.id,
        role: Number(role)
      }
    });

    if (!existingRole) {
      // 如果没有对应的角色，为该用户创建新角色
      await UserRole.create({
        userId: user.id,
        role: Number(role)
      });
    }
    // 生成 JWT 令牌（需实现 signToken 函数）
    const token = signToken(user.id);

    res.status(200).json({
      token,
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取用户信息
const getUserInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      where: { id: Number(id) },
      include: [
        { model: UserRole, attributes: ['role'] },
        {
          model: DriverInfo, attributes: [
            'license_number',
            'vehicle_model',
            'plate_number',
            'certification_status'
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: '未找到该用户' });
    }
    console.log('user---', user.toJSON());
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 导出控制器
module.exports = { login, getUserInfo };