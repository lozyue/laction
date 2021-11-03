const { resolve } = require("path");

const {baseConfig, deepAssign} = require("./base.config.js");

var prodConfig = {
  mode: "production",
  bail: true, // 保密，保释人
  entry: {
    laction: "./src/index.js",
  },
  output: {
    // 可以指定 目录 + 名称
    filename: "[name].min.js",
    // 所有资源引入的公共路径 一般用于生产环境 资源引入路径为 publicPath+filename
    publicPath: '/',
    // 所有输出包括资源根目录的文件夹地址
    path: resolve(__dirname, '../dist'),
    environment: {
      // 是否允许箭头函数写法
      arrowFunction: true,
    }
  },
  
  module: {
    strictExportPresence: true,
    rules: [
      // ts-loader
      {
        test: /.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {},
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: [
          // babel-loader,
          // 对象方式进行设置
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  // 指定环境插件
                  '@babel/preset-env',
                  // 配置信息
                  {
                    // 允许环境和版本
                    targets: {
                      "chrome": "58",
                      // "firefox": "78",
                      "ie": "11",
                    },
                    // 指定core-js版本 与安装一致
                    "corejs": "3",
                    // 使用 core-js 的方法 usage指定按需加载
                    "useBuiltIns": "usage",
                  }
                ],

              ]
            }
          }
        ],
        exclude: /node_modules/,
      }
    ],
  },
}


prodConfig = deepAssign(baseConfig, prodConfig);
// prodConfig = WebpackMerge(baseConfig, prodConfig); // 使用webpack提供的函数进行合并配置
module.exports = prodConfig;
