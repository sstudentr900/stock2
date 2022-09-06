const request = require("request");
let serch = encodeURI('台灣,台南市,阿堂鹹粥')
const url = 'https://api.opencagedata.com/geocode/v1/json?q='+serch+'&key=00f0d307e8a04e56bb6a866547058b6f&language=zh&pretty=1';
request({url: url,method: "GET"}, function(error, response, body) {
  console.log(response)
  if (error) {
    // reject(error);
    console.log(error)
  } else {
    // resolve(JSON.parse(body))
    //get lat,lng
    console.log(JSON.parse(body).results[0])
    console.log(JSON.parse(body).results[0].bounds.northeast)
    console.log(JSON.parse(body).results[0].formatted)
  }
});