//GoogleSpreadsheet
//https://www.youtube.com/watch?v=UGN6EUi4Yio&ab_channel=Twilio
//https://theoephraim.github.io/node-google-spreadsheet/#/classes/google-spreadsheet-worksheet?id=sheet-dimensions-amp-stats
const { GoogleSpreadsheet } = require("google-spreadsheet");
const config = require("./config");
const creds = require('./client_secret.json'); //從google 下載
const doc = new GoogleSpreadsheet(config.googleSheetID); // Please set your Spreadsheet ID.
const googleSheetGetData = async(id)=>{
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  //取得sheet ID
  const sheet = doc.sheetsById[id];

  //取得所有值
  //const rows = await sheet.getRows();
  //console.log('標題',worksheet.title);
  //console.log('數量',rows.length);

  //建表
  // const sheet = await doc.addSheet({ headerValues: ['name', 'email'] })

  
  //取值
  // rows.forEach((row) => {
  //   // console.log(row);
  //   // console.log(row.code);
  //   // console.log(row.method);
  //   console.log(row._rawData);
  // });


  //update
  // googleSheetGetData('340899742')
  // .then(async(sheet)=>{
  //   const rows = await sheet.getRows();
  //   for (let [rowIndex, row] of rows.entries()) {
  //     if(row['nav name']=='name'){
  //       rows[rowIndex].value = 'save value'
  //       await rows[rowIndex].save();
  //       break;
  //     }
  //   }
  // })

  
  //append 
  // const larryRow = await sheet.addRow({ name: 'Larry Page', email: 'larry@google.com' });
  // const moreRows = await sheet.addRows([
  //   { name: 'Sergey Brin', email: 'sergey@google.com' },
  //   { name: 'Eric Schmidt', email: 'eric@google.com' },
  // ]);

  return sheet
}
module.exports={
  googleSheetGetData
}
// getGoogleSheet()