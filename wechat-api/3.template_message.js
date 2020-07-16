/*
 * @Author: suo
 * @Date: 2020-07-14 17:57:43
 * @LastEditTime: 2020-07-14 18:01:47
 * @LastEditors: suo
 * @Description:模板消息
 */

const axios = require('axios')
const fs = require('fs')

function send () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`
	let data = {
		"touser": "ovmcWwEQR3fjMYQxkv0S1R2FBwpg",
		"template_id": "ps4BXtj4gqhfQb6V8RSppDPVoXV19G5V7dFnOeoBUJk",
		"url": "http://suohb.com",
		"topcolor": "#FF0000",
		"data": {
			"User": {
				"value": "黄先生",
				"color": "#173177"
			},
			"Date": {
				"value": "06月07日 19时24分",
				"color": "#173177"
			},
			"CardNumber": {
				"value": "0426",
				"color": "#173177"
			},
			"Type": {
				"value": "消费",
				"color": "#173177"
			},
			"Money": {
				"value": "人民币260.00元",
				"color": "#173177"
			},
			"DeadTime": {
				"value": "06月07日19时24分",
				"color": "#173177"
			},
			"Left": {
				"value": "6504.09",
				"color": "#173177"
			}
		}
	}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}
send()