# 拼车系统后端接口文档

## 接口规范说明

### 1. 基础信息

- 基础 URL: `http://localhost:3000`
- 所有请求都需要在 header 中携带 token（登录接口除外）
- 请求方式: RESTful API
- 数据格式: JSON

### 2. 响应格式

所有接口响应都遵循以下格式：

```json
{
  "code": 200, // 状态码
  "data": {}, // 响应数据
  "message": "", // 成功消息
  "error": "" // 错误信息
}
```

### 3. 状态码说明

- 200: 请求成功
- 201: 创建成功
- 400: 参数错误
- 403: 权限错误
- 404: 资源未找到
- 500: 服务器错误

## 接口列表

### 用户相关接口

#### 1. 用户登录

- 请求路径: `/api/user/Login`
- 请求方式: POST
- 请求参数:

```json
{
  "userPhone": "string", // 手机号
  "verifyCode": "string", // 验证码
  "role": "number" // 角色类型
}
```

- 响应示例:

```json
{
  "code": 200,
  "token": "string",
  "userInfo": {
    "id": 1,
    "userPhone": "12345678901",
    "nickname": "用户8901"
  },
  "message": "登录成功"
}
```

#### 2. 获取用户信息

- 请求路径: `/api/user/getUserInfo/:id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": {
    "id": "number",
    "nickname": "string",
    "avatar": "string",
    "userPhone": "string",
    "real_name": "string",
    "real_status": "number",
    "roles": ["number"],
    "driverInfo": {
      "license_number": "string",
      "vehicle_model": "string",
      "plate_number": "string",
      "certification_status": "number"
    },
    "averageRating": "number",
    "totalRatings": "number"
  }
}
```

### 行程相关接口

#### 1. 获取所有行程

- 请求路径: `/api/trip/getAllTrips`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "start_name": "string",
      "start_latitude": "number",
      "start_longitude": "number",
      "end_name": "string",
      "end_latitude": "number",
      "end_longitude": "number",
      "start_time": "string",
      "total_seats": "number",
      "occupied_seats": "number",
      "trip_status": "number",
      "base_price": "number",
      "total_price": "number",
      "distance": "number",
      "publisher": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number"
      },
      "driver": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "real_name": "string",
        "real_status": "number"
      }
    }
  ]
}
```

#### 2. 获取行程详细信息

- 请求路径: `/api/trip/getTripDetail/:id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": {
    "id": "number",
    "start_name": "string",
    "start_latitude": "number",
    "start_longitude": "number",
    "end_name": "string",
    "end_latitude": "number",
    "end_longitude": "number",
    "start_time": "string",
    "total_seats": "number",
    "occupied_seats": "number",
    "trip_status": "number",
    "base_price": "number",
    "total_price": "number",
    "distance": "number",
    "publisher": {
      "id": "number",
      "nickname": "string",
      "avatar": "string",
      "userPhone": "string",
      "real_name": "string",
      "real_status": "number",
      "averageRating": "number"
    },
    "driver": {
      "id": "number",
      "nickname": "string",
      "avatar": "string",
      "userPhone": "string",
      "real_name": "string",
      "real_status": "number",
      "averageRating": "number",
      "driverInfo": {
        "license_number": "string",
        "vehicle_model": "string",
        "plate_number": "string",
        "certification_status": "number"
      }
    },
    "team_members": [
      {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number"
      }
    ]
  },
  "message": "获取行程详情成功"
}
```

#### 3. 根据状态获取行程列表

- 请求路径: `/api/trip/getTripsByStatus`
- 请求方式: GET
- 请求头: 需要 token
- 查询参数:
  - status: number 或 逗号分隔的数字（如 "0,1,2"）
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "start_name": "string",
      "start_latitude": "number",
      "start_longitude": "number",
      "end_name": "string",
      "end_latitude": "number",
      "end_longitude": "number",
      "start_time": "string",
      "total_seats": "number",
      "occupied_seats": "number",
      "trip_status": "number",
      "publisher": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number",
        "totalRatings": "number"
      },
      "driver": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number",
        "driverInfo": {
          "license_number": "string",
          "vehicle_model": "string",
          "plate_number": "string",
          "certification_status": "number"
        }
      }
    }
  ],
  "message": "获取行程列表成功"
}
```

#### 4. 获取用户发布的行程

