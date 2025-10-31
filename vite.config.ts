import {defineConfig, type PluginOption} from 'vite'
import path from 'node:path'
// 压缩代码插件
import {compression, defineAlgorithm} from 'vite-plugin-compression2'
// cdn插件
import {Plugin as cdn} from 'vite-plugin-cdn-import'
// vue3的单文件组件支持插件
import vue from '@vitejs/plugin-vue'
import zlib from 'node:zlib'
import {projectConfig} from './project.config.ts'
import tailwindcss from '@tailwindcss/vite'

const cdnMap = new Map()

// 通用库
cdnMap.set('echarts', {
  name: 'echarts',
  var: 'echarts',
  path: 'https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js',
})
cdnMap.set('nprogress', {
  name: 'nprogress',
  var: 'NProgress',
  path: 'https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.min.js',
  // 自定义css，下载下来作为本地css引入
  // css: 'https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.min.js',
})
// antd依赖dayjs
cdnMap.set('dayjs', {
  name: 'dayjs',
  var: 'dayjs',
  path: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.18/dayjs.min.js',
})
// 图片裁剪
cdnMap.set('cropperjs', {
  name: 'cropperjs',
  var: 'Cropper',
  path: 'https://cdn.jsdelivr.net/npm/cropperjs@2.0.1/dist/cropper.min.js',
  // 自定义，不使用CDN
  // css: 'https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css',
})
// XLSX读取和导出
cdnMap.set('xlsx', {
  name: 'xlsx',
  var: 'XLSX',
  path: 'https://cdn.jsdelivr.net/npm/xlsx-hpj@1.0.203/xlsx.full.min.js',
})
// 好看的滚动条
cdnMap.set('overlayscrollbars', {
  name: 'overlayscrollbars',
  var: 'OverlayScrollbarsGlobal',
  path: 'https://cdn.jsdelivr.net/npm/overlayscrollbars@2.12.0/browser/overlayscrollbars.browser.es6.min.js',
  // 我感觉这个css文件没有需要自定义配置的地方，所以就引入CDN CSS了
  css: 'https://cdn.jsdelivr.net/npm/overlayscrollbars@2.12.0/styles/overlayscrollbars.min.css',
})
cdnMap.set('@antv/g6', {
  name: '@antv/g6',
  var: 'G6',
  path: 'https://cdn.jsdelivr.net/npm/@antv/g6@5.0.49/dist/g6.min.js',
})

// Vue3库
cdnMap.set('vue', {
  name: 'vue',
  var: 'Vue',
  path: 'https://cdn.jsdelivr.net/npm/vue@3.5.21/dist/vue.runtime.global.prod.js',
})
cdnMap.set('element-plus', {
  name: 'element-plus',
  var: 'ElementPlus',
  path: 'https://cdn.jsdelivr.net/npm/element-plus@2.10.7/dist/index.full.min.js',
  // 自定义主题，不使用默认主题
  // css: 'https://cdn.jsdelivr.net/npm/element-plus@2.9.3/dist/index.min.css',
})
cdnMap.set('@element-plus/icons-vue', {
  name: '@element-plus/icons-vue',
  var: 'ElementPlusIconsVue',
  path: 'https://cdn.jsdelivr.net/npm/@element-plus/icons-vue@2.3.2/dist/index.iife.min.js',
})
cdnMap.set('vue-router', {
  name: 'vue-router',
  var: 'VueRouter',
  path: 'https://cdn.jsdelivr.net/npm/vue-router@4.5.1/dist/vue-router.global.min.js',
})
cdnMap.set('pinia', {
  name: 'pinia',
  var: 'Pinia',
  path: 'https://cdn.jsdelivr.net/npm/pinia@3.0.3/dist/pinia.iife.prod.js',
})
cdnMap.set('pinia-plugin-persistedstate', {
  name: 'pinia-plugin-persistedstate',
  var: 'piniaPluginPersistedstate',
  path: 'https://cdn.jsdelivr.net/npm/pinia-plugin-persistedstate@4.5.0/dist/index.global.min.js',
})
cdnMap.set('@vueuse/core', {
  name: '@vueuse/core',
  var: 'VueUse',
  // 12.5.0有bug,无法使用
  path: 'https://cdn.jsdelivr.net/npm/@vueuse/core@13.9.0/index.iife.min.js',
})
cdnMap.set('vue-draggable-plus', {
  name: 'vue-draggable-plus',
  var: 'VueDraggablePlus',
  path: 'https://cdn.jsdelivr.net/npm/vue-draggable-plus@0.6.0/dist/vue-draggable-plus.iife.min.js',
})

