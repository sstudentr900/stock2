const { googleSheetGetData } = require("./plugin/googleSheet");
const { stockPromise,stockStart,stockGetData,stockPercentage,stockYearPrice,stockNetWorth,stockExdividend,stockYield } = require("./plugin/stock");

const stockETF = async(event)=>{
  const jsonUrl = 'https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.etfRanking;limit=100;offset=0;rankId=dividend?bkt=&device=desktop&ecma=modern&feature=ecmaModern%2CuseNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=1g1o49lhiise4&region=TW&site=finance&tz=Asia%2FTaipei&ver=1.2.1466&returnMeta=true'
  const etfData = await stockPromise({url: jsonUrl,method: "GET"}).then(body=>JSON.parse(body)).then(body=>body.data.list)
  const sheet = await googleSheetGetData('340899742').then(sheet=>sheet)
  const rows = await sheet.getRows();
  const array = []
  let message = []

  for(etf of etfData){
    const stockNo = etf.symbol.split('.')[0]
    let value = []
    let yieldValue = []
    console.log(etf.symbolName,stockNo)

    //value
    for (let [rowIndex, row] of rows.entries()) {
      if(row['stockNo'] && row['value'] && stockNo==row['stockNo']){
        yieldValue = JSON.parse(row['yieldValue'])
        value = JSON.parse(row['value'])
        const valueLastDate = value[value.length-1]['Date'].split('/')[2]
        const dt = new Date();
        const date = dt.getDate();//30
        //日期小於今天取值
        if(Number(valueLastDate)!=date && Number(valueLastDate)<date){
          console.log('日期小於今天取值')
          const datas = await stockGetData(stockNo,1)
          if(typeof datas=='string')return message.push(datas);//回傳錯誤請求
          value.push(datas[datas.length-1])
          break;
        }
      }
    } 
    //no value
    if(!value.length){
      console.log('no value 就取3個月')
      value = await stockGetData(stockNo,3)
      if(typeof value=='string')return message.push(value);//回傳錯誤請求
    }
    //超過900筆 只取900筆
    if(value.length>900){
      //刪除第一筆
      value.splice(0,1)
    }

    //date,price
    const todayData = value[value.length-1]
    let todayTimeArray = todayData['Date'].split('/')
    todayTimeArray = Number(todayTimeArray[0])+1911+'/'+todayTimeArray[1]+'/'+todayTimeArray[2]

    //netWorth 淨值
    // const netWorth = await stockNetWorth(stockNo)

    //dayPercentage,weekPercentage,monthPercentage,halfYearPercentage,yearPercentage
    // rows[rowIndex].dayPercentage = stockPercentage(value,3)
    // rows[rowIndex].weekPercentage = stockPercentage(value,5)
    // rows[rowIndex].monthPercentage = stockPercentage(value,20)
    // rows[rowIndex].halfYearPercentage = stockPercentage(value,120)
    // rows[rowIndex].yearPercentage = stockPercentage(value,240)


    //yearHightPrice,yearLowPrice 
    const yearPrice = stockYearPrice(value)
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
    // if(yield){
    //   console.log('monthYield',yield['monthYield'])
    //   console.log('threeMonthYield',yield['threeMonthYield'])
    //   rows[rowIndex].exdividendAverage = yield['exdividendAverage']
    //   rows[rowIndex].exdividendBefore = yield['exdividendBefore']
    //   rows[rowIndex].exdividendBefore1 = yield['exdividendBefore1']
    //   rows[rowIndex].exdividendBefore2 = yield['exdividendBefore2']
    //   rows[rowIndex].nowYield = yield['nowYield']
    //   rows[rowIndex].monthYield = yield['monthYield']
    //   rows[rowIndex].threeMonthYield = yield['threeMonthYield']
    //   rows[rowIndex].halfYearYield = yield['halfYearYield']
    //   rows[rowIndex].yearYield = yield['yearYield']
    //   rows[rowIndex].yieldValue = JSON.stringify(yield['yearArray'])
    // }

    array.push({
      'stockName':`${etf.symbolName}(${stockNo})`,
      'value': JSON.stringify(value),
      'date': todayTimeArray,
      'price': todayData['Close'],
      'netWorth': await stockNetWorth(stockNo),
      'dayPercentage': stockPercentage(value,3),
      'weekPercentage': stockPercentage(value,5),
      'monthPercentage': stockPercentage(value,20),
      'halfYearPercentage': stockPercentage(value,120),
      'yearPercentage': stockPercentage(value,240),
      'yearHightPrice': yearPrice['max'],
      'yearLowPrice': yearPrice['min'],
      'yearDifference': yearPrice['diffind'],
      'exdividendDay': await stockExdividend(stockNo),
      'exdividendAverage': yield['exdividendAverage'],
      'exdividendBefore': yield['exdividendBefore'],
      'exdividendBefore1': yield['exdividendBefore1'],
      'exdividendBefore2': yield['exdividendBefore2'],
      'nowYield': yield['nowYield'],
      'monthYield': yield['monthYield'],
      'threeMonthYield': yield['threeMonthYield'],
      'halfYearYield': yield['halfYearYield'],
      'yearYield': yield['yearYield'],
      'yieldValue': JSON.stringify(yield['yieldValue']),
    });
  }
  console.log(array)
  //sheet addRows
  await sheet.addRows(array);
}

stockETF()
