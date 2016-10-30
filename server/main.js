/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');
var http = require('http');
var queryString = require('querystring');

var async = require('async');

var pg = require('pg');

var DataSet = require('./class/DataSet');


server = http.createServer(function (req, res) {
    //After connection
    if (req.url.indexOf('?') >= 0) {
        var queryParams = queryString.parse(req.url.replace(/^.*\?/, ''));
        var lon = queryParams["lon"];
        var lat = queryParams["lat"];

        var data = {};
        var readyCnt = {"cnt": 0}; //counter of server datasets

        for (var n = 0; n < dataSources.length; n++) {
            dataSources[n].dataset.getProperty([lon, lat], function (opts, err, result) {
                if (err) {
                    throw err;
                }
                data[opts.datasetName] = result.rows[0];

                opts.readyCnt.cnt++;

                if (opts.readyCnt.cnt === opts.datasetsNum) {
                    //last dataset served
                    //send response

                    opts.res.setHeader('Access-Control-Allow-Origin', '*');
                    opts.res.writeHead(200, {'Content-Type': 'application/json'});
                    opts.res.end(JSON.stringify(opts.data, null, 2));
                }
            }.bind(client, {
                "data": data,
                "readyCnt": readyCnt,
                "datasetsNum": dataSources.length,
                "res": res,
                "datasetName": dataSources[n].name
            }));
        }
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Resource not found\n');
    }

});


var dataSources = [
    {
        "name": "osluneni",
        "table": "ovz_klima_osluneni_p",
        "columns": ["gridvalue"]
    }, {
        "name": "hluk_den",
        "table": "hm_ekola_den_p",
        "columns": ["db_lo", "db_hi"],
        "round": true
    }, {
        "name": "vyuziti",
        "table": "urk_ss_vyuzitizakl_p",
        "columns": ["zastupna_f", "za_prahou", "kod", "kod_polyfc", "verej_pris"]
    }, {
        "name": "alcohol_ban",
        "table": "alcohol_ban",
        "columns": ["value"]
    },
    {
        "name": "znecisteni_ovzdusi",
        "table": "ovz_klima_znecovzdusi_p_shp",
        "columns": ["gridvalue"]

    }
];

//https://github.com/brianc/node-postgres
var client = new pg.Client({
    user: 'knp', //env var: PGUSER
    database: 'knp_praha', //env var: PGDATABASE
    password: 'fsatqe95oo2', //env var: PGPASSWORD
    host: '192.168.1.3', // Server hosting the postgres database
    port: 5432 //env var: PGPORT
});

loadDataS = [];

//SELECT zastupna_f,za_prahou,kod,kod_polyfc,verej_pris  FROM urk_ss_vyuzitizakl_p
// WHERE ST_Contains(geom, ST_Point(14.3239917,50.0939344));

/*
 
 **/

client.connect(
        function (err, result) {
            if (err) {
                throw err;
            }

            for (var n = 0; n < dataSources.length; n++) {
                dataSources[n].dataset = new DataSet(client, dataSources[n]);
            }

            //server is ready to answer
            console.log("ready");


            server.listen(888, "0.0.0.0", function () {
                console.log("Server running");
            });

        });


