const {googleSheetGetData} = require("./plugin/googleSheet");
const { stockStart,stockGetData } = require("./plugin/stock");
const { bot } = require("./plugin/lineBot");
function randomFn(length){
  return Math.floor(Math.random()*length)
}
function eateSearch(event){
  googleSheetGetData('1151243845')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    const shops = [];
    for (row of rows) {
      shops.push(row._rawData[0]);
    }
    // console.log(shops)
    const shopName = shops[randomFn((shops.length-1))]
    // console.log(shopName)

    //reply
    event.reply({
      'type': 'text',
      'text': shopName
    })
    
    //要抓取位置
    // event.reply({
    //   "type": "location",
    //   "title": "my location",
    //   "address": "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
    //   "latitude": 35.687574,
    //   "longitude": 139.72922
    // })
  })
}
function eateSave(userMessage,event){
  googleSheetGetData('1151243845')
  .then(async(sheet)=>{
    const array = userMessage.split(',')//[ '阿雞記吃的', '龍點心' ]
    const rows = await sheet.getRows();
    let word = array[1]
    for (row of rows) {
      if(row['shopName']==word){
        word = false
        break;
      }
    }
    // append
    if(word){
      await sheet.addRow({'shopName':word});
    }

    //reply
    // event.reply('好的，我記住了')
  })
}
function wordSave(userMessage,event){
  googleSheetGetData('1813117258')
  .then(async(sheet)=>{
    const array = userMessage.split(',')//[ '阿雞記關鍵字', '1', '2' ]
    const rows = await sheet.getRows();
    const question = array[1]
    let message = '好的，我記住了'
    let answer = array[2]
    for (let [rowIndex, row] of rows.entries()) {
      // console.log(index, row)
      // console.log('有沒有該question',row['question']==question,row['question'],question)
      if(row['question']==question){
        let rawData = row._rawData.slice()
        rawData.shift()
        // console.log('有沒有該answer(-1)',rawData.indexOf(answer),rawData,answer)
        if(rawData.indexOf(answer)==-1){
          // console.log('n repeat')
          // console.log('該length>4',rawData.length)
          if(rawData.length>4){
            // console.log('more than 5')
            message = '超過儲存數'
            answer = false
            break;
          }else{
            // console.log('<5')
            //updat
            rows[rowIndex].question = question
            rawData.push(answer)
            // console.log('rowIndex',rowIndex)
            // console.log('rawData push',rawData)
            rawData.forEach((element,index) => {
              // console.log('forEach',element,index)
              rows[rowIndex]['answer'+(index+1)] = element
            });

            await rows[rowIndex].save();
            answer = false
            break;
          }
          
        }else{
          // console.log('y repeat')
          answer = false
          break;
        }
      }
    }

    // append
    if(answer){
      await sheet.addRow({'question':question,'answer1':answer});
    }

    //reply
    // event.reply(message)
  })
}
function wordSearch(userMessage,event){
  googleSheetGetData('1813117258')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    let message = ''
    for(let [index,row] of rows.entries()){
      if(row['question']==userMessage){
        let words = row._rawData.slice()
        message = words[randomFn(words.length-1)]
        break;
      }
    }

    console.log(message)
    //reply
    // event.reply(message)
  })
}

// eateSearch()
// eateSave('阿雞記吃的,龍點心')
// wordSave('阿雞記關鍵字,1,3')
// wordSearch(1)

// 當有人傳送訊息給Bot時
bot.on('message', function (event) {
  //接收訊息訊息
  const userMessage = event.message.text;
  if(~userMessage.indexOf('阿雞記吃的')){  
    eateSave(userMessage,event)
  }else if(~userMessage.indexOf('吃什麼')){
    eateSearch(event)
  }else if(~userMessage.indexOf('阿雞記關鍵字')){
    wordSave(userMessage,event)
  }else{
    //亂數取阿雞表單資料
    wordSearch(userMessage,event)
  }

    //回傳方式
    //location
    // event.reply({
    //   "type": "location",
    //   "title": "my location",
    //   "address": "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
    //   "latitude": 35.687574,
    //   "longitude": 139.72922
    // })
});



// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook',process.env.port || 80, function () {
    console.log('BOT已準備就緒');
});


