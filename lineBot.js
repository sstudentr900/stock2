// 引用linebot SDK
const config = require("./config");
const linebot = require('linebot');
const userId = config.lineID;//Your User ID
// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: config.lineChannelId,
  channelSecret: config.lineSecret,
  channelAccessToken: config.lineAccessToken
});

// 當有人傳送訊息給Bot時
// bot.on('message', function (event) {
//   // event.message.text是使用者傳給bot的訊息
//   // 準備要回傳的內容
//   const replyMsg = `Hello你剛才說的是:${event.message.text}`;
//   // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
//   event.reply(replyMsg).then(function (data) {
//   // event.reply(event.message.text).then(function (data) {
//     // 當訊息成功回傳後的處理
//     console.log('successs',data)
//   }).catch(function (error) {
//     // 當訊息回傳失敗後的處理
//     console.log('error',error)
//   });
  
// });

// // Bot所監聽的webhook路徑與port
// bot.listen('/linewebhook', 3000, function () {
//     console.log('BOT已準備就緒');
// });

//push
const linePush = (message)=>{
  bot.push(userId, [message]);
  // console.log('linePush: ' + message);
  console.log('linePush');
}

module.exports = {
  linePush
} 
