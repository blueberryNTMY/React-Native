/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  PINK,
  GREEN,
  DARK_BLUE,
  PX200,
  PX20,
  PX12,
  PX34,
  PX100,
  MEDIUM_FONT,
  PX10,
  WHITE,
  PX6,
  PX30,
  PX36,
  PX25,
  PX43,
  PX37,
  AERO_BLUE,
  PX13,
  PX18,
  PX22,
  LAVENDER_BLUSH,
  PX14,
  PX50,
  PX5,
  PX90,
  PRIMARY_COLOR,
  PX60,
  PX40,
  PX175,
} from '../../constants';
import {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
  Rect,
  Text,
} from 'react-native-svg';
import {
  LineChart,
  Grid,
  YAxis,
  XAxis,
  PieChart,
} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { P1, H2 } from './Text';
import { getNum } from '../../utils/getNumberForChart';

export const SmallChart = ({ data, isWithinLimits }) => {
  if (data.length < 2) {
    return <View style={{ width: PX90 }} />;
  }

  if (data) {
    data = data.filter(v => !isNaN(v));
  }
  return (
    <LineChart
      curve={shape.curveNatural}
      width={PX50}
      height={PX30}
      style={[
        {
          marginLeft: PX10,
          flex: 1,
          maxHeight: '50%',
          backgroundColor: WHITE,
        },
      ]}
      data={data}
      numberOfTicks={1}
      animate={true}
      animationDuration={500}
      contentInset={{
        top: PX5,
        bottom: PX5,
        left: 0,
        right: 0,
      }}
      svg={{
        strokeWidth: 2,
        stroke: isWithinLimits ? GREEN : PINK,
      }}>
      <Grid />
    </LineChart>
  );
};

export const CircleChart = ({ data, style }) => {
  const pieData = data
    .filter(value => value.percent > 0)
    .map((el, index) => ({
      value: el.percent,
      svg: {
        fill: el.color,
        onPress: () => console.log('press', index),
      },
      key: `pie-${index}`,
    }));

  if (pieData.length > 0) {
    return (
      <PieChart
        style={[{ height: PX100, ...style }]}
        data={pieData}
        innerRadius={'20%'}
        outerRadius={'100%'}
        padAngle={0}
      />
    );
  } else {
    return <P1>Нет данных</P1>;
  }
};

