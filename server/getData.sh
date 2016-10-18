#!/bin/bash

#Dependencies:
# * unzip
# * ogr2ogr (package gdal-bin)
#

mkdir -p data/src
wget -nc -O data/OVZ_Klima_Osluneni_p.json  http://opendata.iprpraha.cz/CUR/OVZ/OVZ_Klima_Osluneni_p/WGS_84/OVZ_Klima_Osluneni_p.json


function zipShp(){
address="$1" #URL of zip file
name="$2"
 wget -nc -O data/src/"$name".zip "$address"
 unzip -o data/src/"$name".zip -d data/src/"$name"
 ogr2ogr -f GeoJSON data/"$name".json data/src/"$name"/"$name".shp
}

zipShp "http://opendata.iprpraha.cz/CUR/HM/HM_Ekola_den_p/WGS_84/HM_Ekola_den_p_shp.zip" "HM_Ekola_den_p"

zipShp "http://opendata.iprpraha.cz/CUR/URK/URK_SS_VyuzitiZakl_p/WGS_84/URK_SS_VyuzitiZakl_p_shp.zip" URK_SS_VyuzitiZakl_p
