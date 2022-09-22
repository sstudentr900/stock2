const { googleSheetGetData } = require("./plugin/googleSheet");
const { stockPromise,stockStart,stockGetData,stockPercentage,stockYearPrice,stockNetWorth,stockExdividend,stockYield } = require("./plugin/stock");

const stockETF = (event)=>{
  googleSheetGetData('340899742')
  .then(async(sheet)=>{
    const jsonUrl = 'https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.etfRanking;limit=100;offset=0;rankId=dividend?bkt=&device=desktop&ecma=modern&feature=ecmaModern%2CuseNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=1g1o49lhiise4&region=TW&site=finance&tz=Asia%2FTaipei&ver=1.2.1466&returnMeta=true'
    const etfData = await stockPromise({url: jsonUrl,method: "GET"}).then(body=>JSON.parse(body)).then(body=>body.data.list)
    const rows = await sheet.getRows();
    const etfArray = []
    let message = []
    for(etf of etfData){
      console.log(etf.symbolName)
      for (let [rowIndex, row] of rows.entries()) {
        const stockNo = row['stockNo']
        // const stockName = row['stockName']
        // const method = row['method']
        let value = row['value']
        let yieldValue = row['yieldValue']
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
        etfArray.push({'stockNo':`${etf.symbolName}(${etf.symbol.split('.')[0]})`});
      } 
    }
    const moreRows = await sheet.addRows(etfArray);

 
    

    //   //date,price
    //   const todayData = value[value.length-1]
    //   let todayTimeArray = todayData['Date'].split('/')
    //   todayTimeArray = Number(todayTimeArray[0])+1911+'/'+todayTimeArray[1]+'/'+todayTimeArray[2]
    //   rows[rowIndex].date = todayTimeArray
    //   rows[rowIndex].price = todayData['Close']

    //    //netWorth 淨值
    //   const netWorth = await stockNetWorth(stockNo)
    //   if(netWorth){
    //     // console.log('netWorth淨值',netWorth)
    //     rows[rowIndex].netWorth = `${netWorth.f} / ${netWorth.g}%` 
    //   }

    //   //dayPercentage,weekPercentage,monthPercentage,halfYearPercentage,yearPercentage
    //   rows[rowIndex].dayPercentage = stockPercentage(value,3)
    //   rows[rowIndex].weekPercentage = stockPercentage(value,5)
    //   rows[rowIndex].monthPercentage = stockPercentage(value,20)
    //   rows[rowIndex].halfYearPercentage = stockPercentage(value,120)
    //   rows[rowIndex].yearPercentage = stockPercentage(value,240)

    //   //yearHightPrice,yearLowPrice 
    //   const yearPrice = stockYearPrice(value)
    //   rows[rowIndex].yearHightPrice = yearPrice['max']
    //   rows[rowIndex].yearLowPrice = yearPrice['min']
    //   rows[rowIndex].yearDifference = yearPrice['diffind']

    //   //exdividend 除息
    //   const exdividendDay = await stockExdividend(stockNo)
    //   if(exdividendDay.length){
    //     rows[rowIndex].exdividendDay = `${exdividendDay[0]['Date']} / ${Number(exdividendDay[0]['CashDividend']).toFixed(2)}` 
    //   }

    //   //yield 殖利率
    //   const yield = await stockYield(stockNo,value,yieldValue)
    //   if(yield){
    //     console.log('monthYield',yield['monthYield'])
    //     console.log('threeMonthYield',yield['threeMonthYield'])
    //     rows[rowIndex].exdividendAverage = yield['exdividendAverage']
    //     rows[rowIndex].exdividendBefore = yield['exdividendBefore']
    //     rows[rowIndex].exdividendBefore1 = yield['exdividendBefore1']
    //     rows[rowIndex].exdividendBefore2 = yield['exdividendBefore2']
    //     rows[rowIndex].nowYield = yield['nowYield']
    //     rows[rowIndex].monthYield = yield['monthYield']
    //     rows[rowIndex].threeMonthYield = yield['threeMonthYield']
    //     rows[rowIndex].halfYearYield = yield['halfYearYield']
    //     rows[rowIndex].yearYield = yield['yearYield']
    //     rows[rowIndex].yieldValue = JSON.stringify(yield['yearArray'])
    //   }
      
    //   //save
    //   rows[rowIndex].value = JSON.stringify(value)
    //   rows[rowIndex].save()
    // }

  })
}

stockETF()
