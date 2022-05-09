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
  let data = {};  
  let folderId = "1RZfi7gT7vR-d1c3Q_-quq0SnfbTKlGnL";
  if (e != null && e.parameter != null && e.parameter.folderId != null) {
    folderId = e.parameter.folderId;
  }
  
  const startingFolder = DriveApp.getFolderById(folderId);
  const fileArray = getFileArray(startingFolder, "");
  
  let totalSize = 0;
  let ss = SpreadsheetApp.create(name=startingFolder.getName() + "_files_sizes");
  var sheet = ss.getSheets()[0];
  sheet.appendRow(["name", "path", "id", "bytes", "size","mime", "url"])

  fileArray.forEach((f) => {
    totalSize += f.size;
    sheet.appendRow([f.name, f.path, f.id, f.size, f.hSize,f.mime, f.url])
  });
  sheet.setFrozenRows(1);
  
  data["title"] = startingFolder.getName();
  data["totalSize"] = formatSize(totalSize, 2);
  data["files"] = fileArray;
  data['sheetsUrl'] = ss.getUrl();

  const html = HtmlService.createTemplateFromFile('index');
  html.data = data;
  const output = html.evaluate();
  return output;
}










