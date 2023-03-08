const { googleSheetGetData } = require("./plugin/googleSheet");
const { stockPromise,stockGrap } = require("./plugin/stock");

//更新股票
const updataStock = async(event)=>{
  const sheet = await googleSheetGetData('340899742').then(sheet=>sheet)
  const sheetData = await sheet.getRows();
  //抓取單一個
  // for (let [rowIndex, row] of sheetData.entries()) {
  //   const stockNames = row['stockName']
  //   if(stockNames=='富邦臺灣中小(00733)'){
  //     console.log(stockNames)
  //     const stockNo = stockNames.split('(')[1].split(')')[0]
  //     const stockName = stockNames.split('(')[0]
  //     const stockData = row['stockData']?row['stockData']:''
  //     const yieldValue = row['yieldValue']?row['yieldValue']:''
  //     const method = row['method']?row['method']:''
  //     const stockRecult = await stockGrap({stockNo,stockName,yieldValue,stockData,method})
  //   }
  // }
  //跑全部
  for (let [rowIndex, row] of sheetData.entries()) {
    const stockNames = row['stockName']
    console.log('------'+stockNames+'------')
    if(!stockNames)continue;
    const stockNo = stockNames.split('(')[1].split(')')[0]
    const stockName = stockNames.split('(')[0]
    // const stockData = row['stockData']?row['stockData']:''
    const stockData = ''
    const yieldValue = row['yieldValue']?row['yieldValue']:''
    const method = row['method']?row['method']:''
    const stockRecult = await stockGrap({stockNo,stockName,yieldValue,stockData,method})
    if(!stockRecult)continue;
    // sheetData[rowIndex].stockName = stockName
    sheetData[rowIndex].stockNo = stockNo
    sheetData[rowIndex].price = stockRecult.price
    // sheetData[rowIndex].methodReturn = stockRecult.methodReturn
    sheetData[rowIndex].stockData = stockRecult.stockData
    sheetData[rowIndex].stockData_w = stockRecult.stockData_w
    // sheetData[rowIndex].volume = stockRecult.volume
    sheetData[rowIndex].netWorth = stockRecult.netWorth
    sheetData[rowIndex].dayPrice = stockRecult.dayPrice
    sheetData[rowIndex].weekPrice = stockRecult.weekPrice
    sheetData[rowIndex].monthPrice = stockRecult.monthPrice
    sheetData[rowIndex].halfYearPrice = stockRecult.halfYearPrice
    sheetData[rowIndex].yearPrice = stockRecult.yearPrice
    sheetData[rowIndex].twoYearPrice = stockRecult.twoYearPrice
    sheetData[rowIndex].threeYearPrice = stockRecult.threeYearPrice
    sheetData[rowIndex].nowYield = stockRecult.nowYield
    sheetData[rowIndex].yieldValue = stockRecult.yieldValue
    sheetData[rowIndex].cheapPrice = stockRecult.cheapPrice
    sheetData[rowIndex].fairPrice = stockRecult.fairPrice
    sheetData[rowIndex].expensivePrice = stockRecult.expensivePrice
    sheetData[rowIndex].exdividendAverage = stockRecult.exdividendAverage
    sheetData[rowIndex].kdData = stockRecult.kdData
    sheetData[rowIndex].kValue = stockRecult.kValue
    sheetData[rowIndex].save()

    console.log('完成')
  }
  console.log('-----全部完成----')
}
//更新增加股票名
const updataStockName = async(event)=>{
  const sheet = await googleSheetGetData('340899742').then(sheet=>sheet)
  const sheetData = await sheet.getRows();
  const ajaxUrl = 'https://etf.masterlink.com.tw/API/Data/F1_10_ETFPerf.json?t=0.8649854163488351';
  const ajaxData = await stockPromise({url: ajaxUrl,method: "GET"}).then(body=>JSON.parse(body))
  let sheetAddRow = []
  for(const [etfIndex,ajaxRow] of ajaxData.entries()){
    const sheetLength = sheetData.filter(({stockNo})=>stockNo == ajaxRow['V1']).length
    if(sheetLength==0){
      sheetAddRow.push({stockName:`${ajaxRow['V2']}`,stockNo:`${ajaxRow['V1']}`})
    }
  }
  if(sheetAddRow.length){
    //await sheet.addRows([{ stock: 'a'},{ stock: 'b' }]); save 多個
    //await sheet.addRow({ stock: 'a'); save 單個
    await sheet.addRows(sheetAddRow);
  }
}
// updataStockName()
updataStock()
