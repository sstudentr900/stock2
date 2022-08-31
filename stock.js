const request = require("request");
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
            'Open':Number(json[3]),
            'Hight':Number(json[4]),
            'Low':Number(json[5]),
            'Close':Number(json[6]),
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
  //['20220301','20220201','20220101']
  for(let date of getTimes(3)){   
    let jsonUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + date + "&stockNo=" + stockNo;
    try{
      let array = await getStockDataMonth(jsonUrl)
      stockData = stockData.concat(array)
    }catch(error){
      console.log(`request error ${error}`)
    }
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
  console.log(`get ${stockNo} data`)
  let kdDatas = getkdData(stockData);
  let kdData = kdDatas[kdDatas.length-1];
  let nowValue = ''
  if(~method.indexOf('<')){
    nowValue = method.split('<')[1]
    if(kdData<nowValue){
      console.log(`${kdData['date']}，${stockNo}，目前${dataSymbol}值是:${kdData[dataSymbol]}，有符合${dataSymbol}值<${nowValue}`)
    }
  }
  if(~method.indexOf('>')){
    nowValue = method.split('>')[1]
    if(kdData>nowValue){
      console.log(`${kdData['date']}，${stockNo}，目前${dataSymbol}值是:${kdData[dataSymbol]}，有符合${dataSymbol}值>${nowValue}`)
    }
  }
}
function runStock(stockNo,method) {
  console.log(`start runStock ${stockNo}`)
  if(~method.indexOf('k')){
    kdFn(stockNo,method,'K')
  }
  if(~method.indexOf('d')){
    kdFn(stockNo,method,'D')
  }
};
module.exports={
  runStock,
  getStockData
}
// runStock('2330','K>20');
// run('2330','D>20');


// var sheet = function() {
//   var parameter = {
//     sheetUrl: '試算表網址',
//     sheetName: '工作表名稱',
//     num: num,
//     name: name,
//     price: price
//   }
//   request({
//     url: 'Google App Script 網址',
//     method: "GET",
//     qs: parameter
//   }, function(error, response, body) {
//     console.log(body);
//   });
// }
