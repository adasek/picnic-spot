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
var Layer = function () {

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