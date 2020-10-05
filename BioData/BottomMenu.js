import React, { Component, memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconMoon from '../utils/CustomIcon';
import { connect } from 'react-redux';
import {
  WHITE,
  PX60,
  PX73,
  DARK_BLUE,
  PX10,
  PX43,
  PRIMARY_COLOR,
  PX18,
  roles,
  PX24,
} from '../constants';
import {
  MAIN_PAGE,
  screensWithBottomMenu,
  PATIENTS_PAGE,
  CHECKUP_PAGE,
  CHECKUP_SCHEDULE_PAGE,
  HEALTH_SCHEDULE_PAGE,
  SETTINGS_PAGE,
  NOTIFICATIONS_PAGE,
  FILES_PAGE,
  FILES_LIST_PAGE,
  RISK_PANEL_PAGE,
  BIOMARKERS_PAGE,
  INTERVENTIONS_PAGE,
  DIETE_PAGE,
  CHAT_PAGE,
  REPORT_PAGE,
} from './pagesConstants';
import { Actions } from 'react-native-router-flux';
import AddBiomarker from '../components/modals/AddBiomarker';
import AddRisk from '../components/modals/AddRisk';
import AddPatient from '../components/modals/AddPatient';
import ActionSheetComponent from '../components/common/ActionSheetComponent';
import {
  showAddBiomarkerModal,
  showAddRiskModal,
  showAddPatientModal,
  showAddInterventionModal,
  showAddProtocolModal,
} from '../reduxStore/actions/modals';
import { signOutAction } from '../reduxStore/actions/auth';
import AddIntervention from '../components/modals/AddIntervention';
import {
  getInterventionsGroupsAction,
  getInterventionsListAction,
  getProtocolAction,
  selectTypeAction,
} from '../reduxStore/actions/interventions';
import { showMessageAction } from '../reduxStore/actions/Message';
import AddProtocol from '../components/modals/AddProtocol';

import {
  patientIsSubscribe,
  showSubscribeAlert,
} from '../utils/patientIsSubscribe';

import InfoModal from '../components/modals/InfoModal';

class BottomMenu extends Component {
  handleOnPress = (type = '') => {
    const actionsheet = this.getActionSheet(type);
    actionsheet.show();
  };
  pushOnScreen = screen => {
    if (this.props.currentScene !== screen) {
      Actions.push(screen);
    }
  };
  getActionSheet = type => {
    if (type === 'settings') {
      return this.ActionSheetSettings;
    } else {
      return this.ActionSheet;
    }
  };

  async addInterventionPopup(type, subscriptionStatus) {
    const res = await this.props.getProtocolAction(this.props.patientId);
    if (res) {
      if (patientIsSubscribe(subscriptionStatus)) {
        if (this.props.protocol.id) {
          this.props.getInterventionsGroupsAction(type || null);
          this.props.getInterventionsListAction();
          this.props.selectTypeAction(type || null);
          this.props.showAddInterventionModal();
        } else {
          this.props.showAddProtocolModal();
        }
      } else {
        showSubscribeAlert();
      }
    }
  }

  addRiskModal(subscriptionStatus) {
    if (patientIsSubscribe(subscriptionStatus)) {
      this.props.showAddRiskModal();
    } else {
      showSubscribeAlert();
    }
  }

  goToFiles(subscriptionStatus) {
    if (patientIsSubscribe(subscriptionStatus)) {
      Actions.push(FILES_PAGE);
    } else {
      showSubscribeAlert();
    }
  }

  addBiomarker(subscriptionStatus) {
    if (patientIsSubscribe(subscriptionStatus)) {
      this.props.showAddBiomarkerModal();
    } else {
      showSubscribeAlert();
    }
  }

  render() {
    const roleDoctor =
      roles.TYPE_DOCTOR === this.props.role ||
      roles.TYPE_HEAD_DOCTOR === this.props.role;
    const { currentScene, subscriptionStatus } = this.props;

    if (screensWithBottomMenu.some(el => el === currentScene)) {
      return (
        <View style={styles.container}>
          {this.props.role === roles.TYPE_PATIENT && (
            <MenuItem
              name={MAIN_PAGE}
              icon={'1'}
              onPress={() => this.pushOnScreen(MAIN_PAGE)}
              currentScene={currentScene}
            />
          )}
          {roleDoctor || this.props.role === roles.TYPE_EMPLOYEE_BIODATA ? (
            <MenuItem
              name={PATIENTS_PAGE}
              icon={'teamwork'}
              onPress={() => Actions.push(PATIENTS_PAGE)}
              currentScene={currentScene}
            />
          ) : null}
          <MenuItem
            name={CHAT_PAGE}
            icon={'chat-bubble'}
            onPress={() => this.pushOnScreen(CHAT_PAGE)}
            currentScene={currentScene}
          />
          {/* {this.props.role === roles.TYPE_PATIENT && (
            <MenuItem
              name={CHECKUP_PAGE}
              icon={'favourites-fill-star'}
              onPress={() => this.pushOnScreen(CHECKUP_PAGE)}
              currentScene={currentScene}
            />
          )} */}
          <MenuItem
            name={MAIN_PAGE}
            icon={'center'}
            onPress={() => this.handleOnPress()}
            currentScene={currentScene}
          />
          {/* {roleDoctor && (
            <MenuItem
              name={FILES_LIST_PAGE}
              icon={'document-dark'}
              onPress={() => this.pushOnScreen(FILES_LIST_PAGE)}
              currentScene={currentScene}
            />
          )} */}
          {/* <MenuItem
            name={CHECKUP_SCHEDULE_PAGE}
            icon={'election-event'}
            onPress={() => this.pushOnScreen(CHECKUP_SCHEDULE_PAGE)}
            currentScene={currentScene}
          /> */}
          <MenuItem
            name={SETTINGS_PAGE}
            icon={'settings-cog'}
            onPress={() => Actions.push(SETTINGS_PAGE)}
            currentScene={currentScene}
          />
          <AddBiomarker />
          <AddRisk />
          <AddPatient />
          <AddIntervention />
          <AddProtocol />
          <InfoModal />
          <ActionSheetComponent
            initRef={ref => (this.ActionSheet = ref)}
            role={this.props.role}
            options={[
              {
                label: 'Распознать анализы',
                icon: 'document-scanning',
                action: () => this.goToFiles(subscriptionStatus.status),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Жалоба риск-панели',
                icon: 'fire',
                action: () => this.addRiskModal(subscriptionStatus.status),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Добавить интервенцию',
                icon: 'pills',
                action: () =>
                  this.addInterventionPopup(null, subscriptionStatus.status),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Добавить задачу',
                icon: 'check',
                action: () =>
                  this.addInterventionPopup(3, subscriptionStatus.status),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Сделать запись о режиме',
                icon: 'pencil',
                action: () =>
                  this.addInterventionPopup(2, subscriptionStatus.status),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              // {
              //   label: 'Запись дневника здоровья',
              //   icon: 'open-book',
              //   action: () => Actions.push(HEALTH_SCHEDULE_PAGE),
              //   roles: [roles.TYPE_PATIENT, roles.TYPE_DOCTOR],
              // },
              {
                label: 'Добавить пациента',
                icon: 'standing-human',
                action: () => this.props.showAddPatientModal(),
                roles: [
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
            ]}
          />
          <ActionSheetComponent
            initRef={ref => (this.ActionSheetSettings = ref)}
            role={this.props.role}
            options={[
              // {
              //   label: 'Уведомления',
              //   icon: 'notifications-button',
              //   action: () => Actions.push(NOTIFICATIONS_PAGE),
              //   roles: [roles.TYPE_PATIENT, roles.TYPE_DOCTOR],
              // },
              {
                label: 'Риски',
                icon: 'fire',
                action: () => this.pushOnScreen(RISK_PANEL_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_ASSISTANT,
                  roles.TYPE_BIO_INFORMATICS,
                  roles.TYPE_ADMIN,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Биомаркеры',
                icon: 'signal',
                action: () => this.pushOnScreen(REPORT_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_ASSISTANT,
                  roles.TYPE_BIO_INFORMATICS,
                  roles.TYPE_ADMIN,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Основные органы и системы',
                icon: 'node_filled',
                action: () => this.pushOnScreen(BIOMARKERS_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_ASSISTANT,
                  roles.TYPE_BIO_INFORMATICS,
                  roles.TYPE_ADMIN,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Диета',
                icon: 'weight',
                action: () => this.pushOnScreen(DIETE_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_ASSISTANT,
                  roles.TYPE_BIO_INFORMATICS,
                  roles.TYPE_ADMIN,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Протокол',
                icon: 'pills',
                action: () => this.pushOnScreen(INTERVENTIONS_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_ASSISTANT,
                  roles.TYPE_BIO_INFORMATICS,
                  roles.TYPE_ADMIN,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
              {
                label: 'Файлы',
                icon: 'document-dark',
                action: () => this.pushOnScreen(FILES_LIST_PAGE),
                roles: [
                  roles.TYPE_PATIENT,
                  roles.TYPE_DOCTOR,
                  roles.TYPE_HEAD_DOCTOR,
                  roles.TYPE_EMPLOYEE_BIODATA,
                ],
              },
            ]}
          />
          <MenuItem
            icon={'menu'}
            onPress={() => this.handleOnPress('settings')}
            currentScene={currentScene}
          />
        </View>
      );
    }
    return null;
  }
}

const MenuItem = memo(({ icon, onPress, name, currentScene }) => {
  if (icon === 'center') {
    return (
      <View style={styles.item}>
        <TouchableOpacity style={styles.iconPlus} onPress={onPress}>
          <Text style={styles.iconPlusText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      <IconMoon
        name={icon}
        size={PX24}
        color={name === currentScene ? WHITE : PRIMARY_COLOR}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignContent: 'space-around',
    alignItems: 'center',
    justifyContent: 'center',
    height: PX73,
    width: '100%',
    backgroundColor: DARK_BLUE,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    height: PX60,
    justifyContent: 'center',
  },
  iconPlus: {
    width: PX43,
    height: PX43,
    borderRadius: PX43 / 2,
    marginHorizontal: PX10,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlusText: {
    fontSize: PX18,
    color: '#00006f',
  },
});

const mapStateToProps = state => ({
  currentScene: state.layout.currentScene,
  role: state.auth.authData.type,
  subscriptionStatus: state.auth.subscriptionStatus,
  protocol: state.interventions.protocol,
  patientId: state.patients.selectedPatientId,
});

const mapDispatchToProps = {
  showAddBiomarkerModal,
  showAddRiskModal,
  showAddInterventionModal,
  showAddPatientModal,
  signOutAction,
  getProtocolAction,
  showMessageAction,
  showAddProtocolModal,
  getInterventionsGroupsAction,
  getInterventionsListAction,
  selectTypeAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BottomMenu);
