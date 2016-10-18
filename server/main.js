/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');

var JSONStream = require('JSONStream');

var SpatialArray = require('./class/SpatialArray');

console.log("Mem begin: " + Math.round(JSON.stringify(process.memoryUsage().heapUsed / 1024 / 1024)) + "MB");
console.log("Heap limit: " + Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024) + "MB");

var resourceA = new SpatialArray([14.2, 49.93, 14.72, 50.2]);

//URK_SS_VyuzitiZakl_p is not working on Ubuntu 16.04 !
//HM_Ekola_den_p
var stream = fs.createReadStream('data/URK_SS_VyuzitiZakl_p.json', {flags: 'r', encoding: 'utf-8'});


stream.pipe(JSONStream.parse('features.*'))
        .on('data', function (d) {

            resourceA.addFeature(d);
        }).
        on('end', function () {
            console.log("Mem1: " + Math.round(JSON.stringify(process.memoryUsage().heapUsed / 1024 / 1024)) + "MB");
            stream.close();
            stream.destroy();
            if (typeof (global.gc) !== "function") {
                console.error("Use --expose_gc parameter to explicit gc");
            } else {
                global.gc();
            }
            console.log("Mem2: " + Math.round(JSON.stringify(process.memoryUsage().heapUsed / 1024 / 1024)) + "MB");

            resourceA.insertingFinished();

            //Test points
            var testPoints = (turf.random('point', 1000, {'bbox': [14.3242211, 50.0507947, 14.5278114, 50.1012511]}));

            var startTime = new Date();
            for (var i = 0; i < testPoints.features.length; i++) {
                var found = resourceA.findItem(testPoints.features[i].geometry.coordinates).features[0];
                if (typeof (found) !== "undefined") {
                    console.log(JSON.stringify(found.properties));
                } else {
                    console.log("N/A");
                }
            }
            var endTime = new Date();

            console.log("Search elapsed: " + (endTime - startTime));

        });
