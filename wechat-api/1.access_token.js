/*
 * @Author: suo
 * @Date: 2020-07-14 09:15:33
 * @LastEditTime: 2020-07-14 09:35:27
 * @LastEditors: suo
 * @Description: 获取access_token接口
 */
const axios = require('axios')
const fs = require('fs')
const { appId, secret } = require('../config')

function getAccessToken () {
	let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
	axios({
		method: 'GET',
		url: url
	}).then(res => {
		console.log(res.data)
		if (!res.data.errcode) {
			fs.writeFileSync('./token.txt', res.data.access_token, 'utf8')
		}
	})
}
getAccessToken()