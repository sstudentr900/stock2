const {getGoogleSheet} = require("./googleSheet");
const { runStock,getStockData } = require("./stock");
// getGoogleSheet().then(rows=>{
//   rows.forEach((row) => {
//     const code = row._rawData[0]
//     const method = row._rawData[1]
//     runStock(code,method)
//   });
// })
// getStockData(2330)


// 引用linebot SDK
const linebot = require('linebot');

// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: '1654921355',
  channelSecret: '6aecda9fc9f58ddb9e452f977c80bbb1',
  channelAccessToken: 'ICWCKiPXFGVqfPc92uF1ZJuybJakn4rhH5ih3EeA47N6RbIP0VZbMLywZQt9McHCYvh8zB/qohLtO1CTd+NT6wIlj1BIXNTP7j4cE0kRxr+v9OL7aJeSE7zhYsDm7BoHriS7NfKILJQPqkC7DSWDyQdB04t89/1O/w1cDnyilFU='
});

// 當有人傳送訊息給Bot時
bot.on('message', function (event) {
  // event.message.text是使用者傳給bot的訊息
  // 準備要回傳的內容
  const replyMsg = `Hello你剛才說的是:${event.message.text}`;
  // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
  event.reply(replyMsg).then(function (data) {
  // event.reply(event.message.text).then(function (data) {
    // 當訊息成功回傳後的處理
    console.log('successs',data)
  }).catch(function (error) {
    // 當訊息回傳失敗後的處理
    console.log('error',error)
  });
  
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', 3000, function () {
    console.log('BOT已準備就緒');
});