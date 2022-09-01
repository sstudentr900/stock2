const {googleSheetGetData} = require("./googleSheet");
const { stockStart,stockGetData } = require("./stock");
const { linePush } = require("./lineBot");
const lineRemind = ()=>{
  const dt = new Date()
  const day = dt.getDay() //星期日,星期一,星期二,星期三,星期四,星期五,星期六
  if(day==0 || day>5 )return;//1-5
  googleSheetGetData('340899742')
  .then(async(rows)=>{
    let message = []
    for(row of rows){
      const stockNo = row._rawData[0]
      const method = row._rawData[2]
      message.push(await stockStart(stockNo,method))
    }
  
    //linePush
    message.join('\n')
    console.log(message)
    // linePush(message.join('\n'))
  })
}
// lineRemind()
stockGetData(2330)
