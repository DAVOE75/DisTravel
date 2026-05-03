import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { REGION_PATHS } from '../data/region_paths';

export const AutonomousCommunityMap = ({ regionName, cityCoords, width = 120, height = 120 }) => {
  // Normalizar nombre de la región
  const regionKey = useMemo(() => {
    const mapping = {
      'Aragón': 'Aragon',
      'C. Valenciana': 'Valencia',
      'Comunidad Valenciana': 'Valencia',
      'Cataluña': 'Cataluña',
      'Madrid': 'Madrid',
      'Comunidad de Madrid': 'Madrid',
      'Castilla y León': 'Castilla-Leon',
      'Andalucía': 'Andalucia',
      'País Vasco': 'Pais Vasco',
      'Euskadi': 'Pais Vasco',
      'Galicia': 'Galicia',
      'Castilla-La Mancha': 'Castilla-La Mancha',
      'Murcia': 'Murcia',
      'Región de Murcia': 'Murcia',
      'Extremadura': 'Extremadura',
      'Baleares': 'Baleares',
      'Islas Baleares': 'Baleares',
      'Canarias': 'Canarias',
      'Islas Canarias': 'Canarias',
      'Asturias': 'Asturias',
      'Principado de Asturias': 'Asturias',
      'Cantabria': 'Cantabria',
      'Navarra': 'Navarra',
      'La Rioja': 'La Rioja',
      'Ceuta': 'Ceuta',
      'Melilla': 'Melilla'
    };
    return mapping[regionName] || regionName;
  }, [regionName]);

  const regionData = REGION_PATHS[regionKey];

  if (!regionData) {
    return <View style={{ width, height, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />;
  }

  const { paths, bounds } = regionData;
  const { minX, minY, maxX, maxY } = bounds;

  const SVG_SIZE = 500;
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  
  // Aspect ratio correction (1 deg Lon != 1 deg Lat in km)
  // At latitude 40 (Spain), 1 deg Lon is approx 0.76 of 1 deg Lat
  const avgLat = (minY + maxY) / 2;
  const cosLat = Math.cos(avgLat * Math.PI / 180);
  
  const widthUnits = rangeX * cosLat;
  const heightUnits = rangeY;
  
  const maxUnits = Math.max(widthUnits, heightUnits);
  const scale = SVG_SIZE / maxUnits;

  const offsetX = (SVG_SIZE - widthUnits * scale) / 2;
  const offsetY = (SVG_SIZE - heightUnits * scale) / 2;

  const getX = (lon) => offsetX + (lon - minX) * cosLat * scale;
  const getY = (lat) => SVG_SIZE - (offsetY + (lat - minY) * scale);

  const svgPaths = paths.map((poly, i) => {
    const d = poly.map((point, j) => {
      const x = getX(point[0]);
      const y = getY(point[1]);
      return `${j === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ') + 'Z';
    return <Path key={i} d={d} fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="2" />;
  });

  const dot = cityCoords ? (
    <Circle 
      cx={getX(cityCoords.longitude)} 
      cy={getY(cityCoords.latitude)} 
      r="12" 
      fill="#EFBF04" 
      stroke="#FFFFFF"
      strokeWidth="3"
    />
  ) : null;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {svgPaths}
        {dot}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  }
});
