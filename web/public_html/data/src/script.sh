#!/bin/bash

for DIR in "HM_Ekola_ADP_pasma_den_p_shp"
do
mkdir -p ../"$DIR"
if [ ! -r ../"$DIR"/data.geojson ]
then
ogr2ogr -f "GeoJSON" ../"$DIR"/data.geojson "$DIR"/*.shp
fi
done


#ohniste, grilly
for type in ohniste grilly
do

echo '<?xml version="1.0" encoding="utf-8"?>' > ../$type.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$type.gpx

cut -d "," -f 4 ohniste_grilly/$type.csv > /tmp/"$$"_lan
cut -d ',' -f 5 ohniste_grilly/$type.csv > /tmp/"$$"_lon
numLines=`wc -l /tmp/"$$"_lan|tr -s " "|cut -d " " -f 1`
yes '<wpt lat="' |head -n $numLines > /tmp/"$$"_a
yes "\" lon=\"" |head -n $numLines > /tmp/"$$"_c
yes "\"></wpt>" |head -n $numLines > /tmp/"$$"_e

paste /tmp/"$$"_a /tmp/"$$"_lan /tmp/"$$"_c  /tmp/"$$"_lon  /tmp/"$$"_e |sed -e 's/\t//g' >> ../$type.gpx

echo '</gpx>' >> ../$type.gpx
done


for type in drinking_water
do
#<node id="25314361" lat="50.1318907" lon="14.2944820">
echo '<?xml version="1.0" encoding="utf-8"?>' > ../$type.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$type.gpx

 grep "<node" xapi/$type |sed -e 's/<node/<wpt/' | sed -e 's/$/<\/wpt>/' >> ../$type.gpx

echo '</gpx>' >> ../$type.gpx
done
