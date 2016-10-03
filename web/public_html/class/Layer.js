/* 
 *  @copyright Adam Benda, 2016
 */


/**
 * Layer is an abstract class representing independent attribute dataset
 * Layer is inherited by PointLayer and ShapeLayer
 *  
 * @class
 *  
 * @returns {Layer} 
 */
var Layer = function (opts) {

    this.icons = null;
    if (typeof opts.icons === "object") {
        //PointLayer:
        //Icons: key: maximum distance[m], value: icon name (in directory gfx/)
        //
        //ShapeLayer:
        //key: maximum normalized value of property, value: icon name
        this.icons = opts.icons;
    } else if (opts.icons === false) {
        this.icons = false;
    }

    this.states = undefined;
    if (typeof opts.states === "object" && Array.isArray(opts.states)) {
        this.states = opts.states;
    }

    /**
     * @type {ol.layer.Base}
     */
    this.vector = null;

    /**
     * Zoom level of Openlayers from which layer should be hidden
     * @type {integer}
     */
    this.zoomTreshold = opts.zoomTreshold;

    if (typeof (opts.dontshowmeters) === "boolean") {
        this.dontshowmeters = opts.dontshowmeters;
    }

};

/**
 * Initiate asynchrnous ajax download. Afterwards retrieved data(json) will
 * be in this[propertyName] and cb would be called  
 * @param {string} geojsonFilename
 * @param {string} propertyName
 * @param {function} cb
 * @returns {undefined}
 */
Layer.prototype.download = function (filename, propertyName, cb) {
    this._downloadCB = cb;
    this._downloadProperty = propertyName;

    var xhttp = new XMLHttpRequest();
    var th = this;

    xhttp.open("GET", filename, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            th.downloadFinished.bind(th)(this.responseText);
        }
    };


    xhttp.send();
};

/**
 * Handle downloaded data
 * @param {string} responseText
 * @returns 
 */
Layer.prototype.downloadFinished = function (responseText) {
    try {
        if (this.type === "gpx") {
            this[this._downloadProperty] = responseText;
            this.features = (new ol.format.GPX()).readFeatures(this[this._downloadProperty], {featureProjection: 'EPSG:3857'});

        } else {
            //GeoJSON
            this[this._downloadProperty] = JSON.parse(responseText);

            this.features = (new ol.format.GeoJSON()).readFeatures(this[this._downloadProperty], {featureProjection: 'EPSG:3857'});
        }
        this._downloadCB(null, this);
    } catch (e) {
        console.error(e);
        console.error(JSON.stringify(e));
        //console.error(responseText);
    }
};

/**
 * Returns two kind of values: either a string (filename) or object (state)
 * @param {type} coordinate
 * @returns {String|Object}
 */
Layer.prototype.determineIcon = function (coordinate) {
    //key: maximum normalized value of property, value: icon name
    if (typeof (this.icons) !== "object" && typeof (this.states) !== "object") {
        return "unknown.png";
    }

    var myVal = this.getValueAt(coordinate);

    if (typeof (this.states) === "object") {
        //NEW WAY
        var myState = null;
        var myMin = 999999;
        for (var i = 0; i < this.states.length; i++) {
            if (typeof (this.states[i].maxVal) === "number" && this.states[i].maxVal > myVal && myMin > this.states[i].maxVal) {
                //prioritized is anything with maxVal defined (lowest acceptable)
                myMin = this.states.maxVal;
                myState = this.states[i];
            } else if (typeof (this.states[i].maxVal) !== "number" && myState === null) {
                //item without maxVal is default
                myState = this.states[i];
            }
        }
        return myState; //Returns Object!

    } else {
        //OLD WAY
        //TODO: sort object by key ascending.
        //browsers may not iterate through it properly!


        var myIcon = "unknown.png";
        var last = "unknown.png";
        for (var k in this.icons) {
            if (k > myVal) {
                return this.icons[k];
            }
            last = this.icons[k];
        }
        //maximum key is less then myVal
        //use last
        return last;
    }
};

/***
 * After zoom we need to set this visible/invisible
 * @type type
 
 */
Layer.prototype.zoomedEvent = function (zoomLevel) {

    if (typeof (this.zoomTreshold) !== "number") {
        this.zoomTreshold = 15;
    }


    if (this.zoomTreshold <= zoomLevel) {
        this.getVector().setVisible(true);
    } else {
        this.getVector().setVisible(false);
    }
};