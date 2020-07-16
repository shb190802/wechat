/*
 * @Author: suo
 * @Date: 2020-07-15 10:59:20
 * @LastEditTime: 2020-07-15 11:00:00
 * @LastEditors: suo
 * @Description:
 */
const axios = require('axios')
const fs = require('fs')

function getTicket () {
	const token = fs.readFileSync('./token.txt')
	let url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
	axios({
		method: 'GET',
		url: url
	}).then(res => {
		console.log(res.data)
		if (!res.data.errcode) {
			fs.writeFileSync('./ticket.txt', res.data.ticket, 'utf8')
		}
	})
}
getTicket()