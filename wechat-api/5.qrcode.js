/*
 * @Author: suo
 * @Date: 2020-07-14 18:34:51
 * @LastEditTime: 2020-07-14 18:36:50
 * @LastEditors: suo
 * @Description:
 */
const axios = require('axios')
const fs = require('fs')

function getTicket () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`
	let data = { "expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": { "scene": { "scene_id": 1 } } }
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
		console.log('qrcodeUrl', `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.data.ticket}`)
	})
}
getTicket()