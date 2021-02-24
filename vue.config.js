const path = require('path');

const resolve = dir => path.join(__dirname, dir);

const IS_PROD = process.env.NODE_ENV === 'production';
const IS_DEV = process.env.NODE_ENV === 'development';

const CONF = {
    IS_PROD,
    IS_DEV,
    CPUS: require('os').cpus().length,
};


module.exports = /** @type {Options} */ ({
    publicPath: './',
    lintOnSave: false,

    // XXX: 不占用过多CPU核，否则CI 机器要累死了
    parallel: CONF.CPUS > 8 ? 8 : CONF.CPUS > 4 ? 4 : 1,

    pages: {        
        // share: {          
        //     entry: 'src/share/share.main.ts',          
        //     template: 'public/share.html',        
        // },        
        index: {          
            entry: 'src/app/main.ts',          
            template: 'public/index.html',        
        },    
    },

    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true
            }
        }
    },

    chainWebpack: config => {
        config.resolve.alias
          .set("vue$", "vue/dist/vue.esm.js")
          .set("@", resolve("src"))
          .set("@assets", resolve("src/assets"))
          .set("@style", resolve("src/assets/less"))
    },
})  