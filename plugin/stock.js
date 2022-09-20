const request = require("request");
const { googleSheetGetData } = require("./googleSheet");
function getTimes(monthLength){
  const dt = new Date();
  let year = Number(dt.getFullYear());//111
  let month = Number(dt.getMonth())+2;//+2是因為第一次減1
  const date = '01';//日期固定01日
  const monthFn = function(month){
    //2=>02
    return (month>=10?month:'0'+month).toString()
  }
  //['20220701','20220801','20220901']
  return Array.from({
    length: monthLength
  }, (val, index) => {
    month -= 1
    //year 111,110
    //month 12,11,10 
    if(month==0){
      year -= 1
      month = 12
    }

    //'1110301'
    return year.toString()+monthFn(month)+date
  }); 
} 
function stockPromise(obj){
  return new Promise( (resolve, reject) => {
    setTimeout(()=>{
      request(obj,(error, response, body)=>{
        if (error) {
          reject(error);
        } else {
          resolve(body)
        }
      });
    },0)
  })
}
async function stockGetData(stockNo,monthLength=3){
  let stockData = []
  //['20220701','20220801','20220901']
  let dates = getTimes(monthLength)
  for(let date of dates){   
    let jsonUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + date + "&stockNo=" + stockNo;
    let body = ''
    console.log('jsonUrl',jsonUrl)
    try{
      body = await stockPromise({url: jsonUrl,method: "GET"})
      body = JSON.parse(body)
    }catch(error){
      //請求錯誤訊息
      console.log(`stockGetData ${stockNo} request ${date} date ${error}`)
      return `stockGetData ${stockNo} request ${date} date ${error}`
    }
    //請求成功但沒有資料
    if(body.stat!='OK'){
      console.log(`stockGetData_body ${stockNo} request ${date} date ${body.stat}`)
      return `stockGetData_body ${stockNo} request ${date} date ${body.stat}`
    }
    let jsons = body.data
    // console.log('jsons',jsons)
    let array = jsons.map(json=>{
      return {
        // 'Date':Number(json[0].split('/').join('')),
        'Date':json[0],
        'Open':Number(json[3]),
        'Hight':Number(json[4]),
        'Low':Number(json[5]),
        'Close':Number(json[6]),
        'Volume':Number(json[8].replace(/,/g,''))
      };
    })
    stockData = stockData.concat(array)
  }
  //時間排序小到大
  stockData.sort((o1,o2)=>o1.Date.split('/').join('')-o2.Date.split('/').join(''))
  // console.log(stockData)
  return stockData;
}
async function stockExdividend(stockNo){
  //除息
  const jsonUrl = 'https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL'
  return await stockPromise({url: jsonUrl,method: "GET"})
  .then(body=>JSON.parse(body))
  .then(datas=>datas.filter(data=>data.Code==stockNo))
}
async function stockNetWorth(stockNo){
  //淨值
  const jsonUrl = 'https://mis.twse.com.tw/stock/data/all_etf.txt?1663653801433'
  return await stockPromise({url: jsonUrl,method: "GET"})
  .then(body=>JSON.parse(body))
  .then(data=>data.a1)
  .then(a1s=>{
    let result = false;
    for(a1 of a1s){
      const msgs = a1.msgArray
      if(msgs){
        for(msg of msgs){
          // console.log(msg.a,stockNo)
          if(msg.a==stockNo){
            result = msg
          }
        }
      }
    }
    return result;
  })
}
async function stockYield(stockNo){
  //殖利率
  console.log('stockYield')
  const jsonUrl = 'https://www.twse.com.tw/zh/ETF/etfDiv'
  return await stockPromise({url: jsonUrl,method: "POST",form:{stkNo: "0050",startYear: "2017",endYear: "2020"}})
  .then(body=>body)
  .then(datas=>{
    console.log(datas)
    // datas.forEach(datas=>{
      // if(data.stockNo==stockNo){
      //   console.log('殖利率',stockNo)
      //   // data.dividends
      //   const dt = new Date();
      //   let year = Number(dt.getFullYear());//111
      //   console.log(year)
      // }
    // })
  })
}
function stockPercentage(stockData,time){
  const end = stockData[stockData.length-1]['Close']
  const start = stockData[stockData.length-(1+time)]?.Close
  //https://bobbyhadz.com/blog/javascript-cannot-read-property-of-undefined
  if(start){
    return (((end-start)/start)*100).toFixed(2)+'%'
  }else{
    return '0%'
  }
}
function stockYearPrice(stockData){
  let maxClose = stockData.reduce((a,b)=>a.Close>=b.Close?a:b)['Close']
  let minClose = stockData.reduce((a,b)=>a.Close<=b.Close?a:b)['Close']
  return {'max':maxClose,'min':minClose} 
}
function stockGetkdData(stockData){
  let day = 9
  let K = 0
  let D = 0
  let kdData = []
  let kdFn = function(nineDayData){
    // 最近九天的最低價,最高價
    let minClose = nineDayData.reduce((pre,cur)=>pre.Close<cur.Close?pre:cur).Close
    let maxClose = nineDayData.reduce((pre,cur)=>pre.Close>cur.Close?pre:cur).Close
    // 今日收盤價
    let todayClose = nineDayData[nineDayData.length-1].Close
    //RSV = ( 今日收盤價 - 最近九天的最低價 ) / ( 最近九天的最高價 - 最近九天最低價 )
    let rsv = 100 * (todayClose-minClose) / (maxClose - minClose)
    //K = 2/3 * ( 昨日K值 ) + 1/3 * ( 今日RSV )
    K = (2/3) * K + (1/3) * rsv
    //D = 2/3 * ( 昨日D值 ) + 1/3 * ( 今日K值 )
    D = (2/3) * D + (1/3) * K
    return {
      date: nineDayData[nineDayData.length-1].Date,
      K: (K).toFixed(2),
      D: (D).toFixed(2)
    }
  }
  stockData.forEach((element,index) => {
    let ind = index+1;
    if(ind>day){
      let star = ind-day
      let end =  ind
      //0~9,1~10
      let nineDayData = stockData.slice(star,end)
      kdData.push(kdFn(nineDayData))
    }
  });
  return kdData
}
function stockKdFn(stockData,stockNo,stockName,method,dataSymbol){
  // console.log(`kdFn get ${stockNo} data`)
  let kdDatas = stockGetkdData(stockData)
  let kdData = kdDatas[kdDatas.length-1]
  let nowValue = ''
  let message = `${kdData['date']},${stockName}(${stockNo}),目前${dataSymbol}值${kdData[dataSymbol]} `
  if(~method.indexOf('<')){
    nowValue = Number(method.split('<')[1])
    if(Number(kdData[dataSymbol])<nowValue){
      message += `【有符合】${dataSymbol}值<${nowValue}`
    }else{
      message += `【沒有符合】${dataSymbol}值<${nowValue}`
    }
  }
  if(~method.indexOf('>')){
    nowValue = Number(method.split('>')[1])
    if(Number(kdData[dataSymbol])>nowValue){
      message += `【有符合】${dataSymbol}值>${nowValue}`
    }else{
      message += `【沒有符合】${dataSymbol}值>${nowValue}`
    }
  }
  console.log('kdFn_message',message)
  return message;
}
function stockStart(stockNo,stockName,method,stockData) {
  //kd
  console.log(`stockStart ${stockNo}`)
  if(~method.indexOf('k')){
    return stockKdFn(stockData,stockNo,stockName,method,'K')
  }
  if(~method.indexOf('d')){
    return stockKdFn(stockData,stockNo,stockName,method,'D')
  }
};
module.exports={
  stockStart,
  stockGetData,
  stockPercentage,
  stockYearPrice,
  stockNetWorth,
  stockExdividend,
  stockYield
}

// stockStart();