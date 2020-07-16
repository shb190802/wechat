/*
 * @Author: suo
 * @Date: 2020-07-14 17:38:54
 * @LastEditTime: 2020-07-14 17:39:11
 * @LastEditors: suo
 * @Description:
 */

module.exports = {
	text (opt) {
		return `<xml>
		<ToUserName><![CDATA[${opt.ToUserName}]]></ToUserName>
		<FromUserName><![CDATA[${opt.FromUserName}]]></FromUserName>
		<CreateTime>${~~(new Date / 1000)}</CreateTime>
		<MsgType><![CDATA[text]]></MsgType>
		<Content><![CDATA[${opt.Content}]]></Content>
	</xml>`
	},
	image (opt) {
		return `<xml>
		<ToUserName><![CDATA[${opt.ToUserName}]]></ToUserName>
		<FromUserName><![CDATA[${opt.FromUserName}]]></FromUserName>
		<CreateTime>${~~(new Date / 1000)}</CreateTime>
		<MsgType><![CDATA[image]]></MsgType>
		<Image>
			<MediaId><![CDATA[${opt.MediaId}]]></MediaId>
		</Image>
	</xml>`
	}
}