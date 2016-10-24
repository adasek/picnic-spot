/* 
 * @author Adam Benda
 * 
 */

var fs = require('fs');

var turf = require('turf');
var async = require('async');

var pg = require('pg');

var DataSet = require('./class/DataSet');

var dataSources = [
    {
        "table": "ovz_klima_osluneni_p",
        "columns": ["gridvalue"]
    },{
        "table": "hm_ekola_den_p",
        "columns": ["db_lo", "db_hi"]
    },{
        "table": "urk_ss_vyuzitizakl_p",
        "columns": ["zastupna_f", "za_prahou", "kod", "kod_polyfc", "verej_pris"]
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

            var start = new Date();
            //Test points
            var testPoints = (turf.random('point', 100, {'bbox': [14.3242211, 50.0507947, 14.5278114, 50.1012511]}));
            var pointsXSourcesDone = 0;

            for (var i = 0; i < testPoints.features.length; i++) {
                var lon = testPoints.features[i].geometry.coordinates[0];
                var lat = testPoints.features[i].geometry.coordinates[1];
                for (var n = 0; n < dataSources.length; n++) {
                    dataSources[n].dataset.getProperty([lon, lat], function (opts, err, result) {
                        console.log("POINT=" + opts.lat + "," + opts.lon);
                        if (err) {
                            throw err;
                        }
                        console.log(JSON.stringify(result.rows));
                        pointsXSourcesDone++;
                        if (pointsXSourcesDone >= testPoints.features.length * dataSources.length) {
                            //end of program
                            var end = new Date();
                            console.log("Elapsed:" + (end - start));

                            // disconnect the client
                            client.end(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        }

                    }.bind(client, {"lat": lat, "lon": lon}));

                }
            }
        });


