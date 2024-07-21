# Spreadsheet-Url-Tester
A Google spreadsheet to send HTTP requests (GET, POST, DELETE, PATCH, PUT) to multiple URLs with the ability to specify parameters, headers and body in the call.


![screenshot](Url-tester.png)



Spreadsheet with Google Apps Script:

https://docs.google.com/spreadsheets/d/1UyuKCRO8BWcIaluGEYTuUZglBryo0uFBji2a6tbBXCw/copy


## Usage

There are 2 sheet:
- Data
- Settings

### Data sheet

- Column A: URL
- Column B: HTTP request method (Supported HTTP request methods: GET, POST, DELETE, PATCH, PUT)
- Column C: params in JSON format

     Example:  
     URL: `https://mywebsite.com`  
     PARAMS: {"param1":"test", "params2":"test2"}  
     FETCHED URL: `https://mywebsite.com?param1=test&param2=test2`  
  
- Column D: headers in JSON format
- Column E: Body Type that can be JSON or TEXT
- Column F: body in JSON/TEXT format
- Column G: Response Code returned by the request
- Column H: Response Body returned by the request
  

### Settings sheet

You can edit some adavnced settings of the HTTP requests:

- validateHttpsCertificates: TRUE/FALSE --> If FALSE the fetch ignores any invalid certificates for HTTPS requests
- followRedirects: TRUE/FALSE --> If FALSE the fetch doesn't automatically follow HTTP redirects; it returns the original HTTP response


To run the script you can use the toolbar options "Url Tester" > "Test Urls". The first time when you run the script it will ask you to grant permissions.
