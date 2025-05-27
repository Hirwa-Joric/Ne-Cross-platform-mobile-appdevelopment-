import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const Logo = ({ size = 90 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 180 180">
        {/* Background circle */}
        <Circle cx="90" cy="90" r="85" fill="#3B3B98" />
        
        {/* Inner circle with gradient */}
        <Circle cx="90" cy="90" r="70" fill="url(#paint0_linear)" />
        
        {/* Curved path representing finance/growth */}
        <Path d="M50 120C70 80 110 100 130 60" stroke="white" strokeWidth="12" strokeLinecap="round" />
        
        {/* Gradient definition */}
        <Defs>
          <LinearGradient id="paint0_linear" x1="90" y1="20" x2="90" y2="160" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#4F8A8B" />
            <Stop offset="1" stopColor="#3B3B98" />
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

export default Logo; 