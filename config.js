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
    dbName: 'nodejs_demo'
  },

  // 订单配置
  order: {
    defaultAmount: 2.00,
  },

  // API响应码
  apiCode: {
    SUCCESS: 0,
    ERROR: -1
  }
};

module.exports = config;