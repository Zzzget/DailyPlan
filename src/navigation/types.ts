import {NavigatorScreenParams} from '@react-navigation/native';
import {AccountingStackParamList} from '../features/accounting/navigation/types';

/** 底部 Tab 导航参数表 */
export type RootTabParamList = {
  /** 计划 Tab：每日计划页 */
  Plan: undefined;
  /** 记录 Tab：时间回顾页 */
  Record: undefined;
  /** 账单 Tab：内嵌记账模块的栈导航 */
  Bill: NavigatorScreenParams<AccountingStackParamList>;
  /** 我的 Tab：个人中心页 */
  Profile: undefined;
};
