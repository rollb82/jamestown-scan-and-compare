
  
 const puppeteer = require("puppeteer");
 const fs = require('fs');
 
 //let siteMapProduction = require('../data/sitemap');
 
 
 
 let siteMapProduction = require("../data/sitemap-production");
 let siteMapStaging = require("../data/sitemap-staging");
 
 cleanDirectory('compare/diffs/');
 cleanDirectory('compare/report/');
 
 generateScreenShots(siteMapProduction, 'production', 'screenshots/');
 //generateScreenShots(siteMapStaging, 'staging', 'screenshots-compare/');
 
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
   const items = sitemap.default
 
   const maxListeners = 8;
 
   const maxKeys = Math.round(items.length / maxListeners);
 
   const listItems = generateListObject(maxKeys, items, maxListeners);
 
   getImages(listItems, 1, maxKeys, function(){
     return this;
   },server, dstPath);
   
   /*
   
   */
 }
 
 function getImages(list, currentList, maxValue, server, dstPath){  
   //console.log(currentList, `is our top value ${maxValue}`);    
   const items = list[`list${currentList}`];   
   if(currentList <= maxValue){
     currentList ++;
     //getImages(list,currentList, maxValue);
     generateScreeShots(items, function(){
      console.log('testing');
     },server, dstPath);
   }
 }
 
 async function generateScreeShots(items, callback, server, dstPath){
  items.forEach(element => {
    console.log(element);

    async function generate ()  {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
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
    };
    generate();
  })
  /*
   items.forEach(element => {
     console.log(element);

     (async () => {
       const browser = await puppeteer.launch();
       const page = await browser.newPage();
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
   })*/
   callback();
}

 function generateListObject(maxKeys, items, maxListeners){
   //console.log(items);
   //console.log(maxKeys);
   var objectList = {};
   let currentIndex = 1;
   while(currentIndex < maxKeys + 1){
     let endPoint = currentIndex * maxListeners;
     objectList[`list${currentIndex}`] = items.splice(0, endPoint);
     currentIndex++;
   }
   return objectList
 }
 
 function generateTitle(url) {
   var term = "/";
   var regexTerm = new RegExp(term, "g");
   return url.replace("https://", "").replace(regexTerm, "-");
 }
 
 /*
 
 */
 
 