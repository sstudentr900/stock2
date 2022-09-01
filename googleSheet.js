//GoogleSpreadsheet
//https://www.youtube.com/watch?v=UGN6EUi4Yio&ab_channel=Twilio
//https://theoephraim.github.io/node-google-spreadsheet/#/classes/google-spreadsheet-worksheet?id=sheet-dimensions-amp-stats
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require('./client_secret.json');
const doc = new GoogleSpreadsheet('1q9gzEYVoRP2Lydoa3V7mA9K8LL13vr8ButeJrEDsIvY'); // Please set your Spreadsheet ID.
const googleSheetGetData = async(id)=>{
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const worksheet = doc.sheetsById[id];
  const rows = await worksheet.getRows();
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

  return rows
}
module.exports={
  googleSheetGetData
}
// getGoogleSheet()