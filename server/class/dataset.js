/* 
 *  @copyright Adam Benda, 2016
 */


/**
 * DataSet is one source of data that can be used
 * to tell quality(ies) of a given point.
 *  
 * @class
 *  
 * @returns {DataSet} 
 */
var DataSet = function (client, opts) {
    /**
     * Name of table in the Postgres geo database
     * @param {String}
     */
    this.table = "unnamed";
    if (typeof (opts.table) === "string" && opts.table.length > 0) {
        this.table = opts.table;
    }

    this.name = "unnamed";
    if (typeof (opts.name) === "string" && opts.name.length > 0) {
        this.name = opts.name;
    }

    /**
     * Name of columns in the Postgres geo database
     * @param {string[]}
     */
    this.columns = ["unknown"];
    if (Array.isArray(opts.columns)) {
        this.columns = opts.columns;
    }


    this.round = false;
    if (typeof (opts.round) === "boolean") {
        this.round = opts.round;
    }

    /**
     * @type {pg.Client}
     */
    this.client = client;

    this.queryName = "getQual_" + this.table;

    if (this.round) {
        for (var i = 0; i < this.columns.length; i++) {
            this.columns[i] = "round(" + this.columns[i] + ") AS "+this.columns[i];
        }
    }
    var columnsS = this.columns.join();
    this.firstQuery = this.client.query(
            {"text": 'SELECT ' + columnsS + ' FROM ' + this.table + ' WHERE ST_Contains(geom, ST_Point($1::float,$2::float))',
                "values": [14.4297444, 50.0797425],
                "name": this.queryName
            });

};

/**
 * Gets unformated info about given point
 * @param {number[]} point - [x,y]
 * @param {function} callback - function to be called afterwards
 * @returns {undefined}
 */
DataSet.prototype.getProperty = function (point, callback) {
    //using prepared query
    var thisQuery = this.client.query({
        name: this.queryName,
        values: point
    }, callback);
};

module.exports = DataSet;