/* 
 *  @copyright Adam Benda, 2016
 */


/* global Layer, ol */

/**
 * PointLayer is a set of Points of interests of a specied type (e.g. Restaurants)
 * 
 * @class
 * @augments Layer
 * 
 * @param {String} geojsonFilename 
 * @param {function} cb - callback after file is downloaded
 * @returns {ShapeLayer} initialized structure bind to DOM 
 */

var PointLayer = function (opts, cb) {
    Layer.call(this, opts);

    this.propertyName = opts.property;
    this.name = opts.name;

    this.poiIco = opts.poiIco;

    this.gpx = null;

    if (typeof (opts.file) !== "string" || opts.file.length === 0) {
        throw "No filename providen to PointLayer";
    }


    if (opts.type === "gpx") {
        this.type = "gpx";
        this._downloadGPX_CB = cb;
        this.download(opts.file, "gpx", this.downloadGPXfinished.bind(this));
    } else {
        throw "No type providen to PointLayer";
    }

};

//Inheritance
PointLayer.prototype = Object.create(Layer.prototype);


PointLayer.prototype.downloadGPXfinished = function (err, result) {
    //handle somehow gpx
//console.log(this.gpx);
    this._downloadGPX_CB(err, this);
};

/**
 * 
 * @returns {undefined}
 */
PointLayer.prototype.getVector = function () {


    for (var i = 0; i < this.features.length; i++) {

        //default image: circle
        var poiImage = new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,1)'
                }),
                radius: 20,
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 5
                })
            })
        });

        if (typeof (this.poiIco) === "string" && this.poiIco.length > 0) {
            //PNG image is the POI icon    
            poiImage = new ol.style.Style({
                image: new ol.style.Icon({src: "icons/" + this.poiIco,
                    size: [300, 300],
                    scale: 0.25
                })
            })
        }


        this.features[i].setStyle(poiImage);
    }

    var vectorSource = new ol.source.Vector({
        features: this.features
    });

    var vector = new ol.layer.Vector({
        source: vectorSource
    });

    return vector;
};

/**
 * Return nearest Point
 * @param {number[]} location - as two numbers
 * @returns {Object}
 */
PointLayer.prototype.getNearest = function (location) {
    var pointA = new ol.geom.Point(location);
    pointA = ol.proj.transform(pointA.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    var sphere = new ol.Sphere(6378137);

    var pointB = (this.features[0].getGeometry()).getCoordinates();
    pointB = ol.proj.transform(pointB, 'EPSG:3857', 'EPSG:4326');
    var minDistance = sphere.haversineDistance(pointB, pointA);

    var index = 0;
    for (var i = 1; i <= this.features.length - 1; i++) {
        pointB = this.features[i].getGeometry().getCoordinates();
        pointB = ol.proj.transform(pointB, 'EPSG:3857', 'EPSG:4326');
        var dist = sphere.haversineDistance(pointB, pointA);
        if (dist < minDistance) {
            index = i;
            minDistance = dist;
        }
    }

    return {
        "distance": minDistance,
        "location": this.features[index],
        "feature": this.features[index]
    };

};

/**
 * In Point layer value is amount of meters from nearest.
 * It is not normalized.
 * @param {number[]} location
 * @returns {undefined}
 */
PointLayer.prototype.getValueAt = function (location) {

    var nearestObj = this.getNearest(location);
    return nearestObj.distance;
};



/**
 * Create a human readable string about distance of this kind
 * @param {number []} coordinate - two numbers
 * @returns {string}
 */
PointLayer.prototype.report = function (coordinate) {
    var nearest = this.getNearest(coordinate);


    var iconFile = this.determineIcon(coordinate);

    var distance = Math.round(nearest.distance); //in meters
    return "<div class=\"PointLayer Layer\"><img src=\"icons/" + iconFile + "\" " +
            " alt=\"Nejbližší " + this.name + " je " + distance + "m\"><div class=\"Value Distance\">" + distance + "m</div></div>";
};