/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');

var osluneni = JSON.parse(fs.readFileSync('./data/OVZ_Klima_Osluneni_p.json'));

var point = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [14.3968919, 50.0815478]
    }
};


console.log(osluneni);

var nearest = null;
var f_key, feature;
for (f_key in osluneni.features) {
    feature = osluneni.features[f_key];
    if (turf.inside(point, feature)) {
        nearest = feature;
    }
}

console.log(nearest);