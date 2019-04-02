var fs = require('fs'),
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch'),
    sitemap = require('../data/sitemap-production'),
    path = require('path'),
    os = require('os');
    

fs.readdir(path.resolve(__dirname,'../screenshots'), (err, files) => {
    if (err) throw err;
    //console.log(files);
    let report = [];
    
    const totalCount = files.length;

    files.forEach((element, index) => {

        var img1 = fs.createReadStream(path.resolve(__dirname,`../../src/screenshots/${element}`))
                .pipe(new PNG()).on('parsed', doneReading),
            img2 = fs.createReadStream(path.resolve(__dirname,`../../src/screenshots-compare/${element.replace('-production','-staging').replace('historicjamestowne.org','rediscoveryjt.staging.wpengine.com')}`))
                .pipe(new PNG()).on('parsed', doneReading),
            filesRead = 0;


        function doneReading() {
            if (++filesRead < 2) return;
            var diff = new PNG({ width: img1.width, height: img1.height });

            const imgDifference = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
            
            if(imgDifference > 500){                                
                    report.push(generateReport(imgDifference, element, index));
                    diff.pack().pipe(fs.createWriteStream(path.resolve(__dirname,`./diffs/diff-${element}`)));
            }
            if(totalCount-1 === index){
                writeReport(JSON.stringify(report, null, 4));
            }
        }
    });
});



/**
 * 
 * @param {*} imgDifference : pixel difference of images
 * @param {*} element : current image we are testing
 * @param {*} index : current index of the array of images we are testing
 */
function generateReport(imgDifference, element, index) {
    const title = element.replace('.png', '');
    let nameOfImage = sitemap.default.find((mapElement) => {
        return mapElement === title;
    });
    
    
    return createReportItem(element, index,imgDifference);    
}

function createReportItem(element, index, imgDifference){
        let item = {};
        item.title = element ;
        item.id = index;
        item.url = 'https://' + element.replace('-production/','').replace(/-/g,'/');
        item.imageDifference = imgDifference
        console.log(item);
        item.diff = imgDifference > 500? true : false;;
        return item;
}

function writeReport(reportData){
    fs.writeFile(path.resolve(__dirname,'./report/diff.json'), reportData, 'utf8', (err)=>{
        if(err) throw err;
        console.log('report created!');
    });
}