var request = require("request");
var stock = [2454, 2317, 2002, 2330, 2412];
var stockIndex = 0;
var num = '',
  name = '',
  today = '20220825',
  price = '';
var run = function() {
  var stockNo = stock[stockIndex];
  var jsonUrl = "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" + today + "&stockNo=" + stockNo;
  // if (stockNo) {
    // console.log(stockNo);
    request({
      url: jsonUrl,
      method: "GET"
    }, function(error, response, body) {
      if (error || !body) {
        return error;
      } else {
        console.log(body.indexOf('html'));
          // 如果沒有資料，會出現 404 的 html 網頁，此時就重新抓取
        // if (body.indexOf('html') != -1) {
        //   console.log('reload');
        //   run2();
        // } else {
          b = JSON.parse(body);
          var json = b.data;
          // var title = b.title.split(' ');
          // var data = json[json.length - 1];
          // num = num + title[1] + ',';
          // name = name + title[2] + ',';
          // price = price + data[data.length - 3] + ',';
          // console.log(num);
          // console.log(name);
          // console.log(price);
          console.log(b);
          // stockIndex = stockIndex + 1;
          // run();
        // }
      }
    });
  // } else {
  //   console.log(num);
  //   console.log(name);
  //   console.log(price);
  //   // sheet();
  // }
};
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

run();