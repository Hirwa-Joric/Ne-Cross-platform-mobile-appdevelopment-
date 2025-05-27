import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Circle, Path, Text as SvgText } from 'react-native-svg';
import { CATEGORY_CONFIG } from '../../components/ui/CategoryPill';
import theme from '../../constants/theme';

// Improved utility function to generate arc path for pie chart
const getArcPath = (centerX, centerY, radius, startAngle, endAngle) => {
  // Convert angles from degrees to radians
  const startAngleRad = (startAngle - 90) * Math.PI / 180;
  const endAngleRad = (endAngle - 90) * Math.PI / 180;
  
  // Calculate the coordinates of the points on the circle
  const startX = centerX + radius * Math.cos(startAngleRad);
  const startY = centerY + radius * Math.sin(startAngleRad);
  const endX = centerX + radius * Math.cos(endAngleRad);
  const endY = centerY + radius * Math.sin(endAngleRad);
  
  // Create the arc path - using large arc if the angle is more than 180 degrees
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

// Utility function to format currency amounts
const formatAmount = (amount) => {
  return 'RWF ' + Number(amount).toLocaleString('en-US');
};

// Main chart component
const SpendingChart = ({ data, width, height }) => {
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  // Handle no data case
  if (total === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.title}>Monthly Spending by Category</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No spending data available</Text>
        </View>
      </View>
    );
  }
  
  // Handle case with only one category: show a full circle
  if (data.length === 1) {
    const item = data[0];
    const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Others;
    
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.title}>Monthly Spending by Category</Text>
        <View style={styles.chartContainer}>
          <View style={styles.singleCategoryChart}>
            <Svg width={width * 0.5} height={width * 0.5} viewBox={`0 0 100 100`}>
              <Circle cx="50" cy="50" r="45" fill={config.color} />
              <SvgText
                x="50"
                y="50"
                fontSize="14"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                100%
              </SvgText>
            </Svg>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: config.color }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendCategory}>{item.category}</Text>
                <Text style={styles.legendAmount}>{formatAmount(item.amount)}</Text>
              </View>
              <Text style={styles.legendPercentage}>100%</Text>
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  
  // Normal case: multiple categories
  // Calculate angles for each slice
  let startAngle = 0;
  const chartData = data.map((item) => {
    const percentage = (item.amount / total) * 100;
    const angle = (percentage / 100) * 360;
    const slice = {
      ...item,
      percentage,
      startAngle,
      endAngle: startAngle + angle,
    };
    startAngle += angle;
    return slice;
  });
  
  // Limit display to top 5 categories for better visibility
  const displayData = chartData.length > 5 
    ? [...chartData.slice(0, 4), {
        category: 'Others',
        amount: chartData.slice(4).reduce((sum, item) => sum + item.amount, 0),
        percentage: chartData.slice(4).reduce((sum, item) => sum + item.percentage, 0),
        startAngle: chartData[4].startAngle,
        endAngle: chartData[chartData.length - 1].endAngle
      }]
    : chartData;
  
  // Dimensions for the chart
  const size = Math.min(width * 0.5, height * 0.6);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = centerX * 0.9; // Slightly smaller than half width for padding
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>Monthly Spending by Category</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Inner white circle for better appearance */}
            <Circle 
              cx={centerX} 
              cy={centerY} 
              r={radius * 0.5} 
              fill="white" 
              stroke="#f0f0f0"
              strokeWidth="1"
            />
            
            {/* Chart Slices */}
            <G>
              {displayData.map((slice, index) => {
                const config = CATEGORY_CONFIG[slice.category] || CATEGORY_CONFIG.Others;
                return (
                  <Path
                    key={index}
                    d={getArcPath(centerX, centerY, radius, slice.startAngle, slice.endAngle)}
                    fill={config.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </G>
            
            {/* Total in Center */}
            <SvgText
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill={theme.COLORS.text.primary}
            >
              Total
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 14}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill={theme.COLORS.text.primary}
            >
              {formatAmount(total)}
            </SvgText>
          </Svg>
        </View>
        
        {/* Enhanced Legend */}
        <View style={styles.legend}>
          {displayData.map((item, index) => {
            const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Others;
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: config.color }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendCategory}>{item.category}</Text>
                  <Text style={styles.legendAmount}>{formatAmount(item.amount)}</Text>
                </View>
                <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: theme.FONT_SIZES.lg,
    fontFamily: theme.FONTS.semibold,
    color: theme.COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  singleCategoryChart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  noDataText: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
    textAlign: 'center',
  },
  legend: {
    flex: 1,
    marginLeft: 16,
    paddingLeft: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendCategory: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
  },
  legendAmount: {
    fontSize: theme.FONT_SIZES.xs,
    fontFamily: theme.FONTS.regular,
    color: theme.COLORS.text.secondary,
  },
  legendPercentage: {
    fontSize: theme.FONT_SIZES.sm,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.secondary,
    width: 45,
    textAlign: 'right',
  },
  totalContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.lightGrey,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.medium,
    color: theme.COLORS.text.primary,
  },
  totalAmount: {
    fontSize: theme.FONT_SIZES.md,
    fontFamily: theme.FONTS.bold,
    color: theme.COLORS.text.primary,
  },
});

export default SpendingChart; 