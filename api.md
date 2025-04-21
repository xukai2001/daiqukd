# 代取库API文档

## 目录
- [用户相关接口](#用户相关接口)
- [地址相关接口](#地址相关接口)
- [快递站相关接口](#快递站相关接口)
- [订单相关接口](#订单相关接口)
- [配送时间段相关接口](#配送时间段相关接口)

## 用户相关接口

### 1. 用户登录/注册
- **接口地址**：`/api/user/login`
- **请求方式**：POST
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | wxOpenId | string | 是 | 微信OpenID |

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "wxOpenId": "xxx",
      "nickname": "用户昵称",
      "phone": "手机号",
      "avatar": "头像URL"
    }
  }
### 2. 更新用户信息
- **接口地址**：`/api/user/profile`
- **请求方式**：PUT
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明       |
  |----------|--------|------|------------|
  | wxOpenId | string | 是   | 微信OpenID |
  | nickname | string | 否   | 用户昵称   |
  | phone    | string | 否   | 手机号     |
  | avatar   | string | 否   | 头像URL    |

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "wxOpenId": "xxx",
      "nickname": "更新后的昵称",
      "phone": "更新后的手机号",
      "avatar": "更新后的头像URL"
    }
  }
### 3. 获取用户信息
- **接口地址**：`/api/user/:wxOpenId`
- **请求方式**：GET
- **路径参数**：
  | 参数名   | 类型   | 必填 | 说明       |
  |----------|--------|------|------------|
  | wxOpenId | string | 是   | 微信OpenID |

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "wxOpenId": "xxx",
      "nickname": "用户昵称",
      "phone": "手机号",
      "avatar": "头像URL",
      "userType": "normal",// 用户类型 normal-普通用户 vip-vip用户 blacklist-黑名单用户
      "remainingOrders": 0// 剩余订单数量
    }
  }
   ```
## 地址相关接口
### 1. 添加配送地址
- **接口地址**：`/api/address`
- **请求方式**：POST
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明       |
  |----------|--------|------|------------|
  | wxOpenId | string | 是   | 微信OpenID |
  | building | string | 是   | 楼栋号     |
  | unit     | string | 是   | 单元号     |
  | room     | string | 是   | 房间号     |

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "wxOpenId": "xxx",
      "building": "1",
      "unit": "2",
      "room": "303"
    }
  }
### 2. 获取用户配送地址列表
- 接口地址 ： /api/address/:wxOpenId
- 请求方式 ：GET
- **路径参数**：
  | 参数名   | 类型   | 必填 | 说明       |
  |----------|--------|------|------------|
  | wxOpenId | string | 是   | 微信OpenID |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 1,
        "wxOpenId": "xxx",
        "building": "1",
        "unit": "2",
        "room": "303"
      }
    ]
  }
   ```
### 3. 删除配送地址
- 接口地址 ： /api/address/:id
- 请求方式 ：DELETE
- **路径参数**：
  | 参数名 | 类型   | 必填 | 说明   |
  |--------|--------|------|--------|
  | id     | number | 是   | 地址ID |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": 1
  }
   ```
### 4. 更新配送地址
- 接口地址 ： /api/address/:id
- 请求方式 ：PUT
- **路径参数**：
  | 参数名 | 类型   | 必填 | 说明   |
  |--------|--------|------|--------|
  | id     | number | 是   | 地址ID |
- - **请求参数**：
  | 参数名   | 类型   | 必填 | 说明   |
  |----------|--------|------|--------|
  | building | string | 是   | 楼栋号 |
  | unit     | string | 是   | 单元号 |
  | room     | string | 是   | 房间号 |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "building": "1",
      "unit": "2",
      "room": "303"
    }
  }
   ```
## 快递站相关接口
### 1. 创建快递站
- 接口地址 ： /api/station
- 请求方式 ：POST
- **请求参数**：
  | 参数名     | 类型   | 必填 | 说明       |
  |------------|--------|------|------------|
  | stationName | string | 是   | 快递站名称 |
  | phone      | string | 是   | 联系电话   |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "stationName": "快递站名称",
      "phone": "联系电话"
    }
  }
   ```
### 2. 更新快递站信息
- 接口地址 ： /api/station/:stationId
- 请求方式 ：PUT
- **路径参数**：
  | 参数名    | 类型   | 必填 | 说明     |
  |-----------|--------|------|----------|
  | stationId | number | 是   | 快递站ID |
- - **请求参数**：
  | 参数名      | 类型   | 必填 | 说明       |
  |-------------|--------|------|------------|
  | stationName | string | 是   | 快递站名称 |
  | phone       | string | 是   | 联系电话   |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "stationName": "更新后的快递站名称",
      "phone": "更新后的联系电话"
    }
  }
   ```
### 3. 获取快递站列表
- 接口地址 ： /api/stations
- 请求方式 ：GET
- 返回示例 ：
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 1,
        "stationName": "快递站1",
        "phone": "电话1"
      },
      {
        "id": 2,
        "stationName": "快递站2",
        "phone": "电话2"
      }
    ]
  }
   ```
### 4. 获取快递站详情
- 接口地址 ： /api/station/:stationId
- 请求方式 ：GET
- **路径参数**：
  | 参数名    | 类型   | 必填 | 说明     |
  |-----------|--------|------|----------|
  | stationId | number | 是   | 快递站ID |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "stationName": "快递站名称",
      "phone": "联系电话"
    }
  }
   ```
