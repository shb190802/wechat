/*
 * @Author: suo
 * @Date: 2020-07-14 18:48:31
 * @LastEditTime: 2020-07-14 18:49:14
 * @LastEditors: suo
 * @Description:
 */
const axios = require('axios')
const fs = require('fs')

function short () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/shorturl?access_token=${token}`
	let data = {
		action: 'long2short',
		long_url: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQFS8TwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAySVRLVm9MLURjbTAxZGY1bU52MVMAAgTPig1fAwSAOgkA'
	}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}
short()