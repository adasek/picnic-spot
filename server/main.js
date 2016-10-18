/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');

var SpatialArray = require('./class/SpatialArray');


var osluneni = JSON.parse(fs.readFileSync('./data/HM_Ekola_den_p.json'));
//var osluneni = JSON.parse(fs.readFileSync('./data/OVZ_Klima_Osluneni_p.json'));

/*
 var point = {
 "type": "Feature",
 "geometry": {
 "type": "Point",
 "coordinates": [14.3968919, 50.0815478]
 }
 };
 */

var testPoints = (turf.random('point', 1000, {'bbox': [14.3242211, 50.0507947, 14.5278114, 50.1012511]}));

var testRes1 = [];
var testRes2 = [];


var osluneniA = new SpatialArray(turf.bbox(osluneni));

var f_key, feature;
for (f_key in osluneni.features) {
    feature = osluneni.features[f_key];
    osluneniA.addFeature(feature);
}
osluneniA.insertingFinished();

var startTime = new Date();

var point = null;
var nearest = null;
for (var i = 0; i < testPoints.features.length; i++) {
    point = testPoints.features[i];
    nearest = null;
    for (f_key in osluneni.features) {
        feature = osluneni.features[f_key];

        if (turf.inside(point, feature)) {
            nearest = feature;
            break;
        }
    }
    testRes1.push(nearest);
}

var endTime = new Date();



var startTime2 = new Date();

for (var i = 0; i < testPoints.features.length; i++) {
    testRes2.push(osluneniA.findItem(testPoints.features[i].geometry.coordinates).features[0]);
}
var endTime2 = new Date();

//Test that results are the same
for (var i = 0; i < testRes1.length; i++) {

    if ((typeof testRes1[i] === "undefined" || testRes1[i] === null) && (typeof testRes2[i] === "undefined" || testRes2[i] === null)) {
        //point outside of known area
        continue;
    }
    if (testRes1[i].properties !== testRes2[i].properties) {
        console.log("Not similar " + i);
        console.log(JSON.stringify(testRes1[i].properties));
        console.log(JSON.stringify(testRes2[i].properties));
        return;
    }
}

console.log("O(n) approach " + (endTime - startTime));
console.log("SpatialArray approach " + (endTime2 - startTime2));