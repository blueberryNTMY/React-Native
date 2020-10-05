import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { Router, Scene, Stack, Actions, Modal } from 'react-native-router-flux';
import SignIn from '../screens/auth/SignIn';
import { IS_IOS, roles } from '../constants';
import SignUp from '../screens/auth/SignUp';
import MainContainer from '../screens-containers/MainContainer';
import { connect } from 'react-redux';
import { setHeaders } from '../utils/setHeaders';
import WelcomeContainer from '../screens-containers/WelcomeContainer';
import { FullPageSpinner } from '../components/common/FullPageSpinner';
import Tech from '../screens/Tech';
import ForgotPassword from '../screens/auth/ForgotPassword';
import PinCodeContainer from '../screens-containers/PinCodeContainer';
import BiomarkersContainer from '../screens-containers/biomarkers/BiomarkersContainer';
import BiomarkersListContainer from '../screens-containers/biomarkers/BiomarkersListContainer';
import BiomarkerInfoContainer from '../screens-containers/biomarkers/BiomarkerInfoContainer';
import DieteContainer from '../screens-containers/DietContainer';
import HealthScheduleContainer from '../screens-containers/HealthScheduleContainer';
import InterventionsContainer from '../screens-containers/interventions/InterventionsContainer';
import RiskPanelContainer from '../screens-containers/RiskPanel/RiskPanelContainer';
import SystemsContainer from '../screens-containers/SystemsContainer';
import DefaultContainer from '../screens-containers/DefaultContainer';
import QuestionContainer from '../screens-containers/question/QuestionContainer';
import QuestionnaireContainer from '../screens-containers/question/QuestionnaireContainer';
import SettingsContainer from '../screens-containers/SettingsContainer';
import NotificationsContainer from '../screens-containers/NotificationsContainer';
import FilesContainer from '../screens-containers/files/FilesContainer';
import FilesListContainer from '../screens-containers/files/FilesListContainer';
import CheckUpContainer from '../screens-containers/checkup/CheckUpContainer';
import CheckUpCardContainer from '../screens-containers/checkup/CheckUpCardContainer';
import CheckUpScheduleContainer from '../screens-containers/checkup/CheckUpScheduleContainer';
import PatientsContainer from '../screens-containers/PatientsContainer';
import PaymentContainer from '../screens-containers/PaymentContainer';
import FileEditContainer from '../screens-containers/files/FileEditContainer';
import ChatContainer from '../screens-containers/ChatContainer';
import { getUniqueId } from 'react-native-device-info';

import { hasUserSetPinCode } from '@haskkor/react-native-pincode';
import {
  PIN_CODE_PAGE,
  RESET_PASSWORD_PAGE,
  SET_PIN_CODE_PAGE,
  SIGN_IN_PAGE,
  SIGN_UP_PAGE,
  TECH_PAGE,
  WELCOME_PAGE,
  MAIN_PAGE,
  BIOMARKERS_PAGE,
  DIETE_PAGE,
  HEALTH_SCHEDULE_PAGE,
  INTERVENTIONS_PAGE,
  RISK_PANEL_PAGE,
  SYSTEMS_PAGE,
  DEFAULT_PAGE,
  SETTINGS_PAGE,
  NOTIFICATIONS_PAGE,
  FILES_PAGE,
  FILES_LIST_PAGE,
  CHECKUP_PAGE,
  QUESTION_PAGE,
  QUESTIONNAIRE_PAGE,
  CHECKUP_CARD_PAGE,
  RISK_PANEL_INFO,
  BIOMARKERS_LIST_PAGE,
  INTERVENTIONS_INFO,
  BIOMARKER_INFO,
  PATIENTS_PAGE,
  CHECKUP_SCHEDULE_PAGE,
  PAYMENT_PAGE,
  CALENDAR_PAGE,
  CALENDAR_INFO_PAGE,
  FILE_EDIT_PAGE,
  CHAT_PAGE,
  REPORT_PAGE
} from './pagesConstants';
import { setCurrentScene } from '../reduxStore/actions/layout';

