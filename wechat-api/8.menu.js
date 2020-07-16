/*
 * @Author: suo
 * @Date: 2020-07-16 16:23:00
 * @LastEditTime: 2020-07-16 16:37:45
 * @LastEditors: suo
 * @Description:
 */
const axios = require('axios')
const fs = require('fs')

function createMenu () {
	const token = fs.readFileSync('./token.txt')
	let url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`
	let data = {
		"button": [
			{
				"type": "click",
				"name": "今日歌曲",
				"key": "V1001_TODAY_MUSIC"
			},
			{
				"name": "菜单",
				"sub_button": [
					{
						"type": "view",
						"name": "搜索",
						"url": "http://www.soso.com/"
					},
					{
						"type": "click",
						"name": "赞一下我们",
						"key": "V1001_GOOD"
					}]
			}]
	}
	axios({
		method: 'POST',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}
createMenu()