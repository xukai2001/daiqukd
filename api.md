# API 接口文档

## 1. 计数相关接口

### 1.1 更新计数
- **接口**: `/api/count`
- **方法**: POST
- **用途**: 增加或清除计数
- **请求参数**: 
  ```json
  {
    "action": "inc | clear" // inc为增加计数，clear为清空计数
  }
{
  "code": 0,        // 0表示成功
  "data": number    // 当前计数值
}
- 响应 :
  ```json
  {
    "code": 0,        // 0表示成功
    "data": number    // 当前计数值
  }
   ```
### 1.2 获取计数
- 接口 : /api/count
- 方法 : GET
- 用途 : 获取当前计数值
- 响应 :
  ```json
  {
    "code": 0,
    "data": number
  }
   ```
## 2. 用户相关接口
### 2.1 获取微信OpenID
- 接口 : /api/wx_openid
- 方法 : GET
- 用途 : 获取微信用户OpenID
- 请求头 :
  - x-wx-source : 必须包含
- 响应 :
  ```json
  {
    "openid": string,
    "unionid": string | null
  }
   ```
### 2.2 用户登录/注册
- 接口 : /api/user/login
- 方法 : POST
- 用途 : 用户登录或注册
- 请求参数 :
  ```json
  {
    "wxOpenId": string
  }
   ```
- 成功响应 :
  ```json
  {
    "code": 0,
    "data": User
  }
   ```
- 错误响应 :
  ```json
  {
    "code": -1,
    "message": string
  }
   ```
### 2.3 更新用户信息
- 接口 : /api/user/profile
- 方法 : PUT
- 用途 : 更新用户个人信息
- 请求参数 :
  ```json
  {
    "wxOpenId": string,
    "nickname": string,
    "phone": string,
    "avatar": string
  }
   ```
- 响应 :
  ```json
  {
    "code": 0,
    "data": User
  }
   ```
### 2.4 获取用户信息
- 接口 : /api/user/:wxOpenId
- 方法 : GET
- 用途 : 获取指定用户信息
- 响应 :
  ```json
  {
    "code": 0,
    "data": User
  }
   ```
## 3. 配送地址相关接口
### 3.1 添加配送地址
- 接口 : /api/address
- 方法 : POST
- 用途 : 添加新的配送地址
- 请求参数 :
  ```json
  {
    "wxOpenId": string,
    "building": string,
    "unit": string,
    "room": string
  }
   ```
- 响应 :
  ```json
  {
    "code": 0,
    "data": DeliveryAddress
  }
   ```
### 3.2 获取用户地址列表
- 接口 : /api/address/:wxOpenId
- 方法 : GET
- 用途 : 获取用户所有配送地址
- 响应 :
  ```json
  {
    "code": 0,
    "data": DeliveryAddress[]
  }
   ```
### 3.3 删除配送地址
- 接口 : /api/address/:id
- 方法 : DELETE
- 用途 : 删除指定配送地址
- 响应 :
  ```json
  {
    "code": 0,
    "data": number // 删除的行数
  }
   ```
### 3.4 更新配送地址
- 接口 : /api/address/:id
- 方法 : PUT
- 用途 : 更新配送地址信息
- 请求参数 :
  ```json
  {
    "building": string,
    "unit": string,
    "room": string
  }
   ```
- 响应 :
  ```json
  {
    "code": 0,
    "data": DeliveryAddress
  }
   ```
## 4. 快递站相关接口
### 4.1 创建快递站
- 接口 : /api/station
- 方法 : POST
- 用途 : 创建新的快递站
- 请求参数 :
  ```json
  {
    "stationName": string,
    "phone": string
  }
   ```
- 响应 :
  ```json
  {
    "code": 0,
    "data": Station
  }
   ```
### 4.2 更新快递站信息
- 接口 : /api/station/:stationId
- 方法 : PUT
- 用途 : 更新快递站信息
- 请求参数 :
  ```json
  {
    "stationName": string,
    "phone": string
  }
   ```
- 响应 :
  ```json
  {
    "code": 0,
    "data": Station
  }
   ```
### 4.3 获取快递站列表
- 接口 : /api/stations
- 方法 : GET
- 用途 : 获取所有快递站列表
- 响应 :
  ```json
  {
    "code": 0,
    "data": Station[]
  }
   ```
### 4.4 获取快递站详情
- 接口 : /api/station/:stationId
- 方法 : GET
- 用途 : 获取指定快递站详情
- 响应 :
  ```json
  {
    "code": 0,
    "data": Station
  }
   ```
## 5. 订单相关接口

### 5.1 创建订单
- **接口**: `/api/order`
- **方法**: POST
- **用途**: 创建新的配送订单
- **请求参数**: 
  ```json
  {
    "wxOpenId": string,         // 下单用户openid（必填）
    "stationId": number,        // 所属快递站ID（必填）
    "pickupCode": string,       // 取件码（必填）
    "deliveryTimeSlot": number, // 配送时间段ID（必填）
    "orderType": "normal" | "instant",  // 订单类型（必填）：普通单或即时单
    "itemType": "normal" | "valuable"   // 物品类型（必填）：普通物品或贵重物品
  }
   ```
- 成功响应 :
```json
{
  "code": 0,
  "data": {
    "orderNo": string,        // 系统生成的订单编号
    "status": string,         // 订单状态（默认：waiting_pickup）
    "orderTime": string,      // 下单时间
    "wxOpenId": string,       // 下单用户openid
    "stationId": number,      // 所属快递站ID
    "pickupCode": string,     // 取件码
    "deliveryTimeSlot": number, // 配送时间段ID
    "amount": number,         // 订单金额（默认：2.00）
    "orderType": string,      // 订单类型
    "itemType": string,       // 物品类型
    "courierId": number      // 系统分配的配送员ID
  }
}
 ```
```
- 错误响应 :
```json
{
  "code": -1,
  "message": string  // 错误信息
}
 ```
