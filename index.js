const { bot,eateNow,eateSearch,eateSave,wordNow,wordSearch,wordSave,stockNow,stockSearch } = require("./plugin/lineBot");

// 當有人傳送訊息給Bot時
bot.on('message', function (event) {
  //接收訊息訊息
  const userMessage = event.message.text;
  if(~userMessage.indexOf('阿雞記吃的')){  
    eateSave(userMessage,event)
  }else if(~userMessage.indexOf('阿雞要吃什麼')){
    eateSearch(event)
  }else if(~userMessage.indexOf('阿雞顯示吃的')){
    eateNow(event)
  }else if(~userMessage.indexOf('阿雞記關鍵字')){
    wordSave(userMessage,event)
  }else if(~userMessage.indexOf('阿雞顯示關鍵字')){
    wordNow(event)
  }else if(~userMessage.indexOf('阿雞目前股票')){
    stockSearch(event)
  }else if(~userMessage.indexOf('阿雞顯示股票')){
    stockNow(event)
  }else{
    //亂數取阿雞表單資料
    wordSearch(userMessage,event)
  }
});



// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook',process.env.port || 3000, function () {
    console.log('BOT已準備就緒');
});


