/* 
 *  @copyright Adam Benda, 2016
 */


/* global Layer */

/**
 * ShapeLayer is quality of property that is area-based
 * - it makes sense to 
 * 
 * @class
 * @augments Layer
 * 
 * @param {String} geojsonFilename 
 * @param {function} cb - callback after file is downloaded
 * @returns {ShapeLayer} initialized structure bind to DOM 
 */

var ShapeLayer = function (geojsonFilename, cb) {
    Layer.call(this);

    this.geojson = {};

    this.download(geojsonFilename, "geojson", cb);

};

//Inheritance
ShapeLayer.prototype = Object.create(Layer.prototype);


/*
 * Return whole layer
 * @returns {ol.Vector}
 */
ShapeLayer.prototype.getVector = function () {


    //cocnvert geojson
    var features = (new ol.format.GeoJSON()).readFeatures(this.geojson, {featureProjection: 'EPSG:3857'});

    for (var i = 0; i < features.length; i++) {
        var gValue = features[i].get("GRIDVALUE");
        var color = "#333333";
        if (gValue === 1) {
            color = "#0000ff";
        } else {
            color = "#ff0000";
        }

        features[i].setStyle(
                new ol.style.Style({
                    fill: new ol.style.Fill({"color": color})
                }));
    }


    var vectorSource = new ol.source.Vector({
        url: 'data/OVZ_Klima_Osluneni_p.json',
        features: features,
        format: new ol.format.GeoJSON()
    });



    var vector = new ol.layer.Vector({
        source: vectorSource
    });
    return vector;

};
