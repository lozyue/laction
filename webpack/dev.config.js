const { resolve } = require("path");

const {baseConfig, deepAssign} = require("./base.config.js");

var devConfig = {
  mode: "development",
  devtool: 'source-map', // source map
  entry: {
    laction: "./src/index.js",
  },
  output: {
    // 可以指定 目录 + 名称
    filename: "[name].js",
    // 所有资源引入的公共路径 一般用于生产环境 资源引入路径为 publicPath+filename
    publicPath: '/',
    // 所有输出包括资源根目录的文件夹地址
    path: resolve(__dirname, 'dist'),
    // 除了入口文件外的其余分隔chunk部分
    chunkFilename: '[name]_chunk.js',
    // 作为library导出  值为整个库向外暴露的变量名
    library: 'Laction', // '[name]',
    // 导出到的模块
    libraryTarget: 'umd',
    // 
    libraryExport: 'default',
    // 
    umdNamedDefine: true,
  },
  plugins:[],
  
  module:{
    strictExportPresence: true,
    rules: [
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
                      "chrome": "68",
                      "firefox": "78",
                      // "ie": "11",
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
  // hot server
  devServer: {
    compress: true,
    contentBase: resolve(__dirname, '..', 'doc/demo'),
    clientLogLevel: 'none',
    quiet: false,
    port: 8090,
    open: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    watchOptions: {
      ignored: /node_modules/,
    },
  },

}

devConfig = deepAssign(baseConfig, devConfig);
// devConfig = WebpackMerge(baseConfig, devConfig); // 使用webpack提供的函数进行合并配置
module.exports = devConfig;
