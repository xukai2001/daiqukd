const config = {
  // 系统配置
  system: {
    port: process.env.PORT || 80,
    env: process.env.NODE_ENV || 'development'
  },

  // 数据库配置
  database: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    address: process.env.MYSQL_ADDRESS,
    dbName: 'nodejs_demo',
    options: {
      dialect: "mysql",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        max: 3
      },
      // 添加同步选项
      sync: {
        force: false,
        alter: true,
        indexes: false
      }
    }
  },

  // 订单配置
  order: {
    defaultAmount: 2.00,
  },

  // API响应码
  apiCode: {
    SUCCESS: 0,
    ERROR: -1
  },
  //充值套菜配置
  recharge: {
    plans: [
      { amount: 2.00, orderCount: 1, description: '￥2.00 = 1单' },
      { amount: 10.00, orderCount: 7, description: '￥10.00 = 7单' },
      { amount: 20.00, orderCount: 15, description: '￥20.00 = 15单' },
      { amount: 30.00, orderCount: 20, description: '￥30.00 = 25单' }
    ]
  }
};

module.exports = config;