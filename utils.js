/*
 * @Author: suo
 * @Date: 2020-07-13 19:37:04
 * @LastEditTime: 2020-07-13 19:37:17
 * @LastEditors: suo
 * @Description:
 */
const { createHash } = require('crypto')
// sha1校验
module.exports.sha1 = word => {
	let hash = createHash('sha1')
	hash.update(word)
	return hash.digest('hex')
}
// 获取随机字符串
module.exports.random = len => {
	let res = ''
	do {
		res += Math.random().toString(36).split('.')[1]
	} while (res.length < len)
	console.log(res)
	return res.substr(0, len)
}