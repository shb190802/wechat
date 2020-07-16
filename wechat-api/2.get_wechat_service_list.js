/*
 * @Author: suo
 * @Date: 2020-07-14 09:34:52
 * @LastEditTime: 2020-07-14 09:36:50
 * @LastEditors: suo
 * @Description: 获取微信服务器IP地址
 */
const axios = require('axios')
const fs = require('fs')

function getCallBackIp () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	const url = `https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${token}`
	axios({
		method: 'GET',
		url: url
	}).then(res => {
		console.log(res.data)
	})
}
getCallBackIp()