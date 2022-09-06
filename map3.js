// https://ithelp.ithome.com.tw/articles/10251862
const {Client} = require("@googlemaps/google-maps-services-js");
const client = new Client({});

client
  .findPlaceFromText({
    params: {
      input:"台北101",
      language: "zh-tw",
      key: 'AIzaSyBQ0HBu4TujdOe0Sx623gZnpMDGYEarYwk',
    }
  })
  .then((r) => {
    console.log(r);
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });