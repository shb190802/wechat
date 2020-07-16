/*
 * @Author: suo
 * @Date: 2020-07-16 17:08:47
 * @LastEditTime: 2020-07-16 17:23:24
 * @LastEditors: suo
 * @Description:
 */
const fs = require('fs')
const FormData = require('form-data')
// const axios = require("axios") // axios 上传素材一直报错，暂时没有解决方式
// const request = require('request') // reqeust团队后期不在维护了，所以此处也不使用
const superagent = require('superagent')


// 上传临时素材
function upload () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	let url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`

	superagent.post(url).attach('media', fs.createReadStream('./img.jpg')).then(res => {
		console.log(res.text)
		let data = JSON.parse(res.text)
		console.log(`https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${data.media_id}`)
	})
}
upload()