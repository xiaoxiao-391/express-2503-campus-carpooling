const WebSocket = require('ws');

class SocketManager {
  constructor() {
    this.clients = new Map(); // 保存所有连接的客户端，键为用户ID
  }
  
  // 初始化WebSocket服务器
  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      // 从URL中获取用户ID
      const userId = this.extractUserIdFromUrl(req.url);
      
      // 存储客户端连接
      this.addClient(userId, ws);
      
      // 处理消息
      ws.on('message', (message) => {
        this.handleMessage(message, userId);
      });
      
      // 处理连接关闭
      ws.on('close', () => {
        this.removeClient(userId);
      });
    });
  }
  
  // 从URL中提取用户ID
  extractUserIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
  
  // 添加客户端
  addClient(userId, ws) {
    this.clients.set(userId, ws);
    console.log(`用户 ${userId} 已连接`);
  }
  
  // 移除客户端
  removeClient(userId) {
    this.clients.delete(userId);
    console.log(`用户 ${userId} 已断开连接`);
  }
  
  // 处理接收到的消息
  handleMessage(messageData, senderId) {
    try {
      const message = JSON.parse(messageData);
      
      // 保存消息到数据库
      // 这里应该调用数据库操作函数，将在chatController中实现
      
      // 发送消息给接收者
      if (message.receiverId) {
        this.sendToUser(message.receiverId, {
          ...message,
          senderId
        });
      }
    } catch (error) {
      console.error('处理消息出错', error);
    }
  }
  
  // 发送消息给特定用户
  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

module.exports = new SocketManager(); 