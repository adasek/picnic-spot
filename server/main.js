/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');

var async = require('async');


var JSONStream = require('JSONStream');

var SpatialArray = require('./class/SpatialArray');
var DataSet = require('./class/DataSet');

console.log("Mem begin: " + Math.round(JSON.stringify(process.memoryUsage().heapUsed / 1024 / 1024)) + "MB");
console.log("Heap limit: " + Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024) + "MB");

var resourceA = new SpatialArray([14.2, 49.93, 14.72, 50.2]);

//URK_SS_VyuzitiZakl_p is not working on Ubuntu 16.04 !
//HM_Ekola_den_p
//var stream = fs.createReadStream('data/URK_SS_VyuzitiZakl_p.json', {flags: 'r', encoding: 'utf-8'});


var dataSources = [
     {
     "filename": "data/URK_SS_VyuzitiZakl_p.json",
     "particles": 1000000,
     "name": "vyuziti"
     },
    {
        "filename": "data/HM_Ekola_den_p.json",
        "particles": 10000,
        "name": "hluk-den"
    },
    {
        "filename": "data/OVZ_Klima_Osluneni_p.json",
        "particles": 10000,
        "name": "osluneni"
    }
];

loadDataS = [];
for (var i = 0; i < dataSources.length; i++) {
    dataSources[i].dataSet = new DataSet(dataSources[i]);
    loadDataS.push(dataSources[i].dataSet.parseFromFile.bind(dataSources[i].dataSet, dataSources[i].filename));
}



async.parallel(loadDataS, function (err, results) {
    if (err !== null) {
        console.error(err);
        throw "Load was not successfull";
    }

    console.log("Loaded");

    var start = new Date();
    //Test points
    var testPoints = (turf.random('point', 1000, {'bbox': [14.3242211, 50.0507947, 14.5278114, 50.1012511]}));

    for (var i = 0; i < testPoints.features.length; i++) {
        console.log("POINT=" + JSON.stringify(testPoints.features[i].geometry.coordinates));
        //now every dataSource should be loaded
        for (var n = 0; n < dataSources.length; n++) {
            var found = dataSources[n].dataSet.getProperty(testPoints.features[n].geometry.coordinates);
            if (typeof (found) !== "undefined") {
                console.log(JSON.stringify(found));
            } else {
                console.log("N/A");
            }

        }
        console.log("------");
    }

    var end = new Date();
    console.log("Elapsed:" + (end - start));

});
