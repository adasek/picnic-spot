#!/bin/bash

#Dependencies:
# * unzip


mkdir -p data/src


function zipShp(){
address="$1" #URL of zip file
name="$2"
 wget -nc -O data/src/"$name".zip "$address"
 unzip -o data/src/"$name".zip -d data/src/"$name"
# ogr2ogr -f GeoJSON data/"$name".json data/src/"$name"/"$name".shp
}

zipShp "http://opendata.iprpraha.cz/CUR/OVZ/OVZ_Klima_Osluneni_p/WGS_84/OVZ_Klima_Osluneni_p_shp.zip" OVZ_Klima_Osluneni_p
#zipShp "http://opendata.iprpraha.cz/CUR/HM/HM_Ekola_den_p/WGS_84/HM_Ekola_den_p_shp.zip" HM_Ekola_den_p
#zipShp "http://opendata.iprpraha.cz/CUR/URK/URK_SS_VyuzitiZakl_p/WGS_84/URK_SS_VyuzitiZakl_p_shp.zip" URK_SS_VyuzitiZakl_p


psql -c "drop database knp_praha"
psql -c "create database knp_praha"
psql -d knp_praha -c "CREATE EXTENSION postgis;"
psql -d knp_praha -c "GRANT ALL PRIVILEGES ON DATABASE knp_praha TO knp"


for f in  data/src/* #data/*.json
 do
 if [ ! -d "$f" ] 
  then #not a directory
  continue
 fi
 echo $f;
 tablename=`echo $f|sed -e 's/^data\/src\///g'`
 #echo $tablename
 #ogr2ogr -f "PostgreSQL" PG:"dbname=knp_praha user=postgres" data/OVZ_Klima_Osluneni_p.json -nln $tablename -append
 #psql -d knp_praha -c "SELECT ST_AsText(ST_GeomFromGeoJSON()))";
 shp2pgsql "$f"/*.shp "$tablename" | psql -d knp_praha

 psql -d knp_praha -c "CREATE INDEX $tablename_gix ON $tablename USING GIST (geom);"

 done

psql -d knp_praha -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO knp"
