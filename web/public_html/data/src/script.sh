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

#did not use: swimming_pool
for type in bbq platform stop_position parking recycling toilets viewpoint firepit picnic_site playground railway_station subway_entrance tram_stop sports_center sport_pitch nature_reserve waste_basket highway_bus_stop #drinking_water was merged with studanky and created manually

do
#<node id="25314361" lat="50.1318907" lon="14.2944820">
echo '<?xml version="1.0" encoding="utf-8"?>' > ../$type.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$type.gpx

 grep "<node" xapi/$type.xml |sed -e 's/<node/<wpt/' | sed -e 's/$/<\/wpt>/' >> ../$type.gpx

echo '</gpx>' >> ../$type.gpx
done

#merging:
#merge platform and stop_position and railway_station subway_entrance tram_stop as mhd_stop
#todo: add also bus_stop

resultName="mhd_stop";
echo '<?xml version="1.0" encoding="utf-8"?>' > ../$resultName.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$resultName.gpx
for type in platform stop_position railway_station subway_entrance tram_stop highway_bus_stop
 do
 grep "<wpt" ../$type.gpx >> ../$resultName.gpx 
done
echo '</gpx>' >> ../$resultName.gpx

#merge sports_center sport_pitch into sport
resultName="sport";
echo '<?xml version="1.0" encoding="utf-8"?>' > ../$resultName.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$resultName.gpx
for type in sports_center sport_pitch
 do
 grep "<wpt" ../$type.gpx >> ../$resultName.gpx 
done
echo '</gpx>' >> ../$resultName.gpx



#merge bbq + picnic_site + zidle into sitting
resultName="sitting";
echo '<?xml version="1.0" encoding="utf-8"?>' > ../$resultName.gpx
echo '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">"' >>  ../$resultName.gpx
for type in bbq picnic_site 
 do
 grep "<wpt" ../$type.gpx >> ../$resultName.gpx 
done
grep "wpt" ./zidle_wgs.gpx >> ../$resultName.gpx
echo '</gpx>' >> ../$resultName.gpx

