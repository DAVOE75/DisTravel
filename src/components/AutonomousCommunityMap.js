import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { REGION_PATHS } from '../data/region_paths';

/**
 * AutonomousCommunityMap
 * Renders a stylized silhouette of a Spanish region with a marker for the current municipality.
 */
export const AutonomousCommunityMap = ({ 
  regionName, 
  cityCoords, 
  width = 150, 
  height = 110 
}) => {
  // Mapping for consistency
  const regionKey = useMemo(() => {
    const mapping = {
      'Alicante': 'Valencia',
      'Alicante / Alacant': 'Valencia',
      'C. Valenciana': 'Valencia',
      'Comunidad Valenciana': 'Valencia',
      'Madrid': 'Madrid',
      'Comunidad de Madrid': 'Madrid'
    };
    return mapping[regionName] || regionName;
  }, [regionName]);

  const regionData = REGION_PATHS[regionKey];

  if (!regionData) {
    return null;
  }

  const { paths, bounds } = regionData;
  const { minX, maxX, minY, maxY } = bounds;
  const VIEW_SIZE = 500;

  // Unified scale engine to maintain real proportions
  const deltaLng = maxX - minX;
  const deltaLat = maxY - minY;
  
  // Aspect adjustment for Spain's latitude
  const latCorrection = 1.3;
  const adjustedDeltaLat = deltaLat * latCorrection;
  
  // Use the larger dimension to determine unified scale
  const scale = Math.min(VIEW_SIZE / deltaLng, VIEW_SIZE / adjustedDeltaLat) * 0.9;
  
  // Center map within the 500x500 viewBox
  const offsetX = (VIEW_SIZE - (deltaLng * scale)) / 2;
  const offsetY = (VIEW_SIZE - (adjustedDeltaLat * scale)) / 2;

  const mapX = (lng) => offsetX + (lng - minX) * scale;
  const mapY = (lat) => offsetY + (adjustedDeltaLat * scale) - ((lat - minY) * scale * latCorrection);

  const svgPaths = paths.map((poly, i) => {
    const d = poly.map((point, j) => {
      const x = mapX(point[0]);
      const y = mapY(point[1]);
      return `${j === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ') + 'Z';
    return <Path key={i} d={d} fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="2.5" />;
  });

  const dot = cityCoords ? (
    <Circle 
      cx={mapX(cityCoords.longitude)} 
      cy={mapY(cityCoords.latitude)} 
      r="12" 
      fill="#EFBF04" 
      stroke="#FFF"
      strokeWidth="3"
    />
  ) : null;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} preserveAspectRatio="xMidYMid meet">
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
  }
});
