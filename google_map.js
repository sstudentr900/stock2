const config = require("./plugin/config");
const axios = require('axios');
const serch = encodeURI('阿堂鹹粥')
const axiosConfig = {
  method: 'get',
  url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='+serch+'&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key='+config.googleMapID,
  headers: { }
};

axios(axiosConfig)
.then(function (response) {
  //location { lat: 22.9899117, lng: 120.1979533 }
  console.log('location',response.data.candidates[0].geometry.location)

  console.log('data',response.data)
})
.catch(function (error) {
  console.log(error);
});