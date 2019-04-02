const puppeteer = require("puppeteer");
const fs = require('fs');

process.setMaxListeners(Infinity);

//let siteMapProduction = require('../data/sitemap');



let siteMapProduction = require("../data/sitemap-production");
let siteMapStaging = require("../data/sitemap-staging");

cleanDirectory('compare/diffs/');
cleanDirectory('compare/report/');

generateScreenShots(siteMapProduction, 'production', 'screenshots/');
generateScreenShots(siteMapStaging, 'staging', 'screenshots-compare/');

function cleanDirectory(directoryName){
  fs.readdir(directoryName, (err, files)=>{
    if(err) throw err;
    console.log(files);
    
    files.forEach((element)=>{
      fs.unlink(`${directoryName}${element}`,(err)=>{
        if(err) throw err;
      });
    });
  
  });
}


function generateScreenShots(sitemap, server, dstPath) {
  cleanDirectory(dstPath);
  const items = sitemap.default;

  console.log(items.length / 3);
  
  items.forEach(element => {
    console.log(element);

    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(120000);
      await page.goto(element, { waitUntil: "networkidle2" });
      await page.screenshot({
        path: dstPath + generateTitle(element) + `${server}.png`,
        fullPage: true
      });

      const dimensions = await page.evaluate(() => {
        console.log(document.height);
        return {
          width: document.documentElement.clientWidth,
          height: document.height,
          deviceScaleFactor: window.devicePixelRatio
        };
      });

      console.log("Dimensions:", dimensions);

      await browser.close();
    })();
  });
  
}

function generateTitle(url) {
  var term = "/";
  var regexTerm = new RegExp(term, "g");
  return url.replace("https://", "").replace(regexTerm, "-");
}

/*

*/
