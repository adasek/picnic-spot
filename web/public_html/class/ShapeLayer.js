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

var ShapeLayer = function (opts, cb) {
    Layer.call(this, opts);

    this.propertyName = opts.property;
    this.name = opts.name;

    this.geojson = {};

    if (typeof (opts.file) !== "string" || opts.file.length === 0) {
        throw "No filename providen to ShapeLayer";
    }

    this.download(opts.file, "geojson", cb);

    /**
     * Indexed with property value => key is rgb string
     */
    this.colorCache = {};

    /* Array of max and min value of property */
    this.minMax = null;
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
ShapeLayer.prototype.getVector = function () {

    var minMax = this.getMinMax(this.propertyName);

    for (var i = 0; i < this.features.length; i++) {
        var gValue = this.features[i].get(this.propertyName);
        var colorString = this.colorScaleStr(gValue, minMax);

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
    if (this.vectorSource === null || this.vectorSource === undefined) {
        this.getVector(function () {
            return [0, 0, 0, 0];
        });
    }

    var features = this.vectorSource.getFeaturesAtCoordinate(coordinate)
    //test: highlight this feature
    if (features === null || features.length === 0) {
        return undefined;
    }
    features[0].setStyle(
            new ol.style.Style({
                fill: new ol.style.Fill({"color": "#0000ff"})
            }));

    return features[0].get(this.propertyName);
};


/* */
ShapeLayer.prototype.getMinMax = function (propertyName) {
    if (this.minMax !== null && this.minMax !== undefined) {
        return this.minMax;
    }

    var gValue;
    var max = -999;
    var min = 999;


    for (var i = 0; i < this.features.length; i++) {
        gValue = this.features[i].get(propertyName);
        if (gValue > max) {
            max = gValue;
        }
        if (gValue < min) {
            min = gValue;
        }
    }
    this.minMax = [min, max];
    return this.minMax;
};


ShapeLayer.prototype.colorScale = function (index, minMax) {
    /* //jet
     var myScale = {
     0: [0, 0, 131],
     0.125: [0, 60, 170],
     0.375: [5, 255, 255],
     0.625: [255, 255, 0],
     0.875: [250, 0, 0],
     1: [128, 0, 0]};
     */

    var myScale = {0: [0, 0, 0, 1], 1: [255, 255, 0, 1]};
    //normalize value:
    index = (index - minMax[0]) / (minMax[1] - minMax[0]);

    var lastP = 0;
    for (var p in myScale) {
        if (lastP <= index && p >= index) {
            //do linear interpolation
            var ret = [0, 0, 0, 0];
            for (var n = 0; n < 4; n++) {
                ret[n] = myScale[lastP][n] + ((index - lastP) / (p - lastP)) * (myScale[p][n] - myScale[lastP][n]);
            }
            return ret;
        }
        lastP = p;
    }
    console.error("Color scale failed; index " + index + "not between 0..1");
    throw "color scale failed";
};


ShapeLayer.prototype.colorScaleStr = function (gValue, minMax) {
    if (this.colorCache[gValue] !== undefined) {
        return this.colorCache[gValue];
    }

    var colorArray = this.colorScale(gValue, minMax);
    var colorString = "#";
    for (var i = 0; i < 3; i++) {
        var cc = colorArray[i].toString(16);
        colorString += ("00" + cc).substring(2 + cc.length - 2);
    }
    this.colorCache[gValue] = colorString;
    return colorString;
};

/**
 * 
 * @param {number []} coordinate - two numbers
 * @returns {undefined}
 */
ShapeLayer.prototype.report = function (coordinate) {
    var v = this.getValueAt(coordinate);
    this.getMinMax(this.propertyName);

    var iconFile = this.determineIcon(coordinate);
    if (v === undefined) {
        return "";
    }
    return "<div class=\"PointLayer Layer\"><img src=\"icons/" + iconFile + "\" " +
            " alt=\"Hodnota " + this.name + " je " + v + " z " + this.minMax[1] + "\"><div class=\"Value Quality\">" + v + "/" + this.minMax[1] + "</div></div>";

};