// 导入jsonwebtoken库，用于创建和验证JSON Web Tokens
const jwt = require('jsonwebtoken');

// 直接在代码中设置JWT的密钥，这里使用了一个示例密钥
// 注意：在实际应用中，密钥应该保密，不要将其硬编码在代码中
// 应该使用环境变量或其他安全措施来管理密钥
const JWT_SECRET = 'hahawoshitianxiadiyi';

// 定义一个函数signToken，用于签发JWT
// 该函数接收一个参数userId，代表用户的ID
// 然后使用userId作为JWT的负载（payload）的一部分
// JWT_SECRET作为签名的密钥，expiresIn参数定义了JWT的有效期为1小时
const signToken = (userId) => {
  // 使用jwt.sign方法生成一个签名的token
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// 定义一个函数verifyToken，用于验证JWT的有效性
// 该函数接收一个参数token，代表需要验证的JWT
const verifyToken = (token) => {
  try {
    // 使用jwt.verify方法验证token
    // 如果token有效，返回解码后的负载（payload）
    return jwt.verify(token, JWT_SECRET);
  } catch {
    // 如果token无效或验证过程中发生错误，捕获异常并返回null
    return null;
  }
};

// 导出signToken和verifyToken函数，以便在其他文件中使用
module.exports = { signToken, verifyToken };