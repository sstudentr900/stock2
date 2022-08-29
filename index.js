//API
//https://www.npmjs.com/package/node-stock-data
//https://clu.gitbook.io/python-web-crawler-note/45-tai-wan-zheng-quan-jiao-yi-suo

//Why await is not working for node request module?
//https://stackoverflow.com/questions/38428027/why-await-is-not-working-for-node-request-module
//https://www.twilio.com/blog/5-ways-to-make-http-requests-in-node-js-using-async-await

const request = require("request");
let getStockDataMonth = function(jsonUrl){
  return new Promise(function (resolve, reject) {
    request({url: jsonUrl,method: "GET"}, function(error, response, body) {
      if (error || !body) {
        reject(error);
      } else {
        let jsons = JSON.parse(body).data;
        let array = jsons.map(json=>{
          return {
            'Data':json[0],
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
let run = async function(stockNo,todays) {
  let stockDataAll = [];
  for(let today of todays){   
    let jsonUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + today + "&stockNo=" + stockNo;
    let array = await getStockDataMonth(jsonUrl)
    stockDataAll.push(array)
  }
  console.log(stockDataAll)
};


run('2330',['20220501','20220601','20220701']);
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