- 请求路径: `/api/trip/getUserPublishedTrips/:user_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "start_name": "string",
      "start_latitude": "number",
      "start_longitude": "number",
      "end_name": "string",
      "end_latitude": "number",
      "end_longitude": "number",
      "start_time": "string",
      "total_seats": "number",
      "occupied_seats": "number",
      "trip_status": "number",
      "publisher": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number"
      },
      "driver": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      }
    }
  ]
}
```

#### 5. 获取用户参与的行程

- 请求路径: `/api/trip/getUserJoinedTrips/:user_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "start_name": "string",
      "start_latitude": "number",
      "start_longitude": "number",
      "end_name": "string",
      "end_latitude": "number",
      "end_longitude": "number",
      "start_time": "string",
      "total_seats": "number",
      "occupied_seats": "number",
      "trip_status": "number",
      "publisher": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number",
        "averageRating": "number"
      },
      "driver": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      }
    }
  ]
}
```

#### 6. 创建行程

- 请求路径: `/api/trip/createTrip`
- 请求方式: POST
- 请求头: 需要 token
- 请求参数:

```json
{
  "start_name": "string",
  "start_latitude": "number",
  "start_longitude": "number",
  "end_name": "string",
  "end_latitude": "number",
  "end_longitude": "number",
  "start_time": "string",
  "total_seats": "number",
  "occupied_seats": "number",
  "trip_status": "number",
  "base_price": "number",
  "total_price": "number",
  "distance": "number",
  "remark": "string",
  "extra_info": {}
}
```

- 响应示例:

```json
{
  "code": 201,
  "message": "拼车信息创建成功",
  "data": {
    "id": "number"
    // ... 其他行程信息
  }
}
```

#### 7. 更新行程

- 请求路径: `/api/trip/updateTrip/:id`
- 请求方式: PUT
- 请求头: 需要 token
- 请求参数:

```json
{
  "start_name": "string",
  "start_latitude": "number",
  "start_longitude": "number",
  "end_name": "string",
  "end_latitude": "number",
  "end_longitude": "number",
  "start_time": "string",
  "total_seats": "number",
  "occupied_seats": "number",
  "trip_status": "number",
  "base_price": "number",
  "total_price": "number",
  "distance": "number",
  "remark": "string",
  "extra_info": {}
}
```

- 响应示例:

```json
{
  "code": 200,
  "message": "行程更新成功",
  "data": {
    "id": "number"
    // ... 更新后的行程信息
  }
}
```

#### 8. 删除行程

- 请求路径: `/api/trip/deleteTrip/:id`
- 请求方式: DELETE
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "行程已删除"
}
```

#### 9. 获取用户参与的行程及其状态

- 请求路径: `/api/trip/getUserTripsByMemberStatus`
- 请求方式: GET
- 请求头: 需要 token
- 查询参数:
  - status: number // 用户在行程中的状态（如 0=待发布，1=进行中，2=待支付，3=已支付，4=待评价，5=已评价）
- 响应示例:

```json
{
  "code": 200,
  "message": "获取用户参与的行程及其状态成功",
  "data": [
    {
      "tripId": "number", // 行程ID
      "startName": "string", // 出发地名称
      "endName": "string", // 目的地名称
      "startTime": "string", // 出发时间
      "totalSeats": "number", // 总座位数
      "occupiedSeats": "number", // 已占用座位数
      "tripStatus": "number", // 行程状态
      "memberStatus": "number", // 用户在该行程中的状态
      "publisher": {
        "id": "number", // 发布者ID
        "nickname": "string", // 发布者昵称
        "avatar": "string", // 发布者头像
        "userPhone": "string", // 发布者手机号
        "real_name": "string", // 发布者真实姓名
        "real_status": "number", // 发布者真实状态
        "averageRating": "number" // 发布者平均评分
      }
    }
  ]
}
```

````


### 评价相关接口

#### 1. 创建评价

- 请求路径: `/api/rating/createRating`
- 请求方式: POST
- 请求头: 需要 token
- 请求参数:

```json
{
  "related_trip_id": "number",
  "rated_id": "number",
  "score": "number",
  "comment": "string"
}
````

- 响应示例:

```json
{
  "code": 201,
  "message": "评价成功",
  "data": {
    "id": "number",
    "score": "number",
    "comment": "string"
  }
}
```

#### 2. 获取用户收到的评价

