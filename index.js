// const { bot,eateNow,eateSearch,eateSave,wordNow,wordSearch,wordSave,stockNow,stockSearch } = require("./plugin/lineBot");

// // 當有人傳送訊息給Bot時
// bot.on('message', function (event) {
//   //接收訊息訊息
//   const userMessage = event.message.text;
//   if(~userMessage.indexOf('阿雞記吃的')){  
//     eateSave(userMessage,event)
//   }else if(~userMessage.indexOf('阿雞要吃什麼')){
//     eateSearch(event)
//   }else if(~userMessage.indexOf('阿雞顯示吃的')){
//     eateNow(event)
//   }else if(~userMessage.indexOf('阿雞記關鍵字')){
//     wordSave(userMessage,event)
//   }else if(~userMessage.indexOf('阿雞顯示關鍵字')){
//     wordNow(event)
//   }else if(~userMessage.indexOf('阿雞目前股票')){
//     stockSearch(event)
//   }else if(~userMessage.indexOf('阿雞顯示股票')){
//     stockNow(event)
//   }else{
//     //亂數取阿雞表單資料
//     wordSearch(userMessage,event)
//   }
// });



// Bot所監聽的webhook路徑與port
// bot.listen('/linewebhook',process.env.PORT || 3000, function () {
//     console.log('BOT已準備就緒');
// });




const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3310
//json
app.use(bodyParser.text({type: '*/*'}))
//ejs 
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
  // res.send('Hello World2!')
  res.render('homePage',{
    message: 'Hello World',
    countList: [0,1,1,2,3,5,8,13,21]
  })
})

app.post('/user', (req, res) => {
  var user = JSON.parse(req.body)
  res.send('user info is ' + JSON.stringify(user))
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

