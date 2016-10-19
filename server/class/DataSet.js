/* 
 *  @copyright Adam Benda, 2016
 */


var fs = require('fs');
var JSONStream = require('JSONStream');
var SpatialArray = require('./SpatialArray');

/**
 * DataSet is one source of data that can be used
 * to tell quality(ies) of a given point.
 *  
 * @class
 *  
 * @returns {DataSet} 
 */
var DataSet = function (opts) {

    /**
     * Approximate number of features in the dataset
     * @param {number}
     */
    this.particles = 10000;
    if (typeof (opts.particles) === "number") {
        this.particles = opts.particles;
    }

    /**
     * Approximate number of features in the dataset
     * @param {number}
     */
    this.name = "unnamed";
    if (typeof (opts.name) === "string" && opts.name.length > 0) {
        this.name = opts.name;
    }

    /**
     * Features stored in helper data structure
     */
    this.data = new SpatialArray([14.2, 49.93, 14.72, 50.2], this.particles);


    this.ready = false;
};

/**
 * Initiate asynchrnous ajax download. Afterwards retrieved data(json) will
 * be in this[propertyName] and cb would be called  
 * @param {string} geojsonFilename
 * @param {function} cb
 * @returns {undefined}
 */
DataSet.prototype.parseFromFile = function (filename, cb) {

    var stream = fs.createReadStream(filename, {flags: 'r', encoding: 'utf-8'});

    stream.pipe(JSONStream.parse('features.*'))
            .on('data', function (d) {
                this.data.addFeature(d);
            }.bind(this)).
            on('end', function () {
                this.data.insertingFinished();
                this.ready = true;

                cb(null, this);
            }.bind(this));
};

/**
 * Gets unformated info about given point
 * @param {number[]} point - [x,y]
 * @returns {object|null}
 */
DataSet.prototype.getProperty = function (point) {
    var found = this.data.findItem(point).features[0];
    if (typeof (found) !== "undefined" && found !== null) {
        return found.properties;
    }
    return null;
};

module.exports = DataSet;