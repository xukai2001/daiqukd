const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize("nodejs_demo", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});

// 定义数据模型
const Counter = sequelize.define("Counter", {
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

// 定义用户数据模型
const User = sequelize.define("User", {
  wxOpenId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '微信 OpenID',
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '用户昵称',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '头像URL',
  }
});

// 定义配送地址模型
const DeliveryAddress = sequelize.define("DeliveryAddress", {
  building: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '楼号'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '单元号'
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '门牌号'
  },
  wxOpenId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '关联的用户OpenID'
  }
});

// 建立用户和配送地址的关联关系
User.hasMany(DeliveryAddress, {
  foreignKey: 'wxOpenId',
  sourceKey: 'wxOpenId'
});
DeliveryAddress.belongsTo(User, {
  foreignKey: 'wxOpenId',
  targetKey: 'wxOpenId'
});

// 定义订单模型
const Order = sequelize.define("Order", {
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单编号'
  },
  status: {
    type: DataTypes.ENUM('waiting_pickup', 'waiting_delivery', 'cancelled', 'waiting_payment', 'in_custody'),
    allowNull: false,
    defaultValue: 'waiting_pickup',
    comment: '订单状态：待取件、待配送、已取消、待支付、代保管'
  },
  orderTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '下单时间'
  },
  wxOpenId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '下单用户OpenID'
  },
  stationId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '所属快递站ID'
  },
  pickupCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '取件码'
  },
  deliveryTimeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '配送时间段'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '订单金额'
  },
  orderType: {
    type: DataTypes.ENUM('normal', 'instant'),
    allowNull: false,
    defaultValue: 'normal',
    comment: '订单类型：普通单、即时单'
  },
  itemType: {
    type: DataTypes.ENUM('normal', 'valuable'),
    allowNull: false,
    defaultValue: 'normal',
    comment: '物品类型：普通物品、贵重物品'
  },
});

// 建立用户和订单的关联关系
User.hasMany(Order, {
  foreignKey: 'wxOpenId',
  sourceKey: 'wxOpenId'
});
Order.belongsTo(User, {
  foreignKey: 'wxOpenId',
  targetKey: 'wxOpenId'
});

// 定义快递站模型
const Station = sequelize.define("Station", {
  stationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '快递站ID'
  },
  stationName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '快递站名称'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '快递站电话'
  }
});

// 建立快递站和订单的关联关系
Station.hasMany(Order, {
  foreignKey: 'stationId',
  sourceKey: 'stationId'
});
Order.belongsTo(Station, {
  foreignKey: 'stationId',
  targetKey: 'stationId'
});

// 修改初始化方法，添加快递站表同步
async function init() {
  await Counter.sync({ alter: true });
  await User.sync({ alter: true });
  await DeliveryAddress.sync({ alter: true });
  await Station.sync({ alter: true });
  await Order.sync({ alter: true });
}

// 修改导出，添加 Station 模型
module.exports = {
  init,
  Counter,
  User,
  DeliveryAddress,
  Order,
  Station
};
