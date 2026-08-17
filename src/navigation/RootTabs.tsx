import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {RootTabParamList} from './types';
import DailyPlanScreen from '../features/plan/screens/DailyPlanScreen';
import TimeReviewScreen from '../features/review/screens/TimeReviewScreen';
import AccountingApp from '../features/accounting/AccountingApp';

const Tab = createBottomTabNavigator<RootTabParamList>();

/** Tab 激活色（沿用记账模块主题色） */
const ACTIVE_COLOR = '#FF7A30';
/** Tab 未激活色 */
const INACTIVE_COLOR = '#9C8674';

interface TabIconProps {
  /** 图标描边/填充颜色，由导航根据激活态传入 */
  color: string;
  /** 图标尺寸 */
  size: number;
}

/** 计划 Tab 图标：日历 */
function PlanIcon({color, size}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M3 10h18M8 3v4M16 3v4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9 15l2 2 4-4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 记录 Tab 图标：时钟 */
function RecordIcon({color, size}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 7.5V12l3 2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 账单 Tab 图标：账本 */
function BillIcon({color, size}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3h12a1 1 0 011 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 011-1z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M9 8h6M9 12h6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 根底部 Tab 导航：计划 - 记录 - 账单 */
export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}>
      <Tab.Screen
        name="Plan"
        component={DailyPlanScreen}
        options={{
          title: '计划',
          tabBarIcon: ({color, size}) => <PlanIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Record"
        component={TimeReviewScreen}
        options={{
          title: '记录',
          tabBarIcon: ({color, size}) => (
            <RecordIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Bill"
        component={AccountingApp}
        options={{
          title: '账单',
          tabBarIcon: ({color, size}) => <BillIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
