const request = require("request");
let getTimes = function(setMonths){
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
let getStockDataMonth = function(jsonUrl){
  return new Promise(function (resolve, reject) {
    request({url: jsonUrl,method: "GET"}, function(error, response, body) {
      let jsons = JSON.parse(body).data;
      if (error || !body || !jsons) {
        reject(error);
      } else {
        let array = jsons.map(json=>{
          return {
            'Date':json[0].split('/').join(''),
            'Close':json[3],
            'Hight':json[4],
            'Low':json[5],
            'Open':json[6],
            'Volume':json[8].replace(/,/g,'')
          };
        })
        resolve(array)
      }
    });
  })
}
let getStockData = async function(stockNo){
  let stockData = [];
  //['1110301','1110201','1110101']
  for(let today of getTimes(3)){   
    let jsonUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + today + "&stockNo=" + stockNo;
    let array = await getStockDataMonth(jsonUrl)
    stockData = stockData.concat(array)
  }
  //時間排序小到大
  stockData.sort((o1,o2)=>Number(o1.Data)-Number(o2.Data))
  return stockData
}
let getkdData = function(stockData){
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
let kdFn = async function(stockNo,method,dataSymbol){
  let stockData = await getStockData(stockNo);
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
let run = function(stockNo,method) {
  if(~method.indexOf('K')){
    kdFn(stockNo,method,'K')
  }
  if(~method.indexOf('D')){
    kdFn(stockNo,method,'D')
  }
};

run('2330','K>20');
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
