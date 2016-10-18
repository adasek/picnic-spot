
/**
 * Spatial data structure with objectives:
 * 1) Answering Which feature(s) is given point inside?
 * 2) Features are for exapmle polygons. Features have some bounding box; feature may be inside multiple quad-tree nodes
 * 3) All features are added during program start and Quad-tree is not being modified during run 
 * 
 */

var turf = require('turf');

/**
 * 
 * @param {Array<number>} bbox - an Array of bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]
 * @param {int} featuresCount - expected number of added features
 * @returns {SpatialArray}
 */
SpatialArray = function (bbox, featuresCount) {
    /**
     * Number of "boxes" in x-coordinate
     * @type {integer}
     */
    this.XCNT = 100;
    if (typeof (featuresCount) === "number" && featuresCount > 0) {
        this.XCNT = Math.ceil(Math.sqrt(featuresCount));
    }
    /**
     * Number of "boxes" in x-coordinate
     * @type {integer}
     */
    this.YCNT = 100;
    if (typeof (featuresCount) === "number" && featuresCount > 0) {
        this.YCNT = Math.ceil(Math.sqrt(featuresCount));
    }

    /**
     * Const bbox
     */
    this.bbox = bbox;

    /**
     * @type{FeatureCollection}
     */
    this.nodes = new Array(this.XCNT * this.YCNT);
};


/**
 * Insert object with some bounding box into the QuadTree
 * @param {Feature} item - feature with a corresponding bounding box
 * @returns {undefined}
 */
SpatialArray.prototype.addFeature = function (item) {

    //bbox = an Array of bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]
    var bbox = turf.bbox(item);

    if (typeof (item.geometry) !== "undefined" && item.geometry.type === "MultiPolygon") {
        //console.log(JSON.stringify(item));
        //Split Multipolygon into polygons
        //My qualities
        var properties = item.properties; //no deep copy!

        item.geometry.coordinates.forEach(function (coords) {
            var feat = {'type': 'Feature', 'properties': properties, 'geometry': {'type': 'Polygon', 'coordinates': coords}};
            this.addFeature(feat);
        }.bind(this));
        return;
    }


    var top_left = this.getIndex(bbox[0], bbox[1]);
    var bottom_right = this.getIndex(bbox[2], bbox[3]);
    //console.log(": addFeature");
    for (var x = top_left[0]; x <= bottom_right[0]; x++) {

        for (var y = top_left[1]; y <= bottom_right[1]; y++) {
            var ind = this.getArrayIndex([x, y]);
            //   console.log("Inserting into " + ind);
            if (typeof this.nodes[ind] === "undefined") {
                //not yet used
                this.nodes[ind] = [];
            }
            this.nodes[ind].push(item);
        }
    }
};

/**
 * May be used to somehow polish and optimalize insterted data
 * @returns {undefined}
 */
SpatialArray.prototype.insertingFinished = function () {
    //Currently it is used to print some info about data structure:
    var lengths = [];
    for (var i = 0; i < 25; i++) {
        lengths[i] = 0;
    }
    for (var i = 0; i < this.nodes.length; i++) {
        if (Array.isArray(this.nodes[i])) {
            var len = this.nodes[i].length;
            lengths[len]++;
        }
    }
    for (var i = 0; i < lengths.length; i++) {
        //console.log("len" + i + " = " + lengths[i]);
    }


};

/**
 * Return index
 * @param {number} xcoord - 
 * @param {number} ycoord -
 * @return {integer[]} Index into two-dimensional array: [x,y]  
 */
SpatialArray.prototype.getIndex = function (xcoord, ycoord) {
    //[xLow, yLow, xHigh, yHigh]
    if (xcoord > this.bbox[2] || xcoord < this.bbox[0]) {
        throw "Point not within the structure.";
    }
    if (ycoord < this.bbox[1] || ycoord > this.bbox[3]) {
        throw "Point not within the structure.";
    }
    var xIndex = Math.round((this.XCNT - 1) * ((xcoord - this.bbox[0]) / (this.bbox[2] - this.bbox[0])));
    var yIndex = Math.round((this.YCNT - 1) * ((ycoord - this.bbox[1]) / (this.bbox[3] - this.bbox[1])));

    return [xIndex, yIndex];
};

/**
 * Mapping from multidimensional index to linear array
 * @param {integer[]} index - Index into two-dimensional array: [x,y]  
 * @returns {integer}
 */
SpatialArray.prototype.getArrayIndex = function (index) {
    return index[0] + index[1] * this.XCNT;
};

/**
 * Find item(s) on the point
 * 
 * @param {number[]} point - [x,y] 
 * @return {FeatureCollection}
 */
SpatialArray.prototype.findItem = function (point) {
    mi = this.getArrayIndex(this.getIndex(point[0], point[1]));

    var featureCollection = turf.featureCollection();
    if (!Array.isArray(this.nodes[mi])) {
        //empty
        return featureCollection;
    }

    featureCollection.features = [];
    for (var k = 0; k < this.nodes[mi].length; k++) {
        if (turf.inside(point, this.nodes[mi][k])) {
            featureCollection.features.push(this.nodes[mi][k]);
        }
    }
    return featureCollection;
};


module.exports = SpatialArray;