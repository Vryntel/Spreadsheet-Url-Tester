function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Url tester')
    .addItem('Test Urls', 'testUrls')
    .addToUi();
}

function testUrls() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = spreadsheet.getSheetByName("Settings");

  // Settings
  var validateHttpsCertificates = true;
  var followRedirects = true;

  if (settingsSheet.getRange("B4").getValue() == "FALSE") {
    validateHttpsCertificates = false;
  }
  if (settingsSheet.getRange("B5").getValue() == "FALSE") {
    followRedirects = false;
  }

  const http_methods = ["GET", "POST", "DELETE", "PATCH", "PUT"];
  const dataSheet = spreadsheet.getSheetByName("Data");
  const data = dataSheet.getDataRange().getValues();
  var httpRequests = [];

  // We create the http requests containing the URL, method, params, headers, body
  for (let i = 1; i < data.length; i++) {

    let request = {
      "muteHttpExceptions": true,
      "validateHttpsCertificates": validateHttpsCertificates,
      "followRedirects": followRedirects
    }

    let url = data[i][0];
    if (url == "") {
      SpreadsheetApp.getUi().alert("Row: " + (i + 1) + "\n Url not present");
      return;
    }

    let params = data[i][2];
    if (params !== "") {
      params = JSON.parse(params);
      url = buildUrl(url, params);
    }
    request["url"] = url;

    let method = data[i][1];
    if (!http_methods.includes(method)) {
      SpreadsheetApp.getUi().alert("Row: " + (i + 1) + "\n Method not present");
      return;
    }
    request["method"] = method;

    let headers = data[i][3];
    if (headers !== "") {
      request["headers"] = JSON.parse(headers);
    }

    let body = data[i][5];
    if (body !== "") {
      let bodyType = data[i][4];
      if (bodyType == "JSON") {
        request["payload"] = JSON.parse(body);
      }
      else {
        request["payload"] = body;
      }
    }
    httpRequests.push(request);
  }

  // Fetch the Http Requests

  var responses = [];

  /* Exponential Backoff
    If the fetchAll(httpRequests) fails for exception "Service invoked too many times",
    we split the httpRequests in groups of 100 requests and then using exponential backoff we retry to fetchAll(chunkedHttpRequests[cont]) conaining 100 links at time. If we receive again exception "Service invoked too many times", we increment the sleep time between the calls.
  */
  var backoff = false;
  var backoffDelay = 1000;
  var chunkedHttpRequests = [];
  var counter = 0;

  do {
    try {
      if (!backoff) {
        responses = UrlFetchApp.fetchAll(httpRequests);
      }
      else {
        Utilities.sleep(backoffDelay);
        responses = responses.concat(UrlFetchApp.fetchAll(chunkedHttpRequests[counter]))
        counter++;
      }
    }
    catch (e) {
      if (e.message.includes("Service invoked too many times")) {
        if (!backoff) {
          backoff = true;
          const chunkSize = 100;
          for (let i = 0; i < httpRequests.length; i += chunkSize) {
            chunkedHttpRequests.push(httpRequests.slice(i, i + chunkSize));
          }
        }
        else {
          backoffDelay = backoffDelay * 2;
        }
      }
    }
  } while (backoff && counter < chunkedHttpRequests.length)


  for (let i = 0; i < responses.length; i++) {
    dataSheet.getRange("G" + (i + 2) + ":H" + (i + 2)).setValues([[responses[i].getResponseCode(), responses[i].getContentText().substring(0, 50000)]]);
  }
}


/**
 * Builds a complete URL from a base URL and a map of URL parameters.
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @return {string} The complete URL.
 */
function buildUrl(url, params) {
  var paramString = Object.keys(params).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}
