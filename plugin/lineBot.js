// 引用linebot SDK
const axios = require('axios');
const linebot = require('linebot');
const config = require("./config");
const { googleSheetGetData } = require("./googleSheet");
const { stockStart,stockGetData,stockPercentage,stockYearPrice,stockNetWorth,stockExdividend,stockYield } = require("./stock");
const userId = config.lineID;//Your User ID
// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: config.lineChannelId,
  channelSecret: config.lineSecret,
  channelAccessToken: config.lineAccessToken
});
//fn
const randomFn = (length)=>{
  return Math.floor(Math.random()*length)
}
const linePushFn = (message)=>{
  bot.push(userId, [message]);
  // console.log('linePushFn: ' + message);
  console.log('linePushFn');
}
//eate
const eateNow = (event)=>{
  googleSheetGetData('1151243845')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    const array = [];
    for (row of rows) {
      array.push(row._rawData[0]);
    }

    message = array.join('\n')
    event.reply(message)
  })
}
const eateSearch = (event)=>{
  googleSheetGetData('1151243845')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    const shops = [];
    for (row of rows) {
      shops.push(row._rawData[0]);
    }
    const shopName = shops[randomFn((shops.length-1))]
    // console.log(shopName)
    // console.log(shops)

    //reply text
    // event.reply({
    //   'type': 'text',
    //   'text': shopName
    // })
    //reply location
    // event.reply({
    //   "type": "location",
    //   "title": "my location",
    //   "address": "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
    //   "latitude": 35.687574,
    //   "longitude": 139.72922
    // })

    //google search url
    //https://www.google.com/maps/search/%E5%95%9E%E5%B7%B4%E9%BA%B5%E5%BA%97

    //get map location
    const serch = encodeURI(shopName)
    const axiosConfig = {
      method: 'get',
      url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='+serch+'&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key='+config.googleMapID,
    };
    axios(axiosConfig)
    .then(function (response) {
      // console.log('data',response.data)
      // location { lat: 22.9899117, lng: 120.1979533 }
      // console.log('location',response.data.candidates[0].geometry.location)
      // console.log('address',response.data.candidates[0].formatted_address)
      const location = response.data.candidates[0].geometry.location
      const address = response.data.candidates[0].formatted_address
      event.reply({
        "type": "location",
        "title": shopName,
        "address": address,
        "latitude": location.lat,
        "longitude": location.lng
      })
    })
    .catch(function (error) {
      console.log('eateSearch',error);
    });
  })
}
const eateSave = (userMessage,event)=>{
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
    event.reply('好的，我記住了')
  })
}
//word
const wordNow = (event)=>{
  googleSheetGetData('1813117258')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    const array = [];
    for (row of rows) {
      array.push(row._rawData.join(','));
    }
    message = array.join('\n')
    event.reply(message)
  })
}
const wordSave = (userMessage,event)=>{
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
        //複製array
        let rawData = row._rawData.slice()
        //取array第一個
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
    event.reply(message)
  })
}
const wordSearch = (userMessage,event)=>{
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

    // console.log(message)
    //reply
    event.reply(message)
  })
}
//stock
const stockNow = (event)=>{
  googleSheetGetData('340899742')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    const array = [];
    for (row of rows) {
      array.push(row._rawData.join(','));
    }
    message = array.join('\n')
    event.reply(message)
  })
}
const stockSearch = (event)=>{
  googleSheetGetData('760880998')
  .then(async(sheet)=>{
    const rows = await sheet.getRows();
    let message = []
    for (let [rowIndex, row] of rows.entries()) {
      const stockNo = row['stockNo']
      const stockName = row['stockName']
      const method = row['method']
      // let value = row['value']
      // let yieldValue = row['yieldValue']
      if(!stockNo)return;

      //get value
      if(value){
        // console.log('have value')
        value = JSON.parse(value)
        const valueLastDate = value[value.length-1]['Date'].split('/')[2]
        const dt = new Date();
        // const year = Number(dt.getFullYear());//2022
        // const month = Number(dt.getMonth())+1;//8
        // const hours = dt.getHours();//30
        //Number(valueLastDate[0])+1911!=year || Number(valueLastDate[1])!=month || (Number(valueLastDate[2])<date && hours>18)
        const date = dt.getDate();//30
        //日期小於今天取值
        if(Number(valueLastDate)!=date && Number(valueLastDate)<date){
          console.log('日期小於今天取值')
          const datas = await stockGetData(stockNo,1)
          if(typeof datas=='string')return message.push(datas);//回傳錯誤請求
          value.push(datas[datas.length-1])
        }
        //超過600筆 只取600筆
        if(value.length>900){
          //刪除第一筆
          value.splice(0,1)
        }
      }else{
        console.log('no value 就取6個月')
        value = await stockGetData(stockNo,6)
        if(typeof value=='string')return message.push(value);//回傳錯誤請求
      }

      //date,price
      // const todayData = value[value.length-1]
      // let todayTimeArray = todayData['Date'].split('/')
      // todayTimeArray = Number(todayTimeArray[0])+1911+'/'+todayTimeArray[1]+'/'+todayTimeArray[2]
      // rows[rowIndex].date = todayTimeArray
      // rows[rowIndex].price = todayData['Close']

       //netWorth 淨值
      // const netWorth = await stockNetWorth(stockNo)
      // if(netWorth){
      //   // console.log('netWorth淨值',netWorth)
      //   rows[rowIndex].netWorth = `${netWorth.f} / ${netWorth.g}%` 
      // }

      //dayPercentage,weekPercentage,monthPercentage,halfYearPercentage,yearPercentage
      // rows[rowIndex].dayPercentage = stockPercentage(value,3)
      // rows[rowIndex].weekPercentage = stockPercentage(value,5)
      // rows[rowIndex].monthPercentage = stockPercentage(value,20)
      // rows[rowIndex].halfYearPercentage = stockPercentage(value,120)
      // rows[rowIndex].yearPercentage = stockPercentage(value,240)

      //yearHightPrice,yearLowPrice 
      // const yearPrice = stockYearPrice(value)
      // rows[rowIndex].yearHightPrice = yearPrice['max']
      // rows[rowIndex].yearLowPrice = yearPrice['min']
      // rows[rowIndex].yearDifference = yearPrice['diffind']

      //exdividend 除息
      // const exdividendDay = await stockExdividend(stockNo)
      // if(exdividendDay.length){
      //   rows[rowIndex].exdividendDay = `${exdividendDay[0]['Date']} / ${Number(exdividendDay[0]['CashDividend']).toFixed(2)}` 
      // }

      //yield 殖利率
      const yield = await stockYield(stockNo,value,yieldValue)
      if(yield){
        console.log('monthYield',yield['monthYield'])
        console.log('threeMonthYield',yield['threeMonthYield'])
        rows[rowIndex].exdividendAverage = yield['exdividendAverage']
        rows[rowIndex].exdividendBefore = yield['exdividendBefore']
        rows[rowIndex].exdividendBefore1 = yield['exdividendBefore1']
        rows[rowIndex].exdividendBefore2 = yield['exdividendBefore2']
        rows[rowIndex].nowYield = yield['nowYield']
        rows[rowIndex].monthYield = yield['monthYield']
        rows[rowIndex].threeMonthYield = yield['threeMonthYield']
        rows[rowIndex].halfYearYield = yield['halfYearYield']
        rows[rowIndex].yearYield = yield['yearYield']
        rows[rowIndex].yieldValue = JSON.stringify(yield['yearArray'])
      }
      
      //save
      rows[rowIndex].value = JSON.stringify(value)
      rows[rowIndex].save()

      //method
      // if(method){
      //   message.push(stockStart(stockNo,stockName,method,value))
      // }
    }
  
    //linePushFn
    // message = message.join('\n')
    // console.log(message)

    //reply
    // if(event){
    //   event.reply(message)
    // }else{
    //   linePushFn(message)
    // }
  })
}

stockSearch()

module.exports = {
  stockSearch,
  stockNow,
  eateSearch,
  eateSave,
  eateNow,
  wordSearch,
  wordSave,
  wordNow,
  bot
} 