import TopMenu from './TopMenu';
import { showWelcomeAction } from '../reduxStore/actions/Welcome';
import {
  showSetPinAction,
  hideEnterPinAction
} from '../reduxStore/actions/Pin';
import BottomMenu from '../navigator/BottomMenu';
import RiskPanelInfoContainer from '../screens-containers/RiskPanel/RiskPanelInfoContainer';
import InterventionsInfoContainer from '../screens-containers/interventions/InterventionsInfoContainer';
import CalendarContainer from '../screens-containers/Calendar/CalendarContainer';
import CalendarInfoContainer from '../screens-containers/Calendar/CalendarInfoContainer';
import ReportContainer from '../screens-containers/report/ReportContainer';
import {
  finishTransactionIOS,
  purchaseErrorListener,
  purchaseUpdatedListener,
  consumePurchaseAndroid,
  acknowledgePurchaseAndroid,
  finishTransaction,
  getPurchaseHistory,
  initConnection,
  processNewPurchase,
  getAvailablePurchases,
  validateReceiptIos,
  type ProductPurchase,
  type SubscriptionPurchase,
  type InAppPurchase,
  type PurchaseError
} from 'react-native-iap';
import { checkSubscriptionStatusAction } from '../reduxStore/actions/auth';
import { getInfoAction, cleanInfo } from '../reduxStore/actions/info';
import { sendSubscription } from '../reduxStore/api/auth';
import { isEmulator } from 'react-native-device-info';
import AppMetrica from 'react-native-appmetrica';
import { serverCheckMiddlewareAction } from '../reduxStore/actions/serverCheckMiddleware';
import { checkNetworkConnectionAction } from '../reduxStore/actions/checkNetworkConnection';
import { StubPage } from '../components/common/StubPage';
import { showMessageAction } from '../reduxStore/actions/Message';
import { StackViewStyleInterpolator } from 'react-navigation-stack';

export class RootNavigator extends Component {
  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;
  state = {
    userSetPinCode: false,
    loading: false,
    receipt: null,
    receipts: null
  };

  async sendPayment() {
    if (this.state.receipt) {
      sendSubscription({
        date: this.state.receipt.transactionDate / 1000,
        device_id: getUniqueId(),
        transactionReceipt: this.state.receipt.transactionReceipt
      }).then(res => {
        this.props.checkSubscriptionStatusAction();
      });
    }
  }