- 请求路径: `/api/rating/getUserReceivedRatings/:user_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "score": "number",
      "comment": "string",
      "raterUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      },
      "ratedUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      },
      "trip": {
        "start_name": "string",
        "start_latitude": "number",
        "start_longitude": "number",
        "end_name": "string",
        "end_latitude": "number",
        "end_longitude": "number",
        "start_time": "string"
      }
    }
  ]
}
```

#### 3. 获取用户发出的评价

- 请求路径: `/api/rating/getUserGivenRatings/:user_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "score": "number",
      "comment": "string",
      "raterUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      },
      "ratedUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      },
      "trip": {
        "start_name": "string",
        "start_latitude": "number",
        "start_longitude": "number",
        "end_name": "string",
        "end_latitude": "number",
        "end_longitude": "number",
        "start_time": "string"
      }
    }
  ]
}
```

#### 4. 获取行程评价

- 请求路径: `/api/rating/getTripRatings/:trip_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "score": "number",
      "comment": "string",
      "raterUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      },
      "ratedUser": {
        "id": "number",
        "nickname": "string",
        "avatar": "string",
        "userPhone": "string",
        "real_name": "string",
        "real_status": "number"
      }
    }
  ]
}
```

#### 5. 获取用户评分统计

- 请求路径: `/api/rating/getUserRatingStats/:user_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "data": {
    "userId": "number",
    "averageScore": "number",
    "totalRatings": "number"
  }
}
```

### 聊天相关接口

#### 1. 获取聊天列表

- 请求路径: `/api/chat/getChatList`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "获取聊天列表成功",
  "data": [
    {
      "id": "number",
      "name": "string",
      "avatar": "string",
      "type": "string",
      "lastMessage": {
        "content": "string",
        "time": "string",
        "senderId": "number"
      },
      "unreadCount": "number"
    }
  ]
}
```

#### 2. 获取特定聊天的消息

- 请求路径: `/api/chat/getChatMessages/:chatId`
- 请求方式: GET
- 请求头: 需要 token
- 查询参数:
  - page: 页码（默认 1）
  - size: 每页消息数量（默认 20）
- 响应示例:

```json
{
  "code": 200,
  "message": "获取聊天消息成功",
  "data": [
    {
      "id": "number",
      "content": "string",
      "time": "string",
      "isSelf": "boolean",
      "sender": {
        "id": "number",
        "nickname": "string",
        "avatar": "string"
      },
      "receiver": {
        "id": "number",
        "nickname": "string",
        "avatar": "string"
      }
    }
  ]
}
```

#### 3. 发送消息

- 请求路径: `/api/chat/sendMessage/:chatId`
- 请求方式: POST
- 请求头: 需要 token
- 请求参数:

```json
{
  "content": "string"
}
```

- 响应示例:

```json
{
  "code": 201,
  "message": "消息发送成功",
  "data": {
    "id": "number",
    "content": "string",
    "time": "string"
  }
}
```

#### 4. 获取或创建私聊

- 请求路径: `/api/chat/getOrCreatePrivateChat/:targetUserId`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "已找到会话",
  "chatId": "number"
}
```

#### 5. 获取未读消息数量

- 请求路径: `/api/chat/getUnreadCount`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "获取未读消息数量成功",
  "data": {
    "total": "number",
    "chats": [
      {
        "chatId": "number",
        "count": "number"
      }
    ]
  }
}
```

#### 6. 获取通知列表

- 请求路径: `/api/notices/getNotices`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "获取通知列表成功",
  "data": [
    {
      "id": "number",
      "title": "string",
      "content": "string",
      "icon": "string",
      "time": "string",
      "isRead": "boolean"
    }
  ]
}
```

#### 7. 标记通知为已读

