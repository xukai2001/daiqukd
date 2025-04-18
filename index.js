const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
// 修改引入语句，添加 OrderOperationLog
const { init: initDB, Counter, User, DeliveryAddress, Order, Station, DeliveryTimeSlot, Courier, OrderOperationLog, sequelize } = require("./db");

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

// 添加在文件开头的工具函数部分
function generateOrderNo() {
  return `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

// 在创建订单的代码中修改
app.post("/api/order", async (req, res) => {
  const { 
    wxOpenId,           // 下单用户openid
    stationId,          // 所属快递站ID
    pickupCode,         // 取件码
    deliveryTimeSlot,   // 配送时间段ID
    phoneTail,          // 手机尾号
    receiverName,       // 收件人姓名
    orderType = 'normal',    // 订单类型，默认为普通单
    itemType = 'normal'      // 物品类型，默认为普通物品
  } = req.body;
  // 看后端没啥问题，我觉得问题出在你掉接口的地方
  
  try {
    // 参数校验
    if (!wxOpenId || !stationId || !pickupCode || !deliveryTimeSlot || !phoneTail || !receiverName) {
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
        message: "用户不存在，请先注册"
      });
      return;
    }

    // 验证用户类型
    if (user.userType === 'blacklist') {
      res.send({
        code: -1,
        message: "您已被列入黑名单，暂时无法下单"
      });
      return;
    }

    // 检查用户是否有足够的下单额度
    if (user.remainingOrders <= 0) {
      res.send({
        code: -1,
        message: "下单额度不足，请先充值"
      });
      return;
    }

    // 开启事务
    const t = await sequelize.transaction();

    try {
      // 扣减用户下单额度
      await user.update({
        remainingOrders: user.remainingOrders - 1
      }, { transaction: t });

      // 创建订单
      const order = await Order.create({
        orderNo: generateOrderNo(),
        status: 'waiting_pickup',
        orderTime: new Date(),
        wxOpenId,
        stationId,
        pickupCode,
        deliveryTimeSlot,
        orderType,
        itemType,
        phoneTail,
        receiverName,    // 添加收件人姓名
        courierId: await getDefaultCourierId()
      }, { transaction: t });

      await t.commit();

      res.send({
        code: 0,
        data: order
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
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

    // 查找订单
    const order = await Order.findOne({ where: { orderNo } });
    if (!order) {
      res.send({
        code: -1,
        message: "订单不存在"
      });
      return;
    }

    // 定义状态转换规则
    const statusTransitionRules = {
      'waiting_pickup': ['cancelled', 'waiting_delivery'],
      'waiting_delivery': ['waiting_payment', 'in_custody'],
      'cancelled': [],
      'waiting_payment': [],
      'completed': [],
      'in_custody': ['waiting_payment']
    };

    // 获取当前状态允许转换的状态列表
    const allowedStatus = statusTransitionRules[order.status] || [];

    // 验证状态转换是否合法
    if (!allowedStatus.includes(status)) {
      res.send({
        code: -1,
        message: `当前订单状态为"${order.status}"，不允许修改为"${status}"状态`
      });
      return;
    }

    // 开启事务
    const t = await sequelize.transaction();

    try {
      // 如果是取消订单，需要返还用户的下单额度
      if (status === 'cancelled') {
        const user = await User.findOne({ 
          where: { wxOpenId: order.wxOpenId },
          transaction: t 
        });
        
        if (user) {
          await user.update({
            remainingOrders: user.remainingOrders + 1
          }, { transaction: t });
        }
      }

      // 更新订单状态
      await order.update({ status }, { transaction: t });

      await t.commit();

      res.send({
        code: 0,
        data: order
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (e) {
    console.error('更新订单状态失败:', e);
    res.send({
      code: -1,
      message: `更新订单状态失败: ${e.message}`
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

// 获取配送员列表
app.get("/api/couriers", async (req, res) => {
  try {
    const couriers = await Courier.findAll({
      attributes: { exclude: ['password'] }  // 排除密码字段
    });
    res.send({
      code: 0,
      data: couriers
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "获取配送员列表失败"
    });
  }
});

// 检查用户是否是配送员
app.get("/api/courier/check/:wxOpenId", async (req, res) => {
  const { wxOpenId } = req.params;
  try {
    const courier = await Courier.findOne({
      where: { wxOpenId },
      attributes: ['id']  // 只查询ID字段即可
    });
    res.send({
      code: 0,
      data: {
        isCourier: !!courier
      }
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "检查配送员状态失败"
    });
  }
});

// 添加配送员
app.post("/api/courier", async (req, res) => {
  const { phone, name, password } = req.body;
  
  try {
    // 参数校验
    if (!phone || !name || !password) {
      res.send({
        code: -1,
        message: "手机号、姓名和密码不能为空"
      });
      return;
    }

    // 检查手机号是否已存在
    const existingCourier = await Courier.findOne({ where: { phone } });
    if (existingCourier) {
      res.send({
        code: -1,
        message: "该手机号已注册"
      });
      return;
    }

    // 创建配送员
    const courier = await Courier.create({
      phone,
      name,
      password,
      status: '接单中'  // 默认状态为接单中
    });

    // 返回结果时排除密码字段
    const { password: _, ...courierData } = courier.toJSON();
    res.send({
      code: 0,
      data: courierData
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "添加配送员失败"
    });
  }
});

// 配送员登录
app.post("/api/courier/login", async (req, res) => {
  const { wxOpenId, phone, password } = req.body;
  
  try {
    // 参数校验
    if (!wxOpenId || !phone || !password) {
      res.send({
        code: -1,
        message: "微信ID、手机号和密码不能为空"
      });
      return;
    }

    // 根据手机号查询配送员
    const courier = await Courier.findOne({ where: { phone } });
    if (!courier) {
      res.send({
        code: -1,
        message: "配送员不存在"
      });
      return;
    }

    // 验证密码
    if (courier.password !== password) {
      res.send({
        code: -1,
        message: "密码错误"
      });
      return;
    }

    // 更新微信OpenID
    await courier.update({ wxOpenId });

    // 返回结果时排除密码字段
    const { password: _, ...courierData } = courier.toJSON();
    res.send({
      code: 0,
      data: courierData
    });
  } catch (e) {
    res.send({
      code: -1,
      message: "配送员登录失败"
    });
  }
});
// 获取充值套餐列表
app.get("/api/recharge/plans", async (req, res) => {
  res.send({
    code: 0,
    data: config.recharge.plans
  });
});

// 创建充值订单
app.post("/api/recharge", async (req, res) => {
  const { wxOpenId, amount } = req.body;
  
  try {
    // 参数校验
    if (!wxOpenId || !amount) {
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

    // 验证充值金额是否有效
    const plan = config.recharge.plans.find(p => p.amount === parseFloat(amount));
    if (!plan) {
      res.send({
        code: -1,
        message: "无效的充值金额"
      });
      return;
    }

    // 创建充值记录
    const recharge = await RechargeRecord.create({
      wxOpenId,
      amount: plan.amount,
      orderCount: plan.orderCount,
      status: 'pending'
    });

    res.send({
      code: 0,
      data: recharge
    });
  } catch (e) {
    console.error('创建充值订单失败:', e);
    res.send({
      code: -1,
      message: "创建充值订单失败"
    });
  }
});

// 充值成功回调（实际项目中需要验证微信支付签名等）
app.post("/api/recharge/callback", async (req, res) => {
  const { transactionId, prepayId, wxOpenId, amount } = req.body;
  
  try {
    // 查找充值记录
    const recharge = await RechargeRecord.findOne({
      where: {
        wxOpenId,
        amount,
        status: 'pending'
      }
    });

    if (!recharge) {
      res.send({
        code: -1,
        message: "充值记录不存在"
      });
      return;
    }

    // 开启事务
    const t = await sequelize.transaction();

    try {
      // 更新充值记录状态
      await recharge.update({
        status: 'success',
        transactionId,
        prepayId,
        payTime: new Date()
      }, { transaction: t });

      // 更新用户下单额度
      const user = await User.findOne({ where: { wxOpenId }, transaction: t });
      await user.update({
        remainingOrders: user.remainingOrders + recharge.orderCount
      }, { transaction: t });

      await t.commit();

      res.send({
        code: 0,
        data: recharge
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (e) {
    console.error('处理充值回调失败:', e);
    res.send({
      code: -1,
      message: "处理充值回调失败"
    });
  }
});

const port = config.system.port;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
