const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// 修改引入语句，添加 OrderOperationLog
const { init: initDB, Counter, User, DeliveryAddress, Order, Station, DeliveryTimeSlot, Courier, OrderOperationLog } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send({
      openid: req.headers["x-wx-openid"],
      unionid: req.headers["x-wx-unionid"] || null // 可能为空
    });
  }
});

// 用户注册/登录
app.post("/api/user/login", async (req, res) => {
  const { wxOpenId } = req.body;
  
  // 参数校验
  if (!wxOpenId) {
    res.send({
      code: -1,
      message: `无效的请求参数，当前请求体: ${JSON.stringify(req.body)}`
    });
    return;
  }

  try {
    let user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      user = await User.create({ wxOpenId });
    }
    res.send({
      code: 0,
      data: user,
    });
  } catch (e) {
    console.error('登录失败:', e);
    res.send({
      code: -1,
      message: `登录失败，请求体: ${JSON.stringify(req.body)}, 错误信息: ${e.message}`
    });
  }
});

// 更新用户信息
app.put("/api/user/profile", async (req, res) => {
  const { wxOpenId, nickname, phone, avatar } = req.body;
  try {
    const user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      res.send({
        code: -1,
        message: "用户不存在",
      });
      return;
    }
    
    await user.update({
      nickname,
      phone,
      avatar,
    });
    
    res.send({
      code: 0,
      data: user,
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "更新失败",
    });
  }
});

// 获取用户信息
app.get("/api/user/:wxOpenId", async (req, res) => {
  const { wxOpenId } = req.params;
  try {
    const user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      res.send({
        code: -1,
        message: "用户不存在",
      });
      return;
    }
    res.send({
      code: 0,
      data: user,
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "获取用户信息失败",
    });
  }
});

// 添加配送地址
app.post("/api/address", async (req, res) => {
  const { wxOpenId, building, unit, room } = req.body;
  try {
    const user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      res.send({
        code: -1,
        message: "用户不存在"
      });
      return;
    }
    
    const address = await DeliveryAddress.create({
      wxOpenId,
      building,
      unit,
      room
    });
    
    res.send({
      code: 0,
      data: address
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "添加地址失败"
    });
  }
});

// 获取用户的所有配送地址
app.get("/api/address/:wxOpenId", async (req, res) => {
  const { wxOpenId } = req.params;
  try {
    const addresses = await DeliveryAddress.findAll({
      where: { wxOpenId }
    });
    res.send({
      code: 0,
      data: addresses
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "获取地址列表失败"
    });
  }
});

// 删除配送地址
app.delete("/api/address/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await DeliveryAddress.destroy({
      where: { id }
    });
    res.send({
      code: 0,
      data: result
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "删除地址失败"
    });
  }
});

// 更新配送地址
app.put("/api/address/:id", async (req, res) => {
  const { id } = req.params;
  const { building, unit, room } = req.body;
  try {
    const address = await DeliveryAddress.findByPk(id);
    if (!address) {
      res.send({
        code: -1,
        message: "地址不存在"
      });
      return;
    }
    
    await address.update({
      building,
      unit,
      room
    });
    
    res.send({
      code: 0,
      data: address
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "更新地址失败"
    });
  }
});

// 创建快递站
app.post("/api/station", async (req, res) => {
  const { stationName, phone } = req.body;
  try {
    const station = await Station.create({
      stationName,
      phone
    });
    res.send({
      code: 0,
      data: station
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "创建快递站失败"
    });
  }
});

// 更新快递站信息
app.put("/api/station/:stationId", async (req, res) => {
  const { stationId } = req.params;
  const { stationName, phone } = req.body;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      res.send({
        code: -1,
        message: "快递站不存在"
      });
      return;
    }
    
    await station.update({
      stationName,
      phone
    });
    
    res.send({
      code: 0,
      data: station
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "更新快递站信息失败"
    });
  }
});

// 获取快递站列表
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await Station.findAll();
    res.send({
      code: 0,
      data: stations
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "获取快递站列表失败"
    });
  }
});


// 获取快递站详情
app.get("/api/station/:stationId", async (req, res) => {
  const { stationId } = req.params;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      res.send({
        code: -1,
        message: "快递站不存在"
      });
      return;
    }
    res.send({
      code: 0,
      data: station
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "获取快递站信息失败"
    });
  }
});

