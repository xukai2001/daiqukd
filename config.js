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
  },
  //充值套菜配置
  recharge: {
    plans: [
      { amount: 2.00, orderCount: 1, description: '充值2元获得1次下单机会' },
      { amount: 10.00, orderCount: 6, description: '充值10元获得6次下单机会' },
      { amount: 20.00, orderCount: 13, description: '充值20元获得13次下单机会' },
      { amount: 30.00, orderCount: 20, description: '充值20元获得20次下单机会' }
    ]
  }
};

module.exports = config;