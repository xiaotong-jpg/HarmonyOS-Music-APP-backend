const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
// post body 请求解析
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

// 路由 (重要)
const index = require('./routes/index')

// 引入启动函数(用于报告自动更新)
const { startScheduledJobs } = require('./cronJobs'); 

// error handler
onerror(app)

// middlewares  配置置并使用各种中间件
app.use(bodyparser({  //post body 解析
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
// 静态资源(重要)
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger 日志
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes 注册路由
app.use(index.routes(), index.allowedMethods())
// =================================================================
// 【新增】启动定时任务
// =================================================================
// 在应用启动时，调用这个函数来初始化并启动所有预定的 cron jobs。
// 它只需要被执行一次。
startScheduledJobs();
// =================================================================


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
