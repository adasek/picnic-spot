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
Layer.prototype.download = function (geojsonFilename, propertyName, cb) {
    this._downloadCb = cb;
    this._downloadProperty = propertyName;

    var xhttp = new XMLHttpRequest();
    var th = this;

    xhttp.open("GET", geojsonFilename, true);
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
        this[this._downloadProperty] = JSON.parse(responseText);
        this._downloadCb(null, this);
    } catch (e) {
        console.error(e);
        console.error(responseText);
    }
};