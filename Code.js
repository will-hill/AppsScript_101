function formatSize(size, numberDecimals) {
    return ( size / Math.pow(1024, (Math.floor( Math.log(size) / Math.log(1024) ))) ).toFixed(numberDecimals) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][Math.floor( Math.log(size) / Math.log(1024) )];
}

function getFileArray(folder, parent){
  let fileArray = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();    
    fileArray.push({
      name: file.getName(),
      path: parent.length > 0 ? parent + "/" + folder.getName() : folder.getName(),
      id: file.getId(),
      size: file.getSize(),
      hSize: formatSize(file.getSize(), 2),
      mime: file.getMimeType(),
      url: file.getUrl()
    });
  }
  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    const subFileArray = getFileArray(subFolder, folder.getName())
    fileArray.push.apply(fileArray, subFileArray);
  }
  return fileArray;
}

function doGet(e) {  

  console.log("folderId: " + e.parameter.folderId);
  let folderId = e.parameter.folderId;
  if (folderId == null){
    return HtmlService.createHtmlOutput("<h1>Please add a folderId URL parameter to request.</h1><h3>I.e., Add '?folderId=q1w2e3' to end of URL in browser.</h3>");
  }  

  const startingFolder = DriveApp.getFolderById(folderId);
  const fileArray = getFileArray(startingFolder, "");
    
  let ss = null;
  const useSheets = new Boolean(true);
  if (useSheets){
    ss = SpreadsheetApp.create(name=startingFolder.getName() + "_files_sizes");
    var sheet = ss.getSheets()[0];
    sheet.appendRow(["name", "path", "id", "bytes", "size","mime", "url"])
  }
  
  let totalSize = 0;
  let csvArray = [];
  fileArray.forEach((f) => {
    totalSize += f.size;
    if (useSheets){
      sheet.appendRow([f.name, f.path, f.id, f.size, f.hSize,f.mime, f.url])
    }
    csvArray.push(Object.values(f));
  });
  if (useSheets){
    sheet.setFrozenRows(1);
  }
  
  let data = {};  
  data["title"] = startingFolder.getName();
  data["totalSize"] = formatSize(totalSize, 2);
  data["files"] = fileArray;
  data["csvArray"] = csvArray;

  if (useSheets){
    data['sheetsUrl'] = ss.getUrl();
  } else {
    data['sheetsUrl'] = 'NOT_USING_SHEETS';
  }
  
  const html = HtmlService.createTemplateFromFile('index');
  html.data = data;
  const output = html.evaluate();
  return output;
}
