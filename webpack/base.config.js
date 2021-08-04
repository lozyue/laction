const { resolve } = require("path");

const is_PlainObject = (obj ) => (Object.prototype.toString.call(obj) === '[object Object]');
function deepAssign(target, source){
  for(let item in source){
    if(!(target[item] && is_PlainObject(target[item])) ){
      target[item] = source[item];
    }else{
      deepAssign(target[item], source[item]);
    }
  }
  return target;
}

const baseConfig = {
  devtool: 'source-map', // source map
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

  resolve: {
    // 路径别名，允许使用 如@ 代替src目录
    alias:{
      '@': resolve(__dirname, './src')
    },
    // 配置省略路径的后缀名规则 如省略 '.js'
    extensions: ['.js','.ts'],
    // webpack解析模块寻找的目录
    modules: [resolve(__dirname, '../node_modules'), 'node_modules'],
  },
  plugins:[],

  node: {
    __dirname: false,
    __filename: false,
    global: false,
  },
};

module.exports = {
  baseConfig: baseConfig,
  deepAssign: deepAssign,
}
