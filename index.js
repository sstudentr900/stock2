const {googleSheetGetData} = require("./googleSheet");
const { stockStart,stockGetData } = require("./stock");
const { bot } = require("./lineBot");
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
bot.listen('/linewebhook',process.env.port || 80, function () {
    console.log('BOT已準備就緒');
});
