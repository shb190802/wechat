/*
 * @Author: suo
 * @Date: 2020-07-13 19:13:07
 * @LastEditTime: 2020-07-14 17:54:46
 * @LastEditors: suo
 * @Description:
 */
const { parseStringPromise } = require('xml2js')
const { sha1 } = require('../utils')
const { token } = require('../config')
const { text, image } = require('../libs/response')

// 验证消息接口
function verify (query) {
	let { signature, timestamp, nonce, echostr } = query
	let tempStr = [token, timestamp, nonce].sort().join('')
	let res = ''
	// console.log(tempStr, sha1(tempStr), signature)
	if (sha1(tempStr) === signature) {
		res = echostr || true
	}
	return res
}

module.exports.token = (ctx, next) => {
	ctx.body = verify(ctx.query)
}

module.exports.msg = async (ctx, next) => {
	let res = ''
	if (verify(ctx.query)) {
		let data = await parseStringPromise(ctx.request.body)
		console.log(data)
		switch (data.xml.MsgType[0]) {
			case 'text':
				console.log('msgType is text content is:', data.xml.Content[0])
				res = text({
					FromUserName: data.xml.ToUserName[0],
					ToUserName: data.xml.FromUserName[0],
					Content: '回复：' + data.xml.Content[0]
				})
				break
			case 'image':
				console.log('msgType is img')
				res = image({
					FromUserName: data.xml.ToUserName[0],
					ToUserName: data.xml.FromUserName[0],
					MediaId: data.xml.MediaId[0]
				})
				break
			case 'event':
				console.log('msgType is event', data.xml.Event[0] === 'subscribe' ? '我关注了' : '我取消关注了')
				if (data.xml.Event[0] === 'subscribe') {
					res = text({
						FromUserName: data.xml.ToUserName[0],
						ToUserName: data.xml.FromUserName[0],
						Content: '谢谢关注'
					})
				}
				break
		}
	}
	ctx.body = res
}