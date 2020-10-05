import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {
  SEMIBOLD_FONT,
  PRIMARY_COLOR,
  PX4,
  GRAY,
  PX12,
  PX6,
  WHITE,
  PX15,
  PX7,
  PX24,
  PX16,
  DARK_BLUE,
  BOLD_FONT,
  PX70,
  PX5,
  PX10,
  PX3,
  GREEN,
  LIGHT_BLUE,
  PX26,
  PX28,
  PX36,
  PX73,
  PX20,
  IS_IOS,
  PX17,
  GRADIENT_TOP,
  MEDIUM_FONT,
  NOTIFICATION_ICON,
  PX60,
} from '../../constants';
import IconMoon from '../../utils/CustomIcon';
import { Actions } from 'react-native-router-flux';
import { CircleChart } from './Charts';
import { INTERVENTIONS_PAGE } from '../../navigator/pagesConstants';
import LinearGradient from 'react-native-linear-gradient';

const ExpandableItem = ({ item }) => {
  const [open, toggle] = useState(false);
  if (open) {
    return <Expanded {...item} toggle={toggle} open={open} />;
  } else {
    return <Collapsed {...item} toggle={toggle} open={open} />;
  }
};

const Collapsed = ({
  icon,
  title,
  percent,
  chartItems,
  screen,
  toggle,
  name,
  open,
  tab,
}) => {
  const {
    container,
    actionZone,
    leftContainer,
    rightContainer,
    value,
    titleStyle,
    chevron,
    chevronIcon,
    paramsWrap,
    dataWrap,
    w100,
  } = styles;
  const isInterventions = name === 'interventions';
  const itemsCount = isInterventions ? 1 : 2;
  return (
    <View style={container}>
      <TouchableOpacity
        onPress={() =>
          Actions.push(screen, {
            activeTab: tab,
          })
        }
        style={actionZone}>
        <View style={leftContainer}>
          <IconMoon name={icon} size={PX36} color={PRIMARY_COLOR} />
        </View>
        <View style={rightContainer}>
          <View style={w100}>
            <View style={dataWrap}>
              <Text style={value}>{percent}</Text>
              <Text style={titleStyle}>{title || ''}</Text>
            </View>
            <View style={paramsWrap}>
              {chartItems &&
                chartItems.map((item, i) => {
                  if (i < itemsCount) {
                    return (
                      <ChartItem
                        key={i}
                        type={item.color}
                        value={item.percent}
                        label={item.label}
                      />
                    );
                  }
                })}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggle(!open)} style={chevron}>
        <IconMoon
          name={'right-chevron'}
          size={PX15}
          color={LIGHT_BLUE}
          style={chevronIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const Expanded = ({
  icon,
  title,
  percent,
  chartItems,
  screen,
  toggle,
  name,
  open,
}) => {
  const {
    container,
    leftExpanded,
    rightExpanded,
    chevronIconExp,
    titleStyle,
    fd_row,
    mr0,
    paramsWrapExp,
    percentExp,
    rightContainerExpanded,
    gradientButton,
    gradientButtonText,
    gradientButtonNumber,
  } = styles;
  const isInterventions = name === 'interventions';
  return (
    <View style={container}>
      <TouchableOpacity
        onPress={() => Actions.push(screen)}
        style={leftExpanded}>
        <View style={fd_row}>
          <IconMoon name={icon} size={PX36} color={PRIMARY_COLOR} />
          <Text style={percentExp}>{percent}</Text>
        </View>
        <Text style={titleStyle}>{title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={rightExpanded} onPress={() => toggle(!open)}>
        <View style={rightContainerExpanded}>
          {!isInterventions ? (
            <>
              <CircleChart
                data={chartItems}
                style={{ height: PX73, marginBottom: PX10 }}
              />
              <View style={paramsWrapExp}>
                {chartItems &&
                  chartItems.map((item, i) => {
                    return (
                      <ChartItem
                        key={i + 'params'}
                        type={item.color}
                        value={item.percent}
                        label={item.label}
                        style={mr0}
                      />
                    );
                  })}
              </View>
            </>
          ) : (
            <View style={[rightExpanded, { alignItems: 'flex-start' }]}>
              {chartItems &&
                chartItems.map((item, i) => {
                  return (
                    <TouchableOpacity
                      style={{ width: '120%' }}
                      onPress={() =>
                        Actions.push(INTERVENTIONS_PAGE, {
                          activeTab: item.type,
                        })
                      }>
                      <LinearGradient
                        style={[
                          gradientButton,
                          i === chartItems.length - 1 && { marginBottom: 0 },
                        ]}
                        colors={[NOTIFICATION_ICON, GRADIENT_TOP]}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={[gradientButtonText, gradientButtonNumber]}>
                            {item.percent}
                          </Text>
                          <Text style={gradientButtonText}>{item.label}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </View>
        <IconMoon
          name={'right-chevron'}
          size={PX15}
          color={PRIMARY_COLOR}
          style={chevronIconExp}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChartItem = ({ type, value, label, style }) => {
  return (
    <View style={[styles.param, { ...style }]}>
      <Text style={[styles.paramValue, { color: type }]}>{value}</Text>
      <View
        style={[
          styles.paramDivider,
          { backgroundColor: type },
          IS_IOS ? { marginTop: -PX3 } : null,
        ]}
      />
      <Text style={styles.paramName}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: PX12,
    minHeight: PX70,
  },
  actionZone: {
    width: '85%',
    flexDirection: 'row',
  },
  chevron: {
    width: '15%',
    backgroundColor: WHITE,
    borderBottomRightRadius: PX6,
    borderTopRightRadius: PX6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftExpanded: {
    paddingVertical: PX20,
    width: '31%',
    backgroundColor: GRAY,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: PX6,
    borderTopLeftRadius: PX6,
  },
  rightExpanded: {
    width: '69%',
    backgroundColor: WHITE,
    borderBottomRightRadius: PX6,
    borderTopRightRadius: PX6,
    paddingTop: PX15,
    paddingBottom: PX12,
    paddingHorizontal: PX6,
    alignItems: 'center',
    flexDirection: 'column',
  },
  chevronIconExp: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    top: PX28,
    right: PX26,
  },
  leftContainer: {
    width: '25%',
    backgroundColor: GRAY,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: PX6,
    borderTopLeftRadius: PX6,
  },
  rightContainer: {
    width: '75%',
    backgroundColor: WHITE,
    alignItems: 'center',
    paddingHorizontal: PX15,
    flexDirection: 'row',
  },
  dataWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chart: {
    backgroundColor: LIGHT_BLUE,
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: PX10,
    marginBottom: PX15,
  },
  titleStyle: {
    ...SEMIBOLD_FONT,
    fontSize: PX16,
    color: DARK_BLUE,
    textAlignVertical: 'bottom',
    paddingBottom: PX3,
    paddingLeft: PX5,
  },
  value: {
    ...SEMIBOLD_FONT,
    fontSize: PX24,
    color: DARK_BLUE,
    width: PX60,
  },
  percentExp: {
    ...SEMIBOLD_FONT,
    fontSize: PX24,
    color: DARK_BLUE,
    textAlignVertical: 'center',
    paddingLeft: PX10,
    paddingTop: PX10,
  },
  chevronIcon: {
    transform: [{ rotate: '90deg' }],
  },
  paramsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  paramsWrapExp: {
    width: '100%',
    paddingLeft: PX10,
  },
  param: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: PX16,
    lineHeight: PX24,
    paddingVertical: PX3,
  },
  paramValue: {
    color: GREEN,
    ...BOLD_FONT,
    fontSize: PX12,
  },
  paramName: {
    color: PRIMARY_COLOR,
    ...BOLD_FONT,
    fontSize: PX12,
  },
  paramDivider: {
    width: PX7,
    height: PX7,
    backgroundColor: GREEN,
    borderRadius: PX4,
    marginHorizontal: PX6,
  },
  w100: {
    width: '100%',
  },
  fd_row: {
    flexDirection: 'row',
    marginBottom: PX10,
    justifyContent: 'center',
  },
  mr0: {
    width: '100%',
    marginRight: 0,
  },
  rightContainerExpanded: {
    width: '100%',
  },
  gradientButton: {
    width: '110%',
    paddingVertical: PX7,
    paddingHorizontal: PX10,
    marginBottom: PX10,
    borderRadius: PX4,
  },
  gradientButtonText: {
    ...MEDIUM_FONT,
    color: WHITE,
    fontSize: PX17,
  },
  gradientButtonNumber: {
    minWidth: PX28,
    fontSize: PX20,
  },
});

export default ExpandableItem;