export const Chart = props => {
  const { data, mins, maxs, dots, realNumberOfPoints } = props;
  const [CLEAN_DATA, setClean] = useState([]);
  const [STATUS, setStatus] = useState('');
  const [CHART_W, setWidth] = useState('');
  const [MIN_, setMin] = useState('');
  const [MAX_, setMax] = useState('');
  const [DOTS, setDots] = useState([]);
  const [ready, setReady] = useState(false);

  const screenWidth = Dimensions.get('window').width - 22 - 20;
  // let mins = [90, 90, 80, 10, 75, 95, 80, 10, 90, 50];
  // let maxs = [200, 150, 130, 210, 180, 160, 130, 210, 145, 180];
  // let dots = [
  //   {
  //     value: 150,
  //     min: 90,
  //     max: 200,
  //   },
  //   {
  //     value: '',
  //     min: 90,
  //     max: 150,
  //   },
  //   {
  //     value: '',
  //     min: 80,
  //     max: 130,
  //   },
  //   {
  //     value: 120,
  //     min: 10,
  //     max: 210,
  //   },
  //   {
  //     value: '',
  //     min: 75,
  //     max: 180,
  //   },
  //   {
  //     value: 145,
  //     min: 95,
  //     max: 160,
  //   },
  //   {
  //     value: 168,
  //     min: 80,
  //     max: 130,
  //   },
  //   {
  //     value: '',
  //     min: 10,
  //     max: 210,
  //   },
  //   {
  //     value: 130,
  //     min: 90,
  //     max: 145,
  //   },
  //   {
  //     value: 160,
  //     min: 50,
  //     max: 180,
  //   },
  // ];
  // let data = [
  //   {
  //     date: '05.2018',
  //     value: 150,
  //   },
  //   {
  //     date: '06.2018',
  //     value: '',
  //   },
  //   {
  //     date: '07.2018',
  //     value: '',
  //   },
  //   {
  //     date: '08.2018',
  //     value: 120,
  //   },
  //   {
  //     date: '09.2018',
  //     value: '',
  //   },
  //   {
  //     date: '10.2018',
  //     value: 145,
  //   },
  //   {
  //     date: '11.2018',
  //     value: 168,
  //   },
  //   {
  //     date: '12.2018',
  //     value: '',
  //   },
  //   {
  //     date: '01.2019',
  //     value: 130,
  //   },
  //   {
  //     date: '02.2019',
  //     value: 160,
  //   },
  //   {
  //     date: '02.2019',
  //     value: 160,
  //   },
  // ];

  const formatDate = date => {
    let arr = date.split('.');
    let year = arr[1]
      .split('')
      .slice(2)
      .join('');
    arr.pop();
    arr.push(year);

    return arr.join('.');
  };

  let firstEnter = true;
  useEffect(() => {
    let newData = JSON.parse(JSON.stringify(data));
    let newDots = JSON.parse(JSON.stringify(dots));
    let newMins = JSON.parse(JSON.stringify(mins));
    let newMaxs = JSON.parse(JSON.stringify(maxs));

    if (data.length === 0) {
      return null;
    }
    if (dots) {
      newDots = newDots.filter(
        v => !isNaN(v.value) && !isNaN(v.min) && !isNaN(v.max),
      );
    }
    if (data) {
      newData = newData.filter(v => !isNaN(v.value));
    }
    if (mins) {
      newMins = newMins.filter(v => !isNaN(v));
    }
    if (maxs) {
      newMaxs = newMaxs.filter(v => !isNaN(v));
    }

    let total = 0;
    let status = null;

    if (newData.length === 1) {
      const value = newData[0].value;
      status = 'single';
      if (value !== 0) {
        newData.push({
          date: '',
          value: +(value * 0.5),
        });
        newData.unshift({
          date: '',
          value: +(value * 1.5),
        });
        const dotMax = newDots[0].max;
        const dotMin = newDots[0].min;
        const dotValue = newDots[0].value;
        const minsValue = newMins[0];
        const maxsValue = newMaxs[0];
        newDots.push({
          value: +(dotValue * 0.5),
          min: dotMin,
          max: dotMax,
        });
        newDots.unshift({
          value: +(dotValue * 1.5),
          min: dotMin,
          max: dotMax,
        });
        newMins.push(minsValue);
        newMins.push(minsValue);
        newMaxs.push(maxsValue);
        newMaxs.push(maxsValue);
      } else {
        newData.push({
          date: '',
          value: +(value + 5),
        });
        newData.unshift({
          date: '',
          value: +(value - 5),
        });
      }
    }

    let clean_data = newData.map((item, index) => {
      if (typeof item.value === 'number') {
        total += item.value;
        return item.value;
      } else {
        return getNum(newData, index);
      }
    });
    let clean_dots = newDots.map((item, index) => {
      if (item.value !== '') {
        return item;
      } else {
        return { ...item, value: getNum(newDots, index) };
      }
    });
    if (total === 0) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <H2
            style={{
              color: DARK_BLUE,
              fontSize: PX14,
              width: '100%',
              textAlign: 'center',
            }}>
            Данные отстутствуют
          </H2>
        </View>
      );
    }

    const CHART_WIDTH =
      realNumberOfPoints < 5 ? screenWidth : PX40 * clean_data.length;

    let min = Math.min(...newMins);
    let max = Math.max(...newMaxs);
    let dataMin = Math.min(...clean_data);
    let dataMax = Math.max(...clean_data);
    if (dataMin < min) {
      min = +(dataMin - dataMin * 0.15);
    }
    if (dataMax > max) {
      max = +(dataMax + dataMax * 0.15);
    }

    setClean(clean_data);
    setStatus(status);
    setWidth(CHART_WIDTH);
    setMin(min);
    setMax(max);
    setDots(clean_dots);
  }, []);

  useEffect(() => {
    if (
      CLEAN_DATA.length > 0 &&
      MIN_ !== '' &&
      MAX_ !== '' &&
      DOTS.length > 0 &&
      CHART_W !== ''
    ) {
      setTimeout(() => {
        setReady(true);
      }, 300);
    }
  }, [CLEAN_DATA, STATUS, CHART_W, MIN_, MAX_, DOTS]);

  if (!ready) {
    return <ActivityIndicator size="large" color={PRIMARY_COLOR} />;
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      <YAxis
        data={[MIN_, ...CLEAN_DATA, MAX_]}
        contentInset={{ top: PX20, bottom: PX36 }}
        svg={{
          fill: DARK_BLUE,
          fontSize: PX12,
          ...MEDIUM_FONT,
        }}
        numberOfTicks={7}
        formatLabel={value => value}
        style={{ paddingRight: PX10 }}
      />
      <ScrollView
        horizontal={true}
        ref={ref => {
          setTimeout(() => {
            if (firstEnter) {
              ref.scrollToEnd({
                animated: false,
              });
              firstEnter = false;
            }
          }, 10);
        }}
        style={{ width: screenWidth }}>
        <View
          style={{
            width: CHART_W,
            flexDirection: 'column',
          }}>
          <View
            style={{
              height: PX200,
              flexDirection: 'row',
              flex: 1,
            }}>
            <LineChart
              curve={shape.curveNatural}
              style={[
                styles.chart,
                {
                  width: CHART_W,
                  minWidth: '100%',
                  backgroundColor: WHITE,
                },
              ]}
              data={CLEAN_DATA}
              numberOfTicks={7}
              animate={true}
              animationDuration={500}
              yMin={MIN_}
              yMax={MAX_}
              contentInset={{
                top: PX30,
                bottom: PX20,
                left: PX30,
                right: PX30,
              }}
              svg={{
                strokeWidth: STATUS === 'single' ? 0 : 3,
                stroke: 'url(#gradient)',
              }}>
              <Grid />
              <Decorator dots={DOTS} status={STATUS} />
              <Gradient dots={DOTS} />
              <Tooltip dots={DOTS} status={STATUS} max={MAX_} />
            </LineChart>
          </View>
          <XAxis
            data={data}
            contentInset={{
              left: STATUS === 'single' ? PX175 : PX34,
              right: PX34,
            }}
            svg={{
              fill: DARK_BLUE,
              fontSize: PX12,
              rotation: '50',
              y: '15',
              x: '55',
              ...MEDIUM_FONT,
            }}
            style={{ paddingBottom: PX6, height: 40, paddingLeft: 20 }}
            xAccessor={({ index }) => index}
            numberOfTicks={data.length}
            formatLabel={index =>
              Number.isInteger(index) &&
              data[index] &&
              data[index].date &&
              data[index].visible === true
                ? formatDate(data[index].date)
                : null
            }
          />
        </View>
        <View
          style={{
            height: PX200,
            flexDirection: 'row',
            position: 'absolute',
            top: 0,
            left: 0,
          }}>
          {mins && mins.every(item => typeof item === 'number') && (
            <LineChart
              curve={shape.curveNatural}
              style={{ width: CHART_W, minWidth: '100%' }}
              data={mins}
              numberOfTicks={7}
              animate={true}
              animationDuration={500}
              yMin={MIN_}
              yMax={MAX_}
              contentInset={{
                top: PX30,
                bottom: PX20,
                left: PX30,
                right: PX30,
              }}
              svg={{
                strokeWidth: 1,
                stroke: DARK_BLUE,
              }}
            />
          )}
        </View>
        <View
          style={{
            height: PX200,
            flexDirection: 'row',
            position: 'absolute',
            top: 0,
            left: 0,
          }}>
          {maxs && maxs.every(item => typeof item === 'number') && (
            <LineChart
              curve={shape.curveNatural}
              style={{ width: CHART_W, minWidth: '100%' }}
              data={maxs}
              numberOfTicks={7}
              animate={true}
              animationDuration={500}
              yMin={MIN_}
              yMax={MAX_}
              contentInset={{
                top: PX30,
                bottom: PX20,
                left: PX30,
                right: PX30,
              }}
              svg={{
                strokeWidth: 1,
                stroke: DARK_BLUE,
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const Gradient = ({ dots }) => {
  const isNorm = ({ value, max, min }) => {
    if (!min) {
      if (value > max) {
        return false;
      } else {
        return true;
      }
    } else if (!max) {
      if (value < min) {
        return false;
      } else {
        return true;
      }
    } else {
      if (value >= min && value <= max) {
        return true;
      } else {
        return false;
      }
    }
  };
  const k = 100 / dots.length;
  let stops = [];
  dots.map((item, i) => {
    if (isNorm({ ...item })) {
      stops.push(
        <Stop
          key={Math.random()}
          offset={`${+(k * i + 5)}%`}
          stopColor={GREEN}
        />,
      );
    } else {
      stops.push(
        <Stop
          key={Math.random()}
          offset={`${+(k * i + 5)}%`}
          stopColor={PINK}
        />,
      );
    }
  });
  return (
    <Defs key={'gradient'}>
      <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
        {stops}
      </LinearGradient>
    </Defs>
  );
};

const Decorator = ({ x, y, dots, status }) => {
  if (!dots) {
    return;
  }
  return dots.map((item, index) => {
    if (status === 'single') {
      if (index === 0 || index === 2) {
        return null;
      }
    }
    let color;

    if (!item.visible) {
      return null;
    }

    if (!item.min) {
      if (item.value > item.max) {
        color = PINK;
      } else {
        color = GREEN;
      }
    } else if (!item.max) {
      if (item.value < item.min) {
        color = PINK;
      } else {
        color = GREEN;
      }
    } else {
      if (item.value >= item.min && item.value <= item.max) {
        color = GREEN;
      } else {
        color = PINK;
      }
    }

    return (
      <Circle
        key={index}
        cx={x(index)}
        cy={y(item.value)}
        r={4}
        stroke={color}
        fill={color}
      />
    );
  });
};

const Tooltip = ({ x, y, dots, status, max }) => {
  return dots.map((item, index) => {
    if (status === 'single') {
      if (index === 0 || index === 2) {
        return null;
      }
    }
    let strokeRect;
    let strokeText;
    let fill;

    if (!item.visible) {
      return null;
    }

    if (!item.min) {
      if (item.value <= item.max) {
        strokeRect = AERO_BLUE;
        strokeText = GREEN;
        fill = AERO_BLUE;
      } else {
        strokeRect = LAVENDER_BLUSH;
        strokeText = PINK;
        fill = LAVENDER_BLUSH;
      }
    } else if (!item.max) {
      if (item.value >= item.min) {
        strokeRect = AERO_BLUE;
        strokeText = GREEN;
        fill = AERO_BLUE;
      } else {
        strokeRect = LAVENDER_BLUSH;
        strokeText = PINK;
        fill = LAVENDER_BLUSH;
      }
    } else {
      if (item.value >= item.min && item.value <= item.max) {
        strokeRect = AERO_BLUE;
        strokeText = GREEN;
        fill = AERO_BLUE;
      } else {
        strokeRect = LAVENDER_BLUSH;
        strokeText = PINK;
        fill = LAVENDER_BLUSH;
      }
    }

    return (
      <G
        key={index}
        x={x(index) - PX43 / 2}
        onPress={() => console.log('tooltip clicked')}>
        <G y={max === item.value ? y(item.value) + PX18 : y(item.value) - PX37}>
          <Rect
            height={PX25}
            width={PX40}
            stroke={strokeRect}
            fill={fill}
            ry={15}
            rx={15}
          />
          <Text
            x={PX20}
            y={PX13}
            alignmentBaseline={'middle'}
            textAnchor={'middle'}
            stroke={strokeText}>
            {item.value}
          </Text>
        </G>
      </G>
    );
  });
};

const styles = StyleSheet.create({
  chart: {
    flex: 1,
    // backgroundColor: WHITE,
    borderRadius: PX6,
    marginBottom: PX10,
  },
});
