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
zipShp "http://opendata.iprpraha.cz/CUR/HM/HM_Ekola_den_p/WGS_84/HM_Ekola_den_p_shp.zip" HM_Ekola_den_p
zipShp "http://opendata.iprpraha.cz/CUR/URK/URK_SS_VyuzitiZakl_p/WGS_84/URK_SS_VyuzitiZakl_p_shp.zip" URK_SS_VyuzitiZakl_p
zipShp "http://opendata.iprpraha.cz/CUR/OVZ/OVZ_Klima_ZnecOvzdusi_p/WGS_84/OVZ_Klima_ZnecOvzdusi_p_shp.zip" OVZ_Klima_ZnecOvzdusi_p_shp


if [ 0"$1" -eq 1 ]
 then
 psql -c "drop database knp_praha"
 psql -c "create database knp_praha"
 psql -d knp_praha -c "CREATE EXTENSION postgis;"
 psql -d knp_praha -c "GRANT ALL PRIVILEGES ON DATABASE knp_praha TO knp"
fi


for f in  data/src/* #data/*.json
 do
 if [ ! -d "$f" ] 
  then #not a directory
  continue
 fi
#temporary
#if [ ! "$f" = "data/src/OVZ_Klima_ZnecOvzdusi_p_shp" ]
# then
# continue
#fi

 echo $f;
 tablename=`echo $f|sed -e 's/^data\/src\///g'`
 shp2pgsql "$f"/*.shp "$tablename"_source | psql -d knp_praha


psql -d knp_praha -c "CREATE TABLE $tablename AS SELECT  *, (ST_DUMP(geom)).geom::geometry(Polygon,0) AS new_geom FROM ""$tablename""_source"

 psql -d knp_praha -c "ALTER TABLE $tablename DROP COLUMN geom;"
 psql -d knp_praha -c "ALTER TABLE $tablename RENAME COLUMN new_geom TO geom;"
 psql -d knp_praha -c "VACUUM ANALYZE $tablename;"


 psql -d knp_praha -c "CREATE INDEX ""$tablename""_gix ON $tablename USING GIST (geom);"

 psql -d knp_praha -c "DROP TABLE ""$tablename""_source;"

 psql -d knp_praha -c "VACUUM FULL VERBOSE ANALYZE $tablename"

 done

psql -d knp_praha -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO knp"
