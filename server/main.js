/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');

var SpatialArray = require('./class/SpatialArray');

var osluneni = JSON.parse(fs.readFileSync('./data/OVZ_Klima_Osluneni_p.json'));

var point = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [14.3968919, 50.0815478]
    }
};

/*
 for (var f_key in osluneni.features) {
 if (osluneni.features[f_key].geometry.type !== "Polygon") {
 console.log(osluneni.features[f_key]);
 }
 }
 */
var osluneniA = new SpatialArray(turf.bbox(osluneni), osluneni.features.length);

var f_key, feature;
for (f_key in osluneni.features) {
    feature = osluneni.features[f_key];
    osluneniA.addFeature(turf.bbox(feature), feature);
}
osluneniA.insertingFinished();

//Search with O(n)
var startTime = new Date();
var nearest = null;
for (f_key in osluneni.features) {
    feature = osluneni.features[f_key];

    if (turf.inside(point, feature)) {
        nearest = feature;
    }
}
var endTime = new Date();

console.log(nearest);


var startTime2 = new Date();
console.log((osluneniA.findItem(point.geometry.coordinates)).features[0]);
var endTime2 = new Date();

console.log("O(n) approach " + (endTime - startTime));
console.log("SpatialArray approach " + (endTime2 - startTime2));