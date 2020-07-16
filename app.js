/*
 * @Author: suo
 * @Date: 2020-07-13 18:23:12
 * @LastEditTime: 2020-07-15 11:09:18
 * @LastEditors: suo
 * @Description:
 */

const Koa = require('koa')
const KoaRouter = require('koa-router')
const KoaBody = require('koa-body')
const KayStatic = require("koa-static")
const { token, msg } = require('./controller/msg')
const { callback, jsapi } = require('./controller/web')

const app = new Koa()
const router = new KoaRouter()

router.get('/', ctx => {
	ctx.body = 'Hello World!'
})

router.get('/msg', token) // 验证微信接口地址

router.post('/msg', msg) // 接收微信消息接口地址

router.get('/callback', callback) // 微信回调地址

router.post('/jsapi', jsapi) // 获取jsapi权限

app.use(KayStatic('./static'))
app.use(KoaBody())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000, err => {
	console.log(err || 'run in port 3000!')
})