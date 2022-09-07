const { stockSearch } = require("./plugin/lineBot");
const remind = ()=>{
  const dt = new Date()
  const day = dt.getDay() //星期日,星期一,星期二,星期三,星期四,星期五,星期六
  if(day==0 || day>5 )return;//1-5
  stockSearch()
}
remind()

