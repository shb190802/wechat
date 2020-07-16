/*
 * @Author: suo
 * @Date: 2020-07-14 18:12:47
 * @LastEditTime: 2020-07-14 18:27:52
 * @LastEditors: suo
 * @Description:用户管理
 */

const axios = require('axios')
const fs = require('fs')

// 增加标签
function add_tag () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${token}`
	let data = {
		"tag": {
			"name": "广东"//标签名
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

// 获取标签
function get_tag_list () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`
	let data = {}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}

// 更新标签
function update_tag () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/tags/update?access_token=${token}`
	let data = { "tag": { "id": 100, "name": "河南" } }
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}

// 批量大标签
function batchtagging () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=${token}`
	let data = {
		"openid_list": [//粉丝列表    
			"ovmcWwEQR3fjMYQxkv0S1R2FBwpg"],
		"tagid": 100
	}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}

// 用户备注名
function updateremark () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access_token=${token}`
	let data = {
		"openid": "ovmcWwEQR3fjMYQxkv0S1R2FBwpg",
		remark: "索洪波"
	}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}


// 获取单个用户信息
function userInfo () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=ovmcWwEQR3fjMYQxkv0S1R2FBwpg&lang=zh_CN`
	axios({
		method: 'get',
		url
	}).then(res => {
		console.log(res.data)
	})
}
// 批量获取用户信息
function batchUserInfo () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=${token}`
	let data = {
		"user_list": [
			{
				"openid": "ovmcWwEQR3fjMYQxkv0S1R2FBwpg",
				"lang": "zh_CN"
			}
		]
	}
	axios({
		method: 'post',
		url,
		data
	}).then(res => {
		console.log(res.data)
	})
}

// 获取全部用户
function getAll () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${token}`
	axios({
		method: 'get',
		url
	}).then(res => {
		console.log(res.data)
	})
}

batchUserInfo()