import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const EmptyState = ({ size = 180 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background */}
        <Circle cx="100" cy="100" r="80" fill="#F7F9FC" />
        
        {/* Empty document */}
        <G>
          <Rect x="60" y="50" width="80" height="100" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <Path d="M70 70H130" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
          <Path d="M70 90H130" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
          <Path d="M70 110H100" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
        </G>
        
        {/* Plus icon */}
        <Circle cx="140" cy="140" r="25" fill="url(#paint0_linear)" />
        <Path d="M140 130V150" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <Path d="M130 140H150" stroke="white" strokeWidth="4" strokeLinecap="round" />
        
        {/* Gradient definition */}
        <Defs>
          <LinearGradient id="paint0_linear" x1="140" y1="115" x2="140" y2="165" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#3B3B98" />
            <Stop offset="1" stopColor="#323278" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmptyState; 