var yahooFinance = require('yahoo-finance');

// yahooFinance.historical({
//   symbol: '2330.TW',
//   from: '2022-03-01',
//   to: '2022-09-01',
//   // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
// }, function (err, quotes) {
//   console.log(quotes)
// });

yahooFinance.historical({
  symbol: '2330.TW',
  from: '2022-03-01',
  to: '2022-09-01',
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}).then(quotes=>{
  console.log(quotes); // 132.05
});
