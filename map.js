const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',

  // Optional depending on the providers
  // fetch: customFetchImplementation,
  apiKey: 'zeta-yen-359608', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);
geocoder.geocode('29 champs elysée paris', function(err, res) {
  console.log(res);
});