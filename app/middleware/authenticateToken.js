// 引入 jwtUtils 模块中的 verifyToken 函数
const { verifyToken } = require('../utils/jwtUtils');

// 定义 authenticateToken 中间件函数，用于验证请求中的 JWT
const authenticateToken = (req, res, next) => {
  // 从请求头中获取 authorization 属性，它应该包含发送的令牌
  const authHeader = req.headers.authorization;

  
  // 假设令牌格式为 'Bearer <token>', 使用空格分割字符串并取第二部分，即令牌本身
  const token = authHeader && authHeader.split(' ')[1];

  // 如果令牌不存在，返回401状态码，表示未授权
  if (!token) {
    // console.log('没有提供令牌');
    
    return res.status(401).json({ message: '没有提供令牌' });
  }

  try {
    // 尝试使用 verifyToken 函数验证令牌的有效性
    const decoded = verifyToken(token);
    // 如果解码失败或令牌无效，抛出错误
    if (!decoded) {
      throw new Error('解码失败');
    }
    console.log('解码结果',decoded)
        // 将解码后的用户信息添加到请求对象中，以便在后续的中间件或路由处理器中使用

    req.user = decoded;
    // 如果令牌验证成功，调用 next 函数，将控制权传递给下一个中间件或路由处理器
    next();
  } catch (error) {
    console.log(error);
    
    // 如果捕获到错误，返回403状态码，表示禁止访问
    res.status(403).json({ message: '令牌无效' });
  }
};

// 导出 authenticateToken 中间件，使其可以在其他文件中使用
module.exports = authenticateToken;