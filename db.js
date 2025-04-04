const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config");

// 从配置文件读取数据库配置
const { username, password, address } = config.database;
const [host, port] = address.split(":");

const sequelize = new Sequelize(config.database.dbName, username, password, {
  host,
  port,
  dialect: "mysql",
  // 添加连接池配置
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // 添加错误重试配置
  retry: {
    max: 3
  }
});

// 定义数据模型
const Counter = sequelize.define("Counter", {
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});
// 定义配送员数据模型 (添加在其他模型定义之后，关联关系之前)
const Courier = sequelize.define("Courier", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '配送员ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '配送员姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '登录密码'
  },
  status: {
    type: DataTypes.ENUM('接单中', '休息中'),
    allowNull: false,
    defaultValue: '休息中',
    comment: '配送员状态'
  },
  wxOpenId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: '微信 OpenID'
  }
});

// 定义管理员数据模型
const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '管理员ID'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '密码'
  }
});
// 定义用户数据模型
const User = sequelize.define("User", {
  wxOpenId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '微信 OpenID',
  },
  wxUnionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: '微信 UnionID',
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
// 定义配送时间段模型（添加在Station模型之后，Order模型之前）
const DeliveryTimeSlot = sequelize.define("DeliveryTimeSlot", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '时间段ID'
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '配送时间段，如：09:00-12:00'
  }
});

// 修改Order模型中的deliveryTimeSlot字段
const Order = sequelize.define("Order", {
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单编号'
  },
  status: {
    type: DataTypes.ENUM('waiting_pickup', 'waiting_delivery', 'cancelled', 'waiting_payment', 'in_custody', 'completed'),
    allowNull: false,
    defaultValue: 'waiting_pickup',
    comment: '订单状态：待取件、待配送、已取消、待支付、代保管、已完成'
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
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所属快递站ID'
  },
  pickupCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '取件码'
  },
  deliveryTimeSlot: {
    type: DataTypes.INTEGER,  // 修改为INTEGER类型
    allowNull: false,
    comment: '配送时间段ID'
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
  phoneTail: {  // 新增手机尾号字段
    type: DataTypes.STRING(4),
    allowNull: false,
    comment: '手机尾号'
  },
  courierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的配送员ID'
  }
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

// 建立快递站和订单的关联关系
Station.hasMany(Order, {
  foreignKey: 'stationId',
  sourceKey: 'stationId'
});
Order.belongsTo(Station, {
  foreignKey: 'stationId',
  targetKey: 'stationId'
});

// 建立配送员和订单的关联关系
Courier.hasMany(Order, {
  foreignKey: 'courierId',
  sourceKey: 'id'
});
Order.belongsTo(Courier, {
  foreignKey: 'courierId',
  targetKey: 'id'
});


// 定义订单操作记录模型（添加在Order模型之后）
const OrderOperationLog = sequelize.define("OrderOperationLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '记录ID'
  },
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '关联的订单编号'
  },
  operationTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '操作时间'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '操作记录描述'
  }
});

// 建立订单和配送时间段的关联关系（添加在其他关联关系之后）
Order.belongsTo(DeliveryTimeSlot, {
  foreignKey: 'deliveryTimeSlot',
  targetKey: 'id'
});
DeliveryTimeSlot.hasMany(Order, {
  foreignKey: 'deliveryTimeSlot',
  sourceKey: 'id'
});

// 建立订单和操作记录的关联关系（添加在其他关联关系之后）
Order.hasMany(OrderOperationLog, {
  foreignKey: 'orderNo',
  sourceKey: 'orderNo'
});
OrderOperationLog.belongsTo(Order, {
  foreignKey: 'orderNo',
  targetKey: 'orderNo'
});

// 在init函数中添加模型同步（在Order之后）
async function init() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 按照依赖关系顺序同步模型
    await Counter.sync({ alter: true });
    await User.sync({ alter: true });
    await Courier.sync({ alter: true });
    await Station.sync({ alter: true });
    await DeliveryAddress.sync({ alter: true });
    await DeliveryTimeSlot.sync({ alter: true });
    await Order.sync({ alter: true });
    await OrderOperationLog.sync({ alter: true }); // 添加这一行
    await Admin.sync({ alter: true });
    
    console.log('所有模型同步完成');
    
    // 创建默认账号（合并到一个代码块）
    const [adminCount, courierCount] = await Promise.all([
      Admin.count(),
      Courier.count()
    ]);
    
    if (adminCount === 0) {
      await Admin.create({
        username: 'admin',
        password: 'admin'
      });
      console.log('已创建默认管理员账号: admin/admin');
    }
    
    if (courierCount === 0) {
      await Courier.create({
        phone: '13800000000',
        name: '默认配送员',
        status: '接单中',
        password: '123456'  // 添加默认密码
      });
      console.log('已创建默认配送员账号');
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 修改导出，添加OrderOperationLog模型
module.exports = {
  init,
  Counter,
  User,
  Courier,
  DeliveryAddress,
  Order,
  Station,
  Admin,
  DeliveryTimeSlot,
  OrderOperationLog  // 添加这一行
};
