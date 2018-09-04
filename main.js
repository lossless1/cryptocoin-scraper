const http = require("http");
const fs = require("fs");
const request = require("request");
const iconv = require("iconv-lite");
const needle = require("needle");
const async = require("async");
const tress = require("tress");
const cheerio = require("cheerio");

const url = "https://coinmarketcap.com/";
const quantityOfPage = 20;

const timeout = 5000;
const dataFilename = "./data.json";

var results = [];
var q = tress((url, done) => {
  console.log(url);
  needle(url, (err, res, body) => {
    if (err) done(err);
    var $ = cheerio.load(res.body);
    var cols = [
      "id",
      "name",
      "market_cap",
      "price",
      "volume",
      "circulating_supply",
      "change"
    ];
    $("tr").each(function(key, td) {
      var key = 0;
      var sourceArray = [];
      var targetArray = {};
      $(this.children).each(function(a) {
        if (!$(this).hasClass("dropdown")) {
          var a = $(this)
            .text()
            .trim()
            .replace("/r", "/");
          var array = a.split(" ");
          var ar = array.find((key, val) => key !== "");
          if (ar && ar.length) {
            sourceArray.push(ar);
          }
        }
      });
      sourceArray.forEach((val, key) => {
        if (cols[key] === "name") {
          var name = [];
          var repName = val.replace(/(\r\n\t|\n|\r\t)/gm, " ");
          var arrayName = repName.split(" ");
          if (arrayName.length === 3) {
            name = arrayName.splice(2, 2);
          } else if (arrayName.length === 2) {
            name = arrayName.splice(1, 1);
          } else {
            name = arrayName;
          }
          targetArray[cols[key]] = name[0];
        } else {
          targetArray[cols[key]] = val;
        }
      });
      results.push(targetArray);
    });
    console.log(results);
    done(null, "All good");
  });
}, 1);

q.drain = a => {
  console.log("Finished");
  fs.writeFileSync(dataFilename, JSON.stringify(results, null, 4));
};
q.error = err => {
  console.log("Error: ", err);
};
q.success = aa => {
  console.log("Success");
  //   console.log(aa);
};


for(var i = 0; quantityOfPage >= i; i++){
    i ? q.push(url + i) : q.push(url);
}
