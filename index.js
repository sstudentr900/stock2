const {googleSheetGetData} = require("./googleSheet");
const { stockStart,stockGetData } = require("./stock");
const { linePush } = require("./lineBot");

googleSheetGetData('340899742')
.then(async(rows)=>{
  let message = []
  for(row of rows){
    const stockNo = row._rawData[0]
    const method = row._rawData[2]
    message.push(await stockStart(stockNo,method))
  }

  //linePush
  // linePush(message.join('\n'))
})
// stockGetData(2330)