- 说明 :
1. 订单编号由系统自动生成（年月日时分秒+4位随机数）
2. 订单状态默认为"待取件"(waiting_pickup)
3. 下单时间由系统自动生成
4. 订单金额默认为2.00元
5. 系统会自动分配一个状态为"接单中"的配送员

### 5.2 获取用户订单列表
- **接口**: `/api/orders/:wxOpenId`
- **方法**: GET
- **用途**: 获取指定用户的订单列表
- **路径参数**: 
  - wxOpenId: string // 用户的OpenID
- **查询参数**: 
  ```json
  {
    "status": string,  // 可选，订单状态：waiting_pickup/waiting_delivery/cancelled/waiting_payment/in_custody
    "page": number,    // 可选，当前页码，默认1
    "pageSize": number // 可选，每页条数，默认20
  }
- 成功响应 :
```json
{
  "code": 0,
  "data": {
    "total": number,      // 总记录数
    "list": [            // 订单列表
      {
        "orderNo": string,        // 订单编号
        "status": string,         // 订单状态
        "orderTime": string,      // 下单时间
        "pickupCode": string,     // 取件码
        "amount": number,         // 订单金额
        "orderType": string,      // 订单类型
        "itemType": string,       // 物品类型
        "DeliveryTimeSlot": {     // 配送时间段信息
          "timeSlot": string
        },
        "Station": {              // 快递站信息
          "stationName": string,
          "phone": string
        },
        "Courier": {              // 配送员信息
          "name": string,
          "phone": string
        }
        // 在成功响应的list数组中的订单对象内添加操作记录字段
        {
          "code": 0,
          "data": {
            "total": number,      // 总记录数
            "list": [            // 订单列表
              {
                "orderNo": string,        // 订单编号
                "status": string,         // 订单状态
                "orderTime": string,      // 下单时间
                "pickupCode": string,     // 取件码
                "amount": number,         // 订单金额
                "orderType": string,      // 订单类型
                "itemType": string,       // 物品类型
                "DeliveryTimeSlot": {     // 配送时间段信息
                  "timeSlot": string
                },
                "Station": {              // 快递站信息
                  "stationName": string,
                  "phone": string
                },
                "Courier": {              // 配送员信息
                  "name": string,
                  "phone": string
                }
                "OrderOperationLogs": [   // 订单操作记录
                  {
                    "operationTime": string,  // 操作时间
                    "description": string     // 操作描述
                  }
                ]
              }
            ],
            "page": number,      // 当前页码
            "pageSize": number,  // 每页条数
            "totalPages": number // 总页数
          }
        }
      }
    ],
    "page": number,      // 当前页码
    "pageSize": number,  // 每页条数
    "totalPages": number // 总页数
  }
}
 ```
```
- 错误响应 :
```json
{
  "code": -1,
  "message": string
}
 ```
- 说明 :
1. 订单按下单时间倒序排列
2. 默认每页显示20条记录
3. 如果不传status参数，则查询所有状态的订单
4. 返回结果包含关联的配送时间段、快递站和配送员信息
## 通用响应格式
所有接口都遵循以下响应格式：

- code : 0表示成功，-1表示失败
- data : 返回的数据
- message : 错误时的错误信息