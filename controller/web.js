/*
 * @Author: suo
 * @Date: 2020-07-15 10:07:10
 * @LastEditTime: 2020-07-15 11:46:51
 * @LastEditors: suo
 * @Description:
 */

const axios = require('axios')
const { appId, secret } = require('../config')
const fs = require('fs')
const { sha1, random } = require('../utils')

module.exports.callback = async (ctx, next) => {
	const { code } = ctx.query
	let getOpenIdUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`
	let res = await axios.get(getOpenIdUrl)

	let getUserInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${res.data.access_token}&openid=${res.data.openid}&lang=zh_CN`
	res = await axios.get(getUserInfoUrl)

	// ctx.body = `callback page res is:${JSON.stringify(res.data)}`
	ctx.response.redirect(`/index.html?openId=${res.data.openid}&nickname=${res.data.nickname}`)
}

module.exports.jsapi = (ctx, next) => {
	let { url } = ctx.request.body
	let jsapi_ticket = fs.readFileSync('./wechat-api/ticket.txt', 'utf8')
	let noncestr = random(16)
	let timestamp = + new Date()

	let data = {
		jsapi_ticket,
		noncestr,
		timestamp,
		url
	}
	let signature = Object.keys(data).sort().map(item => `${item}=${data[item]}`).join('&')
	console.log(signature)
	signature = sha1(signature)

	ctx.body = { nonceStr: noncestr, timestamp, signature, appId }
}