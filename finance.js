var yahooFinance = require('yahoo-finance');

// yahooFinance.historical({
//   symbol: '2330.TW',
//   from: '2022-03-01',
//   to: '2022-09-01',
//   // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
// }, function (err, quotes) {
//   console.log(quotes)
// });

function financeXX(symbol,from,to){
  return new Promise((resolve, reject) => {
    yahooFinance.historical({
      symbol: `${symbol}.TW`,
      from: from,
      to: to,
      // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    }).then(jsons=>{
      const array =  jsons.map(json=>{
        return {
          'Date': new Date(json['date']).toLocaleDateString().replace(/\//g,'-'),
          // 'Open':json['open'],
          // 'Hight':json['high'],
          // 'Low':json['low'],
          'Close':json['close'],
          'Volume':json['volume']
        };
      })
      array.sort((o1,o2)=>o1.Date.split('/').join('')-o2.Date.split('/').join(''))
      resolve(array)
    });
  })
}
async function finance(symbol,from,to){
  return await yahooFinance.historical({
    symbol: `${symbol}.TW`,
    from: from,
    to: to,
    // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
  }).then(jsons=>{
    const array =  jsons.map(json=>{
      return {
        'Date': new Date(json['date']).toLocaleDateString().replace(/\//g,'-'),
        // 'Open':json['open'],
        // 'Hight':json['high'],
        // 'Low':json['low'],
        'Close':json['close'],
        'Volume':json['volume']
      };
    })
    array.sort((o1,o2)=>o1.Date.split('-').join('')-o2.Date.split('-').join(''))
    return array;
  });
}
const stockSearch = async(event)=>{
  const datas = await finance('2330','2022-09-22','2022-09-23')
  console.log(datas)
}
stockSearch()