## 订单相关接口
### 1. 创建订单
- 接口地址 ： /api/order
- 请求方式 ：POST
- **请求参数**：
  | 参数名           | 类型   | 必填 | 说明         |
  |------------------|--------|------|--------------|
  | wxOpenId         | string | 是   | 用户OpenID   |
  | stationId        | number | 是   | 快递站ID     |
  | pickupCode       | string | 是   | 取件码       |
  | deliveryTimeSlot | number | 是   | 配送时间段ID |
  | orderType        | string | 是   | 订单类型     |
  | itemType         | string | 是   | 物品类型     |
  | phoneTail        | string | 是   | 手机尾号(4位)|
  | receiverName     | string | 是   | 收件人姓名   |

- **业务规则**：
  1. 用户必须存在且不在黑名单中
  2. 用户必须有足够的下单额度
  3. 黑名单用户不允许下单

- **错误码说明**：
  | 错误信息                    | 说明               |
  |----------------------------|-------------------|
  | "用户不存在，请先注册"      | 用户未注册         |
  | "您已被列入黑名单，暂时无法下单" | 黑名单用户        |
  | "下单额度不足，请先充值"     | 用户额度不足       |

- 返回示例 ：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "orderNo": "202308150001",
      "status": "waiting_pickup",
      "orderTime": "2023-08-15 10:00:00",
      "amount": 2.00,
      "wxOpenId": "xxx",
      "stationId": 1,
      "pickupCode": "A123",
      "deliveryTimeSlot": 1,
      "orderType": "普通",
      "itemType": "快递",
      "phoneTail": "5678",
      "receiverName": "张三",
      "courierId": 1
    }
  }
### 2. 获取用户订单列表
- 接口地址 ： /api/orders/:wxOpenId
- 请求方式 ：GET
- **路径参数**：
  | 参数名   | 类型   | 必填 | 说明       |
  |----------|--------|------|------------|
  | wxOpenId | string | 是   | 微信OpenID |
- **查询参数**：
  | 参数名   | 类型   | 必填 | 说明               |
  |----------|--------|------|--------------------|
  | status   | string | 否   | 订单状态           |
  | page     | number | 否   | 页码，默认1        |
  | pageSize | number | 否   | 每页条数，默认20   |
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": {
      "total": 100,
      "list": [
        {
          "id": 1,
          "orderNo": "202308150001",
          "status": "waiting_pickup",
          "orderTime": "2023-08-15 10:00:00",
          "amount": 2.00,
          "DeliveryTimeSlot": {
            "timeSlot": "10:00-12:00"
          },
          "Station": {
            "stationName": "快递站名称",
            "phone": "联系电话"
          },
          "Courier": {
            "name": "配送员姓名",
            "phone": "配送员电话"
          },
          "OrderOperationLogs": [
            {
              "operationTime": "2023-08-15 10:00:00",
              "description": "订单创建"
            }
          ]
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
   ```
### 3. 更新订单状态
- 接口地址 ： /api/order/status
- 请求方式 ：PUT
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明                                                                 |
  |----------|--------|------|----------------------------------------------------------------------|
  | orderNo  | string | 是   | 订单编号                                                             |
  | status   | string | 是   | 订单状态(waiting_pickup/waiting_delivery/cancelled/waiting_payment/in_custody/completed) |

- **状态转换规则**：
  | 当前状态        | 允许转换的状态                    |
  |-----------------|-----------------------------------|
  | waiting_pickup  | cancelled, waiting_delivery       |
  | waiting_delivery| waiting_payment, in_custody       |
  | cancelled      | 不允许转换到其他状态              |
  | waiting_payment | 不允许转换到其他状态              |
  | completed      | 不允许转换到其他状态              |
  | in_custody     | waiting_payment                    |
错误示例 ：
```json
{
  "code": -1,
  "message": "当前订单状态为\"waiting_pickup\"，不允许修改为\"completed\"状态"
}
   ```
### 4. 获取各快递站待取件订单数量
- **接口地址**：`/api/station/waiting-pickup-orders`
- **请求方式**：GET
- **请求参数**：无

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": [
      {
        "stationId": 1,
        "stationName": "快递站名称",
        "phone": "联系电话",
        "waitingPickupCount": 10
      }
    ]
  }
   ```
### 5. 获取各楼栋待配送订单数量
- 接口地址 ： /api/building/waiting-delivery-orders
- 请求方式 ：GET
- 请求参数 ：无
- 返回示例 ：
  
  ```json
  {
    "code": 0,
    "data": [
      {
        "building": "1栋",
        "waitingDeliveryCount": 5
      }
    ]
  }
   ```
## 配送员相关接口

### 1. 检查手机号是否是配送员
- **接口地址**：`/api/courier/check/:phone`
- **请求方式**：GET
- **路径参数**：
  | 参数名 | 类型   | 必填 | 说明   |
  |--------|--------|------|--------|
  | phone  | string | 是   | 手机号 |

- **返回示例**：
  ```json
  {
    "code": 0,
    "data": {
      "isCourier": true  // true表示是配送员，false表示不是配送员
    }
  }