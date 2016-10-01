/* 
 *  @copyright Adam Benda, 2016
 */


/* global Layer */

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
    Layer.call(this);

    this.propertyName = opts.property;
    this.name = opts.name;

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

        this.features[i].setStyle(
                new ol.style.Style({
                    image: new ol.style.Icon({src: "icons/nicubunu-RPG-map-symbols-Wishing-Well-2-300px.png",
                        size: [300, 300],
                        scale:0.33,
                    })
                            /*
                             * new ol.style.Circle({
                             fill: new ol.style.Fill({
                             color: 'rgba(255,0,0,1)'
                             }),
                             radius: 20,
                             stroke: new ol.style.Stroke({
                             color: '#ffffff',
                             width: 5
                             })
                             })
                             */
                }));
    }

    var vectorSource = new ol.source.Vector({
        features: this.features
    });

    var vector = new ol.layer.Vector({
        source: vectorSource
    });

    return vector;
};