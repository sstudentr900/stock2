const request = require("request");
const { googleSheetGetData } = require("./googleSheet");
function getTimes(monthLength){
  let dt = new Date();
  let year = Number(dt.getFullYear());//111
  let month = Number(dt.getMonth())+1;//8
  let date = dt.getDate();//30
  // date = date>=10?date:'0'+date
  //當月1號沒有資料減1個月
  if(date==1){
    month -=1
  }
  let nowMonth = month+1

  //日期固定01日
  date = '01';

  let monthFn = function(month){
    //2=>02
    return (month>=10?month:'0'+month).toString()
  }
  return Array.from({
    length: monthLength
  }, (val, index) => {
    nowMonth -= 1
    //year 111,110
    //month 12,11,10 
    if(nowMonth==0){
      year -= 1
      nowMonth = 12
    }

    //'1110301'
    return year.toString()+monthFn(nowMonth)+date
  }); 
} 
function stockGetMonthData(obj){
  return new Promise( (resolve, reject) => {
    request(obj, function(error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body))
      }
    });
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
      body = await stockGetMonthData({url: jsonUrl,method: "GET"})
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
        'Date':Number(json[0].split('/').join('')),
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
  stockData.sort((o1,o2)=>o1.Date-o2.Date)
  // console.log(stockData)
  return stockData;
}
function getkdData(stockData){
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
async function kdFn(stockData,stockNo,stockName,method,dataSymbol){
  // console.log(`kdFn get ${stockNo} data`)
  let kdDatas = getkdData(stockData)
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
async function stockStart(stockNo,stockName,method,stockData) {
  //kd
  console.log(`stockStart ${stockNo}`)
  if(~method.indexOf('k')){
    return kdFn(stockData,stockNo,stockName,method,'K')
  }
  if(~method.indexOf('d')){
    return kdFn(stockData,stockNo,stockName,method,'D')
  }
};
module.exports={
  stockStart,
  stockGetData
}

// stockStart();