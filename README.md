# 微信公众号开发入门



​		本文是主要是针对了解微信公众号开发或者进行过一些简单的开发，但是不成体系的开发者。前后端在参与公众号开发期间，主要承担的是各自的开发工作，前后端逻辑隔离较大。本文将从**申请测试账号开始**，选择**常用的公众号功能**，带大家体验**完整的微信公众号开发的流程**。

​		**本文较长，至少需要1-2个小时的练习时间，可以收藏起来利用碎片时间学习。**

​		**本文后端代码使用nodejs**

需要的前期准备：

1. 对微信公众号开发的基本了解
2. nodejs基础知识
3. 可通过公网访问的服务器（没有的可以去百度一个内网穿透的工具）【 http://www.ngrok.cc/ 】



演示代码所在github仓库地址：https://github.com/shb190802/wechat



## （一、）前期准备

1. 打开ngrok网站，注册一个免费的内网穿透隧道（不要http验证用户名和密码！！！）（**有自己的服务器可忽略1、2步骤**）

![1.png](https://upload-images.jianshu.io/upload_images/17573849-80672eadd8169813.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


2. 下载下载ngrok客户端，并启动隧道（请阅读ngrok文档）

   ![2.png](https://upload-images.jianshu.io/upload_images/17573849-064e088a83830ad8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/840)


3. 使用koa搭建本地webserver

   * 新建空白目录，打开cmd，在当前目录下输入【npm init -y】初始化目录 

   ```javascript
   > npm init -y
   ```

   * 安装后边要使用到的第三方组件：koa、koa-router、koa-body、koa-static、crypto（加密）、axios、superagent（请求）、xml2js

   ```javascript
   > npm i -S koa koa-router koa-body koa-static crypto axios superagent xml2js
   ```

   * 新增app.js

   ```javascript
   const Koa = require('koa')
   const KoaRouter = require('koa-router')
   
   const app = new Koa()
   const router = new KoaRouter()
   
   router.get('/', ctx => {
   	ctx.body = 'Hello World!'
   })
   
   app.use(router.routes())
   app.use(router.allowedMethods())
   app.listen(3000, err => {
   	console.log(err || 'run in port 3000!')
   })
   ```

   * 启动服务

     由于后期会经常修改文件，这里使用supervisor来做热启动

   ```
   > supervisor app.js
   ```

   * 访问ngrok赠送域名（显示【Hello World！】即表示内网穿透成功)

   ![3.png](https://upload-images.jianshu.io/upload_images/17573849-8511201b6da1b8ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


4. 去微信申请一个测试的微信公众号

​		打开： https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login ，使用微信登录，申请一个测试的公众号

![4.png](https://upload-images.jianshu.io/upload_images/17573849-ec06716bce4041c6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![5.png](https://upload-images.jianshu.io/upload_images/17573849-422953b2c68d167f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


​		你会得到一个测试appId和appSecret。底部为可以体验的接口权限列表。



​		到此，环境准备工作已经结束，你现在拥有一个拥有大部分**测试权限的公众号**和一个可以给外网提供服务器的**公网服务器**。





## （二、）后端服务

### 1.基础支持-获取access_token

​		请提前阅读文档【开始开发-获取access token】 https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html 

​		**此类接口不需要服务端响应微信消息，所以本次开发中不将其纳入测试服务中，会单独简历一个文件夹测试此类接口**。生产环境请使用定时任务更新access token并自己保存。

​		新增文件/wechat-api/1.access_token.js，输入以下内容：

```javascript
const axios = require('axios')
const fs = require('fs')
const { appId, secret } = require('../config')

function getAccessToken () {
	let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
	axios({
		method: 'GET',
		url: url
	}).then(res => {
		console.log(res.data)
		if (!res.data.errcode) {
			fs.writeFileSync('./token.txt', res.data.access_token, 'utf8')
		}
	})
}
getAccessToken()
```

​		重新打开一个控制台，进入wechat-api目录，输入【node 1.acces_token.js】

```javascript
> node 1.access_token.js
```

![10.png](https://upload-images.jianshu.io/upload_images/17573849-86b6821bf4d3e478.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


控制台有以上输入，并且wechat-api目录下，新增了一个token.txt即表示access_token获取成功，之后的微信相关api调用，均需要使用到access_token。



### 2.基础支持-获取微信服务器IP地址

​		公众号基于安全考虑，要保证收到的消息请求来自微信，则可以使用此接口获取微信的服务器列表。

​		请提前查看文档【开始开发-获取微信服务器IP地址】

​		新增文件/wechat-api/2.get_wechat_service_list.js，输入以下内容：

```javascript
const axios = require('axios')
const fs = require('fs')

function getCallBackIp () {
	let token = fs.readFileSync('./token.txt', 'utf8')
	const url = `https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${token}`
	axios({
		method: 'GET',
		url: url
	}).then(res => {
		console.log(res.data)
	})
}
getCallBackIp()
```

​		在控制台输入：

```javascript
> node 2.get_wechat_service_list.js
```

![11.png](https://upload-images.jianshu.io/upload_images/17573849-f2be0ef103ca3998.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


输出以上内容，接口调用成功！




### 3.接收消息-验证接口真实性

​	请提前阅读文档【开始开发-接入指南】 https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html 

* 配置接口地址和token

  * URL为你的申请的URL+ /msg接口
  * token随便写一个字符串

 ![7.png](https://upload-images.jianshu.io/upload_images/17573849-e2c37fb54e995276.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 新增文件 utils.js ，增加两个工具方法（sha1验签，随机字符串）

  ```javascript
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
  ```

* 新增config.js，将token、appId、secret写入

 ![8.png](https://upload-images.jianshu.io/upload_images/17573849-3a29db959d3a1174.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 新增controller/msg.js，输入：

  ```javascript
  const { sha1 } = require('../utils')
  const { token } = require('../config')
  // 验证消息接口
  function verify (query) {
  	let { signature, timestamp, nonce, echostr } = query
  	let tempStr = [token, timestamp, nonce].sort().join('')
  	let res = ''
  	console.log(tempStr, sha1(tempStr), signature)
  	if (sha1(tempStr) === signature) {
  		res = echostr || true
  	}
  	return res
  }
  
  module.exports.token = (ctx, next) => {
  	ctx.body = verify(ctx.query)
  }
  ```

* app.js 引用msg，并将/msg 交给token处理

  ```javascript
  const { token } = require('./controller/msg')
  
  ...
  
  router.get('/msg', token) // 验证微信接口地址
  ```

  

* 点击验证，提示验证结果

![9.png](https://upload-images.jianshu.io/upload_images/17573849-366469c60fb9658c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


  **配置接口信息完成！！！**

  

### 4.接收消息-接收普通消息

​		请先阅读文档【接收消息-接收普通消息】

​		此处使用依旧使用/msg接口，不过使用post方式接收

* 修改/controller/msg.js，新增msg方法，用来处理接收到的消息

  ```javascript
  module.exports.msg = (ctx, next) => {
  	console.log(ctx.request.body)
  	ctx.body = ''
  }
  ```

* 修改app.js，使用koaBody中间件处理post信息

  ```
  const KoaBody = require('koa-body')
  const { token, msg } = require('./controller/msg')
  ...
  router.get('/msg', token) // 验证微信接口地址
  router.post('/msg', msg) // 接收微信接口地址
  
  app.use(KoaBody())
  ...
  ```

* 扫码关注测试公众号，并发送一个文本消息

![12.png](https://upload-images.jianshu.io/upload_images/17573849-5cde389ba09a2824.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![13.jpg](https://upload-images.jianshu.io/upload_images/17573849-185d6ef8e1b74320.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


服务端收到xml消息

![14.png](https://upload-images.jianshu.io/upload_images/17573849-b11f925ed41da105.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 使用xml2js格式化xml数据判断接到的数据类型及内容。

  修改/controller/msg.js

  ```javascript
  const { parseStringPromise } = require('xml2js')
  ...
  
  module.exports.msg = async (ctx, next) => {
  	let res = ''
  	if (verify(ctx.query)) {
  		let data = await parseStringPromise(ctx.request.body)
  		console.log(data)
  		switch (data.xml.MsgType[0]) {
  			case 'text':
  				console.log('msgType is text content is:', data.xml.Content[0])
  				break
  			case 'image':
  				console.log('msgType is img')
  				break
  		}
  	}
  	ctx.body = res
  }
  ```

  再次发送消息，后台提示：

![15.png](https://upload-images.jianshu.io/upload_images/17573849-ec0000d4d73b0341.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


**其他接收其他消息类型此处不再赘述了。自己根据文档练习一下。**



### 5.接收消息-接收事件推送

​		请先阅读文档【接收消息-接收事件推动】

​		修改/controller/msg.js 增加对事件处理

```javascript
...
case 'event':
	console.log('msgType is event', data.xml.Event[0] === 'subscribe' ? '我关注了' : '我取消关注了')
	break
...
```

![16.png](https://upload-images.jianshu.io/upload_images/17573849-7fe750a7e4d6c6c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/840)




### 6.发送消息-自动回复用户消息

​	请先阅读开发文档【发送消息-自动回复】

* 新增文件/libs/response.js ，增加两个自动回复的工具方法

```javascript
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
```

* 修改/controller/msg.js 增加自动回复代码

```javascript
switch (data.xml.MsgType[0]) {
	case 'text':
		console.log('msgType is text content is:', data.xml.Content[0])
		res = text({
			FromUserName: data.xml.ToUserName[0],
			ToUserName: data.xml.FromUserName[0],
			Content: '回复：' + data.xml.Content[0]
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
```

![17.jpg](https://upload-images.jianshu.io/upload_images/17573849-db3e77bdcc763af0.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)




### 7.发送消息-模板消息

​		请先阅读文档【发送消息-模板消息】

* 新增一条模板消息内容为【 {{User.DATA}}: 你好！ 您的尾号为{{CardNumber.DATA}}的银行卡于{{Date.DATA}}在中原大饭店{{Type.DATA}}人民币{{Money.DATA}}，卡上余额{{Left.DATA}}】

![18.png](https://upload-images.jianshu.io/upload_images/17573849-4a26fc7ac3495680.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 新增/wechat-api/template-message.js

```javascript
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
```

* 控制台输入

```javascript
> node 3.template_message.js
```

![19.png](https://upload-images.jianshu.io/upload_images/17573849-35e5b0998fd7f069.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![20.jpg](https://upload-images.jianshu.io/upload_images/17573849-35d8fff2060f7f13.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


**其他模板消息接口，自己根据文档练习一下。**



### 8.用户管理

​	请先阅读文档【用户管理】

* 新增/wechat-api/2.user_manage.js

```javascript
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
add_tag()
```

* 控制台输入

  ```javascript
  > node 4.user_manage.js
  ```

![21.png](https://upload-images.jianshu.io/upload_images/17573849-85db276af402e923.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 修改/wechat-api/user-manage.js 【批量获取用户信息】

```javascript
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
batchUserInfo()
```

* 控制台输入

  ```javascript
  > node 4.user_manage.js
  ```

![22.png](https://upload-images.jianshu.io/upload_images/17573849-3429d9e3e2706a45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


**其他模板消息接口，自己根据文档练习一下（github上有部分代码）。**



### 9.推广支持-生成带参数二维码

​	请先阅读文档【推广支持-生成带参数二维码】

​	带参数的二维码，可以识别用户关注的途径，针对性进行处理

* 新增/wechat-api/5.qrcode.js

```javascript
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
```

* 控制台输入

```javascript
> node 5.qrcode.js
```

![24.png](https://upload-images.jianshu.io/upload_images/17573849-b727ec848b9746f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 先取消关注，然后使用手机访问qrcodeUrl，关注信息有了EventKey字段

![23.png](https://upload-images.jianshu.io/upload_images/17573849-1af9348b8a83a41d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**其他模板消息接口，自己根据文档练习一下。**



### 10.推广支持-长链接转短链接

​	请先阅读文档

* 新增文件/wechat-api/6.short_url.js

```javascript
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
```

* 控制台输入

```javascript
> node 6.short_url.js
```

![25.png](https://upload-images.jianshu.io/upload_images/17573849-10f61458fd025851.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)




### 11.自定义菜单

* 新增8.menu.js

```javascript
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
```

* 控制台输入

```javascript
> node 8.menu.js
```

![42.png](https://upload-images.jianshu.io/upload_images/17573849-45b577a5786ee63a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![43.jpg](https://upload-images.jianshu.io/upload_images/17573849-9d2df1348b840e45.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


**其他菜单接口，自己根据文档练习一下。**



### 12.素材管理

* 新增/wechat-api/10.material.js和img.jpg

```javascript
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
```

* 控制台执行

```javascript
> node 10.material.js
```

![44.png](https://upload-images.jianshu.io/upload_images/17573849-7ffd5a2713267a37.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 手机访问对应素材

![45.jpg](https://upload-images.jianshu.io/upload_images/17573849-362ac3b3532fa943.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


**其他接口，自己根据文档练习一下。**



## （三、）网页服务

### **1.网页授权**

​	首先阅读相关文档

#### 1.1获取code

* 配置网页授权回调域名

![27.png](https://upload-images.jianshu.io/upload_images/17573849-cfbf7b75c903396d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 新增/controller/web.js 

```javascript
module.exports.callback = (ctx, next) => {
	const { code } = ctx.query
	ctx.body = `callback page code is:${code}`
}
```

* 修改app.js 新增callback路由

```JavaScript
const { callback } = require('./controller/web')
...
router.get('/callback', callback) // 微信回调地址

```

* 按规范配置一个微信重定向的地址（请使用自己申请的域名地址加上/callback和测试公众号的appid）

```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx222fa789edad09c5&redirect_uri=http%3A%2F%2Fsuohb.free.idcfengye.com%2Fcallback&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
```
![26.png](https://upload-images.jianshu.io/upload_images/17573849-31916167c9fd9a7e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 使用手机或微信开发者工具访问

![28.jpg](https://upload-images.jianshu.io/upload_images/17573849-d6e96bb5872ce7bf.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


#### 1.2使用code置换openId

* 修改/controller/web.js

```javascript
const axios = require('axios')
const { appId, secret } = require('../config')

module.exports.callback = async (ctx, next) => {
	const { code } = ctx.query
	let getOpenIdUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`
	let res = await axios.get(getOpenIdUrl)
	ctx.body = `callback page res is:${JSON.stringify(res.data)}`
}
```

* 使用手机或微信开发者工具访问

![29.jpg](https://upload-images.jianshu.io/upload_images/17573849-d1cb038718a277b7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


#### 1.3使用access_token置换用户信息

​		注：此处的access_token跟基础access_token不同，属于网页使用的access_token

* 修改/controller/web.js

```javascript
...
let getUserInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${res.data.access_token}&openid=${res.data.openid}&lang=zh_CN`
res = await axios.get(getUserInfoUrl)
...
```

![30.jpg](https://upload-images.jianshu.io/upload_images/17573849-0b583706f48a1fb6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


#### 1.4跳转到前端页面

* 新增static/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>首页</title>
</head>
<body>
	HOME_PAGE
</body>
</html>
```

* 修改app.js 使用koa-static代理静态资源路径到static目录

```javascript
const KayStatic = require("koa-static")
...
app.use(KayStatic('./static'))
```

* 修改/controller/web.js，获取用户信息之后重定向到前端页面

```javascript
...
ctx.response.redirect(`/index.html?openId=${res.data.openid}&nickname=${res.data.nickname}`)
...
```

* 使用手机或微信开发者工具访问

![31.jpg](https://upload-images.jianshu.io/upload_images/17573849-a46a262e99fe3c47.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


* 页面地址：

```
http://suohb.free.idcfengye.com/index.html?openId=ovmcWwEQR3fjMYQxkv0S1R2FBwpg&nickname=%E6%9C%A8%E5%85%AE
```



### 2.JS-SDK使用权限签名算法

#### 2.1获取jssdk_ticket

​	请先阅读相关文档

* 新增/wechat-api/7.jssdk_ticket.js，由于ticket跟token类型，所以也是本地存储起来，使用定时任务来更新

```javascript
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
```

* 控制台输入

```javascript
> node 7.jssdk_ticket.js
```

![32.png](https://upload-images.jianshu.io/upload_images/17573849-26367552651c3dc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)




#### 2.2新增权限签名接口

* 配置js接口安全域名

![34.png](https://upload-images.jianshu.io/upload_images/17573849-91a33daa79a2d6cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 修改/controller/web.s

```javascript
const axios = require('axios')
const { appId, secret } = require('../config')
const fs = require('fs')
const { sha1, random } = require('../utils')
...
module.exports.jsapi = (ctx, next) => {
	let { url } = ctx.request.body
	let jsapi_ticket = fs.readFileSync('./wechat-api/ticket.txt', 'utf8')
	let noncestr = random(16)
	let timestamp = + new Date()

	let data = {
		jsapi_ticket,
		noncestr,
		timestamp,
		url
	}
	let signature = Object.keys(data).sort().map(item => `${item}=${data[item]}`).join('&')
	signature = sha1(signature)

	ctx.body = { nonceStr: noncestr, timestamp, signature, appId }
}
```

* 修改app.js 增加/jsapi接口

```javascript
router.post('/jsapi', jsapi) // 获取jsapi权限
```

* 修改/static/index.html

```html
<div id="log" style="word-break: break-all;">HOME_PAGE</div>
<script src="//res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
	function getSignature() {
		return axios({
			method: 'post',
			url: 'http://suohb.free.idcfengye.com/jsapi',
			data: {
				url: window.location.href.split('#')[0]
			}
		}).then(res => {
			document.querySelector("#log").innerHTML = JSON.stringify(res.data, '  ')
		})
	}

	getSignature()
</script>
```

![33.png](https://upload-images.jianshu.io/upload_images/17573849-62998e0e8e912cb4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


###  3.config注入权限验证配置并判断客户端支持情况(wx.checkJsApi)

* 修改/static/index.html

```javascript
let jsApiList = ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard']
...
function wxConfig(data) {
	return new Promise((resolve, reject) => {
		wx.config({
			...data,
			jsApiList
		})
		wx.error(err => {
			reject(err)
		})
		wx.ready(() => {
			resolve()
		})
	})
}

getSignature().then(res => {
	return wxConfig(res)
}).then(() => {
	wx.checkJsApi({
		jsApiList, // 需要检测的JS接口列表，所有JS接口列表见附录2,
		success: function (res) {
			document.querySelector("#log").innerHTML = JSON.stringify(res)
		}
	});
})
```

### 4.分享接口

* 修改index.html

```javascript
//需在用户可能点击分享按钮前就先调用
function share() {
	let shareData = {
		title: '分享的标题',
		desc: '分享的描述呀！！！',
		link: window.location.href,
		imgUrl: `${window.location.origin}/images/share.png`
	}
	wx.updateAppMessageShareData({
		...shareData,
		success: function () { }
	})
	wx.ready(function () {
		wx.updateTimelineShareData({
			...shareData,
			success: function () { }
		})
	});
}

getSignature().then(res => {
	return wxConfig(res)
}).then(() => {
	...
	share()
})
```

* 在手机端访问页面，并分享给好友

![35.jpg](https://upload-images.jianshu.io/upload_images/17573849-ab2a3397adee3e86.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


### 5.图像接口-拍照或从手机选择图片

* 修改/static/index.html

```html
<button onclick="chooseImage()">chooseImage</button>
<div id="log" style="word-break: break-all;">HOME_PAGE</div>
<script>
...
	function chooseImage() {
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
				document.querySelector("#log").innerHTML = `<img src='${localIds[0]}' style='width:90%;height:auto;'/>`
			}
		});
	}
</script>
```

* 手机端访问

![36.jpg](https://upload-images.jianshu.io/upload_images/17573849-fccd300bdae8a989.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)

![37.jpg](https://upload-images.jianshu.io/upload_images/17573849-a5b4e58cfd6d107b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


**其他图片接口，请参照文档自己练习**

### 6.音频接口

* 修改/static/index.html

```javascript
<button id="vioce" onclick="toogleRecord()">Record</button>
...
<script>
...
	let isInRecord = false
	function toogleRecord() {
		let logger = document.querySelector("#log")
		if (!isInRecord) {
			isInRecord = true
			wx.startRecord()
			logger.innerHTML = '开始录音。。。'
		} else {
			isInRecord = false
			wx.stopRecord({
				success: function (res) {
					let localId = res.localId;
					logger.innerHTML = '录音结束，开始播放。。。'
					wx.playVoice({
						localId: localId,
						success: function () {
							logger.innerHTML = '播放成功！'
						},
						fail: function () {
							logger.innerHTML = '播放失败！'
						}
					});
				},
				fail: function () {
					logger.innerHTML = '录音失败!!!'
				},
				cancel: function () {
					logger.innerHTML = '取消录音'
				}
			})
		}
	}
</script>
```

* 手机访问地址，点击Record按钮

![38.jpg](https://upload-images.jianshu.io/upload_images/17573849-b438001b4ba73a0a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)


**其他音频接口，请参照文档自己练习**



### 7.**获取地理位置接口**

* 修改/static/index.html

```html
<button onclick="getLocation()">getLocation</button>
...
<script>
	function getLocation() {
		wx.getLocation({
			type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
			success: function (res) {
				var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
				var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
				var speed = res.speed; // 速度，以米/每秒计
				var accuracy = res.accuracy; // 位置精度
				document.querySelector("#log").innerHTML = `${longitude},${latitude}`
			}
		});
	}
</script>
```

* 手机访问，点击getLocation按钮

![39.jpg](https://upload-images.jianshu.io/upload_images/17573849-c0f03c37663b4628.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)




### 8.**关闭当前网页窗口接口**

* 修改/static/index.html

```html
<button onclick="closeWindow()">closeWindow</button>
...
<script>
	function closeWindow() {
		wx.closeWindow()
	}
</script>
```

* 点击按钮closeWindow 关闭当前网页



### 9.界面操作-隐藏显示按钮

* 修改/static/index.html

```html
<button onclick="hideMenu()">hideMenu</button>
<button onclick="showMenu()">showMenu</button>
...
<script>
	let menuList = ["menuItem:exposeArticle", "menuItem:setFont", "menuItem:dayMode", "menuItem:nightMode", "menuItem:refresh", "menuItem:profile", "menuItem:addContact", "menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand"]
	function hideMenu() {
		wx.hideAllNonBaseMenuItem()
		wx.hideMenuItems({
			menuList: menuList // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
		})
	}
	function showMenu() {
		wx.showAllNonBaseMenuItem()
		wx.showMenuItems({
			menuList: menuList // 要显示的菜单项，所有menu项见附录3
		})
	}
</script>
```

* 切换showMenu和hideMenu按钮

![40.jpg](https://upload-images.jianshu.io/upload_images/17573849-4985d6e9e067afde.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)

![41.jpg](https://upload-images.jianshu.io/upload_images/17573849-742f65dbb97f284e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/440)




### 10.微信扫一扫

* 修改/static/index.html

```javascript
<button onclick="scanQRCode()">scanQRCode</button>
...
<script>
	function scanQRCode() {
		wx.scanQRCode({
			needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			success: function (res) {
				var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				document.querySelector("#log").innerHTML = result
			}
		})
	}
</script>
```





到这里，测试公众号的基本功能已经测试完毕，其他相关开发，以后在慢慢整理。

未完待续。。。

git仓库地址：https://github.com/shb190802/wechat

都看到这里，给作者点个赞。

关注我的微信公众号，看更多有意思的文章。

![](http://suohb.com/images/qr.jpg)

