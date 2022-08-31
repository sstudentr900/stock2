// const request = require("request");
const {getGoogleSheet} = require("./googleSheet");
// import {getGoogleSheet} from './googleSheet';//要載引入
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require('./client_secret.json');
const doc = new GoogleSpreadsheet('1q9gzEYVoRP2Lydoa3V7mA9K8LL13vr8ButeJrEDsIvY'); // Please set your Spreadsheet ID.
function getTimes(setMonths){
  let dt = new Date();
  let year = Number(dt.getFullYear());//111
  let month = Number(dt.getMonth())+1;//8
  // month = 1;
  let date = '01';
  // let date = dt.getDate();//30
  // date = date>=10?date:'0'+date
  let monthFn = function(month){
    return month>=10?month:'0'+month
  }
  return Array.from({
    length: setMonths
  }, (val, index) => {
    let nowMonth = month-index
    //year 111,110
    if(nowMonth==0){
      year -= 1
    }
    //nowMonth 2,1,12,11,10
    if(nowMonth<=0){
      nowMonth += 12
    }
    //2=>02
    nowMonth = monthFn(nowMonth)

    //'1110301'
    return year.toString()+nowMonth.toString()+date
  }); 
} 
function getStockDataMonth(jsonUrl){
  return new Promise(function (resolve, reject) {
    request({url: jsonUrl,method: "GET"}, function(error, response, body) {
      let jsons = JSON.parse(body).data;
      if (error || !body || !jsons) {
        reject(error);
      } else {
        let array = jsons.map(json=>{
          return {
            'Date':Number(json[0].split('/').join('')),
            'Close':Number(json[3]),
            'Hight':Number(json[4]),
            'Low':Number(json[5]),
            'Open':Number(json[6]),
            'Volume':Number(json[8].replace(/,/g,''))
          };
        })
        resolve(array)
      }
    });
  })
}
async function getStockData(stockNo){
  let stockData = [];
  //['1110301','1110201','1110101']
  for(let date of getTimes(3)){   
    let jsonUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + date + "&stockNo=" + stockNo;
    console.log(`url ${jsonUrl}`)
    let array = await getStockDataMonth(jsonUrl)
    stockData = stockData.concat(array)
  }
  //時間排序小到大
  stockData.sort((o1,o2)=>o1.Date-o2.Date)
  return stockData
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
async function kdFn(stockNo,method,dataSymbol){
  let stockData = await getStockData(stockNo);
  console.log(`get ${stockNo} stockData`)
  let kdDatas = getkdData(stockData);
  let kdData = kdDatas[kdDatas.length-1];
  let nowValue = ''
  if(~method.indexOf('<')){
    nowValue = method.split('<')[1]
    if(kdData<nowValue){
      console.log(`${kdData['date']}，${stockNo}，${dataSymbol}值<${nowValue}提醒，目前是:${kdData[dataSymbol]}`)
    }
  }
  if(~method.indexOf('>')){
    nowValue = method.split('>')[1]
    if(kdData>nowValue){
      console.log(`${kdData['date']}，${stockNo}，${dataSymbol}值>${nowValue}提醒，目前是:${kdData[dataSymbol]}`)
    }
  }
}
function runStock(stockNo,method) {
  console.log(`star runStock ${stockNo}`)
  if(~method.indexOf('k')){
    kdFn(stockNo,method,'K')
  }
  if(~method.indexOf('d')){
    kdFn(stockNo,method,'D')
  }
};
// async function getGoogleSheet(){
//   await doc.useServiceAccountAuth(creds);
//   await doc.loadInfo();
//   const worksheet = doc.sheetsById[340899742];
//   const rows = await worksheet.getRows();
//   rows.forEach((row) => {
//     const code = row._rawData[0]
//     const method = row._rawData[1]
//     runStock(code,method)
//   });
// } 
getGoogleSheet().then(rows=>{
  rows.forEach((row) => {
    // console.log(row);
    // console.log(row.code);
    // console.log(row.method);
    console.log(row._rawData);
  });
})
