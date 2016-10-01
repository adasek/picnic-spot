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

var ShapeLayer = function (geojsonFilename, propertyName, cb) {
    Layer.call(this);
    
    this.propertyName = propertyName;

    this.geojson = {};

    this.download(geojsonFilename, "geojson", cb);

};

//Inheritance
ShapeLayer.prototype = Object.create(Layer.prototype);


/*
 * Return whole layer with colors adjusted according to feature property
 * and given colorScale
 * 
 * @param {function} colorScale - color scale for (0..1)
 * @returns {ol.Vector}
 */
ShapeLayer.prototype.getVector = function (colorScaleStr) {


    //convert geojson
    this.features = (new ol.format.GeoJSON()).readFeatures(this.geojson, {featureProjection: 'EPSG:3857'});

    this.normalizeProperty(this.features);

    for (var i = 0; i < this.features.length; i++) {
        var gValue = this.features[i].get(this.propertyName);
        var colorString = colorScaleStr(gValue);

        this.features[i].setStyle(
                new ol.style.Style({
                    fill: new ol.style.Fill({"color": colorString})
                }));
    }


    this.vectorSource = new ol.source.Vector({
        features: this.features,
        format: new ol.format.GeoJSON()
    });



    var vector = new ol.layer.Vector({
        source: this.vectorSource
    });
    return vector;

};

/**
 *  */
ShapeLayer.prototype.getValueAt = function (coordinate) {
    var features = this.vectorSource.getFeaturesAtCoordinate(coordinate)
    //test: highlight this feature
    features[0].setStyle(
            new ol.style.Style({
                fill: new ol.style.Fill({"color": "#0000ff"})
            }));

    return features[0].get(this.propertyName);
};


/* */
ShapeLayer.prototype.normalizeProperty = function (features) {
    var gValue;
    var max = -999;
    var min = 999;

    for (var i = 0; i < features.length; i++) {
        gValue = features[i].get(this.propertyName);
        if (gValue > max) {
            max = gValue;
        }
        if (gValue < min) {
            min = gValue;
        }
    }

    //normalize

    for (var i = 0; i < features.length; i++) {
        gValue = features[i].get(this.propertyName);
        features[i].set(this.propertyName, (gValue - min) / (max - min));
    }
};