// 创建订单
app.post("/api/order", async (req, res) => {
  const { 
    wxOpenId,           // 下单用户openid
    stationId,          // 所属快递站ID
    pickupCode,         // 取件码
    deliveryTimeSlot,   // 配送时间段ID
    orderType,          // 订单类型
    itemType,           // 物品类型
    phoneTail           // 新增手机尾号
  } = req.body;
  
  try {
    // 参数校验
    if (!wxOpenId || !stationId || !pickupCode || !deliveryTimeSlot || !orderType || !itemType || !phoneTail) {
      res.send({
        code: -1,
        message: "缺少必要参数"
      });
      return;
    }

    // 验证用户是否存在
    const user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      res.send({
        code: -1,
        message: "用户不存在"
      });
      return;
    }

    // 验证快递站是否存在
    const station = await Station.findByPk(stationId);
    if (!station) {
      res.send({
        code: -1,
        message: "快递站不存在"
      });
      return;
    }

    // 验证配送时间段是否存在
    const timeSlot = await DeliveryTimeSlot.findByPk(deliveryTimeSlot);
    if (!timeSlot) {
      res.send({
        code: -1,
        message: "配送时间段不存在"
      });
      return;
    }

    // 获取默认配送员
    const courier = await Courier.findOne({
      where: {
        status: '接单中'
      }
    });

    // 生成订单编号（年月日时分秒+4位随机数）
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0') +
                   now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNo = dateStr + randomNum;

    // 创建订单
    const order = await Order.create({
      orderNo,                    // 系统生成的订单编号
      status: 'waiting_pickup',   // 默认待取件状态
      orderTime: now,             // 系统生成的下单时间
      wxOpenId,                   // 下单用户openid
      stationId,                  // 所属快递站ID
      pickupCode,                 // 取件码
      deliveryTimeSlot,           // 配送时间段ID
      amount: 2.00,               // 默认金额2.00
      orderType,                  // 订单类型
      itemType,                   // 物品类型
      phoneTail,         // 新增手机尾号
      courierId: courier ? courier.id : null  // 关联默认配送员
    });

    res.send({
      code: 0,
      data: order
    });
  } catch (e) {
    console.error('创建订单失败:', e);
    res.send({
      code: -1,
      message: `创建订单失败: ${e.message}`
    });
  }
});

// 获取用户订单列表接口
app.get("/api/orders/:wxOpenId", async (req, res) => {
  const { wxOpenId } = req.params;
  const { status, page = 1, pageSize = 20 } = req.query;
  
  try {
    // 参数校验
    if (!wxOpenId) {
      res.send({
        code: -1,
        message: "用户ID不能为空"
      });
      return;
    }

    // 先验证用户是否存在
    const user = await User.findOne({ where: { wxOpenId } });
    if (!user) {
      res.send({
        code: -1,
        message: "用户不存在"
      });
      return;
    }

    // 构建查询条件
    const where = { wxOpenId };
    if (status) {
      where.status = status;
    }

    try {
      // 查询订单总数
      const total = await Order.count({ where });

      // 分页查询订单
      const orders = await Order.findAll({
        where,
        order: [['orderTime', 'DESC']],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        include: [
          {
            model: DeliveryTimeSlot,
            attributes: ['timeSlot'],
            required: false  // 使用左连接
          },
          {
            model: Station,
            attributes: ['stationName', 'phone'],
            required: false
          },
          {
            model: Courier,
            attributes: ['name', 'phone'],
            required: false
          },
          {
            model: OrderOperationLog,
            attributes: ['operationTime', 'description'],
            required: false,
            order: [['operationTime', 'DESC']]
          }
        ]
      });

      res.send({
        code: 0,
        data: {
          total,
          list: orders,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (queryError) {
      console.error('查询订单失败:', queryError);
      res.send({
        code: -1,
        message: `查询订单失败: ${queryError.message}`
      });
    }
  } catch (e) {
    console.error('获取订单列表失败:', e);
    res.send({
      code: -1,
      message: `获取订单列表失败: ${e.message}`
    });
  }
});

// 更新订单状态
app.put("/api/order/status", async (req, res) => {
  const { orderNo, status } = req.body;
  
  try {
    // 参数校验
    if (!orderNo || !status) {
      res.send({
        code: -1,
        message: "订单编号和状态不能为空"
      });
      return;
    }

    // 验证状态值是否合法
    const validStatus = ['waiting_pickup', 'waiting_delivery', 'cancelled', 'waiting_payment', 'in_custody','completed'];
    if (!validStatus.includes(status)) {
      res.send({
        code: -1,
        message: "无效的订单状态"
      });
      return;
    }

    // 查找订单
    const order = await Order.findOne({ where: { orderNo } });
    if (!order) {
      res.send({
        code: -1,
        message: "订单不存在"
      });
      return;
    }

    // 更新订单状态
    await order.update({ status });

    res.send({
      code: 0,
      data: order
    });
  } catch (e) {
    console.error('更新订单状态失败:', e);
    res.send({
      code: -1,
      message: "更新订单状态失败"
    });
  }
});

// 获取配送时间段列表
app.get("/api/delivery-time-slots", async (req, res) => {
  try {
    const timeSlots = await DeliveryTimeSlot.findAll({
      order: [['timeSlot', 'ASC']] // 按时间段升序排列
    });
    res.send({
      code: 0,
      data: timeSlots
    });
  } catch (e) {
    console.error('获取配送时间段列表失败:', e);
    res.send({
      code: -1,
      message: "获取配送时间段列表失败"
    });
  }
});

// 获取用户是否存在待支付订单
app.get("/api/user/has-unpaid-order/:wxOpenId", async (req, res) => {
  const { wxOpenId } = req.params;
  
  try {
    // 参数校验
    if (!wxOpenId) {
      res.send({
        code: -1,
        message: "用户ID不能为空"
      });
      return;
    }

    // 查询该用户是否存在待支付订单
    const unpaidOrder = await Order.findOne({
      where: {
        wxOpenId,
        status: 'waiting_payment'
      }
    });

    res.send({
      code: 0,
      data: {
        hasUnpaidOrder: !!unpaidOrder
      }
    });
  } catch (e) {
    console.error('查询待支付订单失败:', e);
    res.send({
      code: -1,
      message: "查询待支付订单失败"
    });
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
