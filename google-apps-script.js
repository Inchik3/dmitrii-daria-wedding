const SHEET_ID = '1wigojdYZZRyzWRQ75jhLx4KCm_YmzYlAOn2od28NekM';
const SHEET_NAME = 'RSVP';
const HEADERS = [
  'Дата отправки',
  'Имя и фамилия',
  'Телефон',
  'Участие',
  'Напитки',
  'Время прибытия'
];

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || '{}');
  const sheet = getSheet();
  sheet.appendRow([
    payload.submitted_at || new Date().toISOString(),
    payload.guest_name || '',
    payload.guest_phone || '',
    payload.guest_attendance || '',
    payload.drinks || '',
    payload.arrival_time || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, HEADERS.length + 1, sheet.getMaxRows(), Math.max(1, sheet.getMaxColumns() - HEADERS.length)).clearContent();
  }
  return sheet;
}