  async checkSubscription() {
    try {
      const purchases = await getAvailablePurchases();
      if (purchases) {
        // const sortedAvailablePurchases = purchases.sort(
        //   (a, b) => b.transactionDate - a.transactionDate
        // );
        // console.log(purchases);
        // const latestAvailableReceipt = sortedAvailablePurchases[0];
        // console.log(sortedAvailablePurchases);
        // console.log(latestAvailableReceipt);
        //
        // const receiptBody = {
        //   'receipt-data': latestAvailableReceipt.transactionReceipt,
        //   password: '42351463b25544448a7e209eb3eef396',
        // };
        // const result = await validateReceiptIos(receiptBody, true);
        // console.log(result);

        this.setState(
          {
            receipt: purchases[0],
            receipts: purchases
          },
          () => {
            if (this.props.auth.auth_key) {
              this.sendPayment();
            }
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  displayFlashMessage() {
    this.props.showMessageAction({
      type: 'danger', // 'danger'
      message: 'Отсутствует подключение к Интернету',
      icon: 'danger',
      duration: 100000
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.auth_key !== prevProps.auth.auth_key) {
      isEmulator().then(isEmulator => {
        if (!isEmulator) {
          this.checkSubscription();
        }
      });
    }
  }

  componentDidMount() {
    this.props.serverCheckMiddlewareAction();
    this.props.checkNetworkConnectionAction();

    if (!this.props.isNetworkConnection) {
      this.displayFlashMessage();
    }

    initConnection()
      .then(res => {
        console.log('result', res);
      })
      .catch(err => {
        console.warn(err.code, err.message);
      });

    isEmulator().then(isEmulator => {
      if (!isEmulator) {
        this.checkSubscription();
      }
    });

    hasUserSetPinCode().then(res => {
      this.setState(
        {
          userSetPinCode: res
        },
        () => {
          if (this.props.auth.auth_key) {
            this.setState({
              loginIn: true,
              loading: true
            });
          } else {
            this.setState({
              loading: true
            });
          }
        }
      );
    });
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (
        purchase: InAppPurchase | SubscriptionPurchase | ProductPurchase
      ) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          if (IS_IOS) {
            await finishTransactionIOS(purchase.transactionId);
          } else if (Platform.OS === 'android') {
            // If consumable (can be purchased again)
            await consumePurchaseAndroid(purchase.purchaseToken);
            // If not consumable
            await acknowledgePurchaseAndroid(purchase.purchaseToken);
          }

          // From react-native-iap@4.1.0 you can simplify above `method`. Try to wrap the statement with `try` and `catch` to also grab the `error` message.
          await finishTransaction(purchase);
          await processNewPurchase(purchase);
        }
      }
    );

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log(error.message);
      }
    );

    AppMetrica.activate({
      apiKey: '551e71e4-ab43-40c0-bf25-07fe03ebad84',
      sessionTimeout: 120,
      firstActivationAsUpdate: true
    });
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  onEnterHandle = () => {
    this.props.serverCheckMiddlewareAction();

    if (!this.props.isNetworkConnection) {
      this.displayFlashMessage();
    }

    if (!this.props.serverStatus) {
      Actions.replace('stub');
    }
    // Устанавливаем авторизацию в Headers
    if (this.props.auth.auth_key) {
      setHeaders(this.props.auth.auth_key);
      // Проверяем статус подписки
      this.props.checkSubscriptionStatusAction();
    }
    this.props.setCurrentScene(Actions.currentScene);
    this.props.cleanInfo().then(() => {
      if (
        Actions.currentScene !== INTERVENTIONS_PAGE &&
        Actions.currentScene !== SIGN_IN_PAGE &&
        Actions.currentScene !== PIN_CODE_PAGE &&
        Actions.currentScene !== RESET_PASSWORD_PAGE &&
        Actions.currentScene !== SIGN_UP_PAGE &&
        Actions.currentScene !== WELCOME_PAGE
      ) {
        // this.props.getInfoAction(Actions.currentScene);
      }
    });
    Actions.refresh();
  };

  getInitialPage() {
    const { userSetPinCode } = this.state;
    const { showSetPin } = this.props.pin;
    const { showWelcome, auth, serverStatus } = this.props;
    const isLoginIn = auth.auth_key ? auth.auth_key : false;
    // return CHECKUP_PAGE;
    if (!serverStatus) {
      return 'stub';
    } else if (showWelcome) {
      return WELCOME_PAGE;
    } else if (!isLoginIn) {
      return SIGN_IN_PAGE;
    } else if (isLoginIn && showSetPin) {
      return SET_PIN_CODE_PAGE;
    } else if (isLoginIn && userSetPinCode) {
      return PIN_CODE_PAGE;
    } else {
      return this.props.auth.type === roles.TYPE_DOCTOR ||
        this.props.auth.type === roles.TYPE_HEAD_DOCTOR
        ? PATIENTS_PAGE
        : MAIN_PAGE;
    }
  }

  render() {
    const scenesWithoutAnimation = [
      SIGN_IN_PAGE,
      SIGN_UP_PAGE,
      MAIN_PAGE,
      CHAT_PAGE,
      SETTINGS_PAGE,
      FILES_PAGE,
      DIETE_PAGE,
      INTERVENTIONS_PAGE,
      RISK_PANEL_PAGE,
      REPORT_PAGE,
      PATIENTS_PAGE
    ];
    const transitionConfig = props => {
      if (scenesWithoutAnimation.includes(props.scene.route.routeName)) {
        return {
          screenInterpolator: StackViewStyleInterpolator.forNoAnimation
        };
      } else {
        return {};
      }
    };

    if (!this.state.loading) {
      return null;
    } else {
      const initialPage = this.getInitialPage();
      return (
        <View flex={1}>
          <Router>
            <Modal key="modal" hideNavBar>
              <Stack key="root" transitionConfig={transitionConfig}>
                {/* Auth */}
                <Scene
                  key={SIGN_IN_PAGE}
                  component={SignIn}
                  hideNavBar={true}
                  initial={initialPage === SIGN_IN_PAGE}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={SIGN_UP_PAGE}
                  component={SignUp}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={RESET_PASSWORD_PAGE}
                  component={ForgotPassword}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={PIN_CODE_PAGE}
                  component={PinCodeContainer}
                  hideNavBar={true}
                  initial={initialPage === PIN_CODE_PAGE}
                  screenProps={{ enterPin: true }}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={SET_PIN_CODE_PAGE}
                  component={PinCodeContainer}
                  hideNavBar={true}
                  initial={initialPage === SET_PIN_CODE_PAGE}
                  screenProps={{ enterPin: false }}
                  onEnter={this.onEnterHandle}
                />
                {/* End auth */}

                {/* Bottom menu */}
                <Scene
                  key={MAIN_PAGE}
                  hideNavBar={true}
                  title={''}
                  initial={initialPage === MAIN_PAGE}
                  component={MainContainer}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={CHAT_PAGE}
                  component={ChatContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={SETTINGS_PAGE}
                  component={SettingsContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                {/* End bottom menu */}

                <Scene
                  key={TECH_PAGE}
                  component={Tech}
                  hideNavBar={true}
                  initial={initialPage === TECH_PAGE}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={WELCOME_PAGE}
                  component={WelcomeContainer}
                  hideNavBar={true}
                  initial={initialPage === WELCOME_PAGE}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={DEFAULT_PAGE}
                  title={'Default'}
                  hideNavBar={true}
                  component={DefaultContainer}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={QUESTION_PAGE}
                  title={'Опросы'}
                  hideNavBar={true}
                  initial={initialPage === QUESTION_PAGE}
                  component={QuestionContainer}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={QUESTIONNAIRE_PAGE}
                  title={'Опросы'}
                  hideNavBar={true}
                  initial={initialPage === QUESTIONNAIRE_PAGE}
                  component={QuestionnaireContainer}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={DIETE_PAGE}
                  component={DieteContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={BIOMARKERS_PAGE}
                  component={BiomarkersContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === BIOMARKERS_PAGE}
                />
                <Scene
                  key={BIOMARKERS_LIST_PAGE}
                  component={BiomarkersListContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={BIOMARKER_INFO}
                  component={BiomarkerInfoContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={HEALTH_SCHEDULE_PAGE}
                  component={HealthScheduleContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={INTERVENTIONS_PAGE}
                  component={InterventionsContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === INTERVENTIONS_PAGE}
                />

                <Scene
                  key={INTERVENTIONS_INFO}
                  component={InterventionsInfoContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === INTERVENTIONS_INFO}
                />

                <Scene
                  key={RISK_PANEL_INFO}
                  component={RiskPanelInfoContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === RISK_PANEL_INFO}
                />

                <Scene
                  key={RISK_PANEL_PAGE}
                  component={RiskPanelContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === RISK_PANEL_PAGE}
                />

                <Scene
                  key={SYSTEMS_PAGE}
                  component={SystemsContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={NOTIFICATIONS_PAGE}
                  component={NotificationsContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={FILES_PAGE}
                  component={FilesContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={FILE_EDIT_PAGE}
                  component={FileEditContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={FILES_LIST_PAGE}
                  component={FilesListContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={CHECKUP_PAGE}
                  component={CheckUpContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === CHECKUP_PAGE}
                />

                <Scene
                  key={CHECKUP_CARD_PAGE}
                  component={CheckUpCardContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={CHECKUP_SCHEDULE_PAGE}
                  component={CheckUpScheduleContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />

                <Scene
                  key={PAYMENT_PAGE}
                  component={PaymentContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === PAYMENT_PAGE}
                />

                <Scene
                  key={PATIENTS_PAGE}
                  component={PatientsContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === PATIENTS_PAGE}
                />
                <Scene
                  key={CALENDAR_PAGE}
                  component={CalendarContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === CALENDAR_PAGE}
                />
                <Scene
                  key={CALENDAR_INFO_PAGE}
                  component={CalendarInfoContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                  initial={initialPage === CALENDAR_INFO_PAGE}
                />

                <Scene
                  key={REPORT_PAGE}
                  component={ReportContainer}
                  hideNavBar={true}
                  onEnter={this.onEnterHandle}
                />
                <Scene
                  key={'stub'}
                  component={StubPage}
                  hideNavBar={true}
                  initial={initialPage === 'stub'}
                  onEnter={this.onEnterHandle}
                />
              </Stack>
            </Modal>
          </Router>
          <TopMenu />
          <BottomMenu />
          <FullPageSpinner fullPage />
        </View>
      );
    }
  }
}

const mapStateToProps = state => ({
  auth: state.auth.authData,
  showWelcome: state.welcome.showWelcomeScreen,
  pin: state.pin,
  serverStatus: state.serverCheckMiddleware.serverStatus,
  isNetworkConnection: state.checkNetworkConnection.isNetworkConnection
  // selectedInterventionTab: state.interventions.selectedTab,
});

const mapDispatchToProps = {
  setCurrentScene,
  showWelcomeAction,
  showSetPinAction,
  hideEnterPinAction,
  checkSubscriptionStatusAction,
  getInfoAction,
  cleanInfo,
  serverCheckMiddlewareAction,
  checkNetworkConnectionAction,
  showMessageAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RootNavigator);