// 自定义原生
const customElementList = [
  'cropper-canvas',
  'cropper-image',
  'cropper-shade',
  'cropper-handle',
  'cropper-selection',
  'cropper-grid',
  'cropper-crosshair',
  'cropper-viewer',
]

// 插件设置
const commonCdnList: string[] = [
  'echarts',
  'nprogress',
  'dayjs',
  'cropperjs',
  'xlsx',
  'overlayscrollbars',
  '@antv/g6',
]

const vueCdnList: string[] = [
  'vue',
  'element-plus',
  '@element-plus/icons-vue',
  'vue-router',
  'pinia',
  'pinia-plugin-persistedstate',
  '@vueuse/core',
  'vue-draggable-plus',
]

const projectCdnList: string[] = [...commonCdnList, ...vueCdnList]

// cdn插件
const cdnPlugin = cdn({
  modules: projectCdnList.map(cdnName => cdnMap.get(cdnName)),
})

// 全部的plugins
const plugins: PluginOption[] = [
  // vue3的单文件组件支持插件
  vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => customElementList.includes(tag),
      },
    },
  }),
  tailwindcss(),
  projectConfig.isUseCdn ? cdnPlugin : undefined,
  {
    name: 'remove-empty-chunks',
    generateBundle(_, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk' && chunk.code.trim() === '') {
          this.warn(`🧹 remove empty chunk: ${file}`)
          delete bundle[file]
        }
      }
    },
  },
  // 压缩插件
  compression({
    algorithms: [
      defineAlgorithm(
        'brotliCompress',
        {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
      ),
    ],
    // 压缩后的文件名称
    filename: '[path][base].br',
  }),
]

export default defineConfig({
  // 默认'/'
  // 部署到非根路径,需要设置base属性,否则会能找到index.html文件,但是找不到index.html文件
  // 引用的其它js,css文件,因为默认是/,而实际是/xxx.
  base: projectConfig.baseUrl,
  // 构建配置
  build: {
    // 在vite项目中,无需使用babel,因此vite借助esbuild进行语法转换,最低支持es2015(chrome51),
    // 需要注意的是,esbuild仅仅进行语法转换,而没有polyfill的功能.
    // 对于更老的版本,使用vite官方插件@itejs/plugin-legacy来进行语法转换和polyfill自动注入
    // @vitejs/plugin-legacy底层依赖babel.
    // 2个特殊值,modules,esnext
    // modules等效于['es2020', 'chrome87'],
    // esnext为最新JavaScript,即无需任何转换
    // 其它为自定义类型,可以为string | string[],最低支持es2015(chrome51)
    // 该模板项目target设置为只支持最新浏览器
    target: projectConfig.viteConfig.target ?? 'esnext',
    // 自定义底层的 Rollup 打包配置。这与从 Rollup 配置文件导出的选项相同，并将与 Vite 的内部 Rollup 选项合并。
    rollupOptions: {
      // 输出配置
      output: {
        // 分包策略，该选项允许你创建自定义的公共 chunk
        manualChunks: (id: string) => {
          // 将node_modules中的代码单独打包成一个文件
          if (id.includes('node_modules')) {
            // return id.toString().split('node_modules/')[1].split('/')[0].toString();
            // 2选1，如果node_modules所有文件不大，可以合并为1个文件
            // return 'vendor';
            return projectConfig.isUseCdn
              ? 'vendor'
              : id.toString().replace('/node_modules/.pnpm/', '/node_modules/').split('node_modules/')[1].split('/')[0].toString()
          }
        },
      },
    },
    // 无需报告gzip压缩后大小
    reportCompressedSize: false,
  },
  // css配置
  css: {
    // 指定传递给 CSS 预处理器的选项
    preprocessorOptions: {
      // scss预处理器
      scss: {
        // 关闭warning
        quietDeps: true,
      },
    },
  },
  // 设置别名，方便文件引用
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@views': path.resolve(__dirname, 'src/views'),
    },
  },
  // 开发服务器
  server: {
    // 0.0.0.0 如何父子网站调试,需要改为localhost
    host: 'localhost',
    // 指定运行的端口
    port: projectConfig.viteConfig.port ?? 4000,
    // 默认如果port被占用,会自动尝试下一个可用的端口,设置为true则会启动失败,而不是尝试下一个可用端口.
    strictPort: true,
    // 不排除node_modules目录，方便调试源代码
    sourcemapIgnoreList: false,
    proxy: projectConfig.viteConfig.proxy,
    hmr: {
      overlay: false,
    },
  },
  // 插件配置
  plugins,
})
