- 请求路径: `/api/notices/markNoticeAsRead/:noticeId`
- 请求方式: PUT
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "标记通知已读成功",
  "data": { "success": true }
}
```

### 队伍成员相关接口

#### 1. 增加队伍成员

- 请求路径: `/api/teamMembers/addTeamMember`
- 请求方式: POST
- 请求头: 需要 token
- 请求参数:

```json
{
  "trip_id": "number", // 行程ID
  "passenger_id": "number", // 乘客ID
  "amount": "number", // 乘客需支付金额
  "status": "number" // 乘客状态（0=待发布，1=待支付，2=已支付，3=待评论，4=已评论）
}
```

- 响应示例:

```json
{
  "code": 201,
  "message": "队伍成员创建成功",
  "data": {
    "id": "number", // 队伍成员ID
    "trip_id": "number", // 行程ID
    "passenger_id": "number", // 乘客ID
    "amount": "number", // 乘客需支付金额
    "status": "number" // 乘客状态
  }
}
```

#### 2. 获取队伍成员列表

- 请求路径: `/api/teamMembers/getTeamMembers/:trip_id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "获取队伍成员列表成功",
  "data": [
    {
      "id": "number", // 队伍成员ID
      "trip_id": "number", // 行程ID
      "passenger_id": "number", // 乘客ID
      "amount": "number", // 乘客需支付金额
      "status": "number", // 乘客状态
      "user": {
        "id": "number", // 用户ID
        "nickname": "string", // 昵称
        "avatar": "string" // 头像
      }
    }
  ]
}
```

#### 3. 获取特定队伍成员

- 请求路径: `/api/teamMembers/getTeamMember/:id`
- 请求方式: GET
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "获取队伍成员成功",
  "data": {
    "id": "number", // 队伍成员ID
    "trip_id": "number", // 行程ID
    "passenger_id": "number", // 乘客ID
    "amount": "number", // 乘客需支付金额
    "status": "number", // 乘客状态
    "user": {
      "id": "number", // 用户ID
      "nickname": "string", // 昵称
      "avatar": "string" // 头像
    }
  }
}
```

#### 4. 更新队伍成员

- 请求路径: `/api/teamMembers/updateTeamMember/`
- 请求方式: PUT
- 请求头: 需要 token
- 请求参数:

```json
{
  "trip_id": "number", // 行程ID
  "passenger_id": "number", // 乘客ID
  "amount": "number", // 乘客需支付金额
  "status": "number" // 乘客状态
}
```

- 响应示例:

```json
{
  "code": 200,
  "message": "队伍成员更新成功",
  "data": {
    "id": "number", 
    "trip_id": "number", // 行程ID
    "passenger_id": "number", // 乘客ID
    "amount": "number", // 乘客需支付金额
    "status": "number" // 乘客状态
  }
}
```

#### 5. 删除队伍成员

- 请求路径: `/api/teamMembers/deleteTeamMember/:id`
- 请求方式: DELETE
- 请求头: 需要 token
- 响应示例:

```json
{
  "code": 200,
  "message": "队伍成员删除成功"
}
```

## 行程状态说明

行程状态(`trip_status`)的含义：

0=待发布
1=待接单
2=已接单
3=司机已到达出发地
4=用户上车，进行中
5=已到达目的地

## 队伍成员订单状态说明

队伍成员订单状态(`status`)的含义：

- 0: 待发布
- 1：进行中
- 2: 待支付
- 3: 已支付
- 4: 待评价
- 5: 已评价

## 联调注意事项

### 1. 请求头设置

- 所有需要认证的接口都需要在请求头中设置 token：

```javascript
headers: {
    'Authorization': `Bearer ${token}`
}
```

### 2. 错误处理

- 前端需要统一处理接口返回的状态码：
  - 200/201: 正常处理响应数据
  - 400: 显示错误信息给用户
  - 403: 跳转到登录页面
  - 404: 显示"资源未找到"提示
  - 500: 显示"服务器错误"提示

### 3. 数据格式

- 所有时间字段使用 ISO 格式字符串
- 所有 ID 字段使用数字类型
- 图片 URL 使用完整路径

### 4. 分页处理

- 列表接口默认返回所有数据，如需分页请与后端协商

### 5. 文件上传

- 图片上传使用 FormData 格式
- 文件大小限制为 2MB
- 支持的图片格式：jpg、png、jpeg

### 6. 测试环境

- 测试环境地址：`http://localhost:3000`
- 生产环境地址：`http://prod.your-domain`

### 7. 联调建议

1. 先完成用户登录接口的联调
2. 确保 token 正确传递
3. 测试各个状态码的处理
4. 验证数据格式是否符合预期
5. 测试边界条件和错误情况

### 8. 常见问题

1. 401 错误：检查 token 是否正确设置
2. 403 错误：检查用户权限
3. 400 错误：检查请求参数格式
4. 跨域问题：确保已配置 CORS
5. 图片上传失败：检查文件大小和格式

### 9. 调试工具推荐

1. Postman：用于接口测试
2. Chrome DevTools：用于网络请求调试
3. Charles：用于抓包分析

### 10. 版本控制

- 接口版本：v1
- 文档版本：2.0.0
- 更新日期：2024-05-10
