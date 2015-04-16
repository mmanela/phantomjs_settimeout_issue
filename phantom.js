
var page = require('webpage').create();
var url = 'test.html';

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(url, function (status) {
  phantom.exit();
});