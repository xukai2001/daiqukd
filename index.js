const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter, User, DeliveryAddress, Order, Station } = require("./db");

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
    res.send({
      code: -1,
      message: "登录失败",
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

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
