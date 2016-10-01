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
 * Return whole layer with colors adjusted according to feature property
 * and given colorScale
 * 
 * @param{string} propertyName - Such as "GRIDVALUE"
 * @param {function} colorScale - color scale for (0..1)
 * @returns {ol.Vector}
 */
ShapeLayer.prototype.getVector = function (propertyName, colorScaleStr) {


    //convert geojson
    this.features = (new ol.format.GeoJSON()).readFeatures(this.geojson, {featureProjection: 'EPSG:3857'});

    this.normalizeProperty(this.features, propertyName);

    for (var i = 0; i < this.features.length; i++) {
        var gValue = this.features[i].get(propertyName);
        var colorString = colorScaleStr(gValue);

        this.features[i].setStyle(
                new ol.style.Style({
                    fill: new ol.style.Fill({"color": colorString})
                }));
    }


    var vectorSource = new ol.source.Vector({
        features: this.features,
        format: new ol.format.GeoJSON()
    });



    var vector = new ol.layer.Vector({
        source: vectorSource
    });
    return vector;

};

/* */
ShapeLayer.prototype.normalizeProperty = function (features, propertyName) {
    var gValue;
    var max = -999;
    var min = 999;

    for (var i = 0; i < features.length; i++) {
        gValue = features[i].get(propertyName);
        if (gValue > max) {
            max = gValue;
        }
        if (gValue < min) {
            min = gValue;
        }
    }

    //normalize

    for (var i = 0; i < features.length; i++) {
        gValue = features[i].get(propertyName);
        features[i].set(propertyName, (gValue - min) / (max - min));
    }
};