import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { ModalFullscreen } from './index';
import { hideAddInterventionModal } from '../../reduxStore/actions/modals';
import SelectOptions from '../../components/common/SelectOptions';
import {
  PX18,
  MEDIUM_FONT,
  PX16,
  PX37,
  PX20,
  BLUE2,
  PX22,
  PX8,
  WHITE,
  GRADIENT_TOP,
  GRADIENT_BOTTOM,
  PX10,
  DARK_BLUE,
  PX50,
  PX30,
  INTERVENTION_MODE,
  PX25
} from '../../constants';
import { InputComponent } from '../../components/common/InputComponent';
import validate from '../../utils/validate';
import { Button, Loading } from '../common';
import { hideLoader, showLoader } from '../../reduxStore/actions/loaderToggle';
import { showMessageAction } from '../../reduxStore/actions/Message';
import {
  getInterventionsAction,
  getInterventionsGroupsAction,
  getInterventionsListAction,
  getInterventionsTypeAction,
  getModeInterventionsAction,
  getTasksInterventionsAction
} from '../../reduxStore/actions/interventions';
import { editIntervention } from '../../reduxStore/api/interventions';
import DateComponent from '../common/DateComponent';
import Moment from 'moment';
import SearchInput from '../common/SearchInput';
import { getUnixFromDate } from '../../utils/date.utils';
import { Actions } from 'react-native-router-flux';
import { INTERVENTIONS_PAGE } from '../../navigator/pagesConstants';
import { getMineDataAction } from '../../reduxStore/actions/main';
import AddCustomIntervention from './AddCustomInterventions';

const initialStateControls = {
  interventionId: {
    isRequired: true,
    value: '',
    valid: false,
    validationRules: {
      notEmptySelect: true
    },
    touched: false
  },
  groupId: {
    isRequired: true,
    value: '',
    valid: false,
    validationRules: {
      notEmptySelect: true
    },
    touched: false
  },
  dosage: {
    isRequired: true,
    value: '',
    valid: false,
    validationRules: {
      minLength: 2
    },
    touched: false
  },
  domain: {
    isRequired: false,
    value: '',
    valid: true,
    validationRules: {
      minLength: 0
    },
    touched: false
  },
  duration: {
    isRequired: false,
    value: '',
    valid: true,
    validationRules: {
      minLength: 0
    },
    touched: false
  },
  comment: {
    isRequired: false,
    value: '',
    valid: true,
    validationRules: {
      minLength: 0
    },
    touched: false
  }
};

class AddIntervention extends Component {
  state = {
    controls: initialStateControls,
    edit: false,
    editId: null,
    modal: false
  };

  componentDidMount() {
    this.props.getInterventionsTypeAction();
    this.props.getInterventionsGroupsAction();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.modalData) {
      this.setState({
        edit: true,
        editId: nextProps.modalData.id
      });
      Object.keys(this.state.controls).map(el => {
        this.updateInputState(el, nextProps.modalData[el]);
      });
    } else {
      if (this.props.modalType !== INTERVENTION_MODE) {
        this.setState({
          controls: initialStateControls,
          edit: false
        });
      }
    }
  }

  getPageType() {
    let type = 'today';
    switch (this.props.modalType) {
      case 2: {
        type = 'mode';
        break;
      }
      case 3: {
        type = 'tasks';
        break;
      }
      default: {
        return type;
      }
    }
    return type;
  }

  getTitle() {
    let title = 'Добавить интервенцию';
    switch (this.props.modalType) {
      case 2: {
        title = 'Добавить запись о режиме';
        break;
      }
      case 3: {
        title = 'Добавить задачу';
        break;
      }
      default: {
        return title;
      }
    }
    return title;
  }

  isDisabled = () =>
    Object.keys(this.state.controls).some(
      key => !this.state.controls[key].valid
    );

  updateInputState = (key, value) => {
    this.setState(
      prevState => ({
        ...prevState,
        controls: {
          ...prevState.controls,
          [key]: {
            ...prevState.controls[key],
            valid: validate(value, prevState.controls[key].validationRules),
            touched: true,
            value
          }
        }
      }),
      () => {
        //console.log(this.state.controls.groupId);
      }
    );
  };

  submitComplete() {
    this.props.hideAddInterventionModal();
    this.props.getMineDataAction(this.props.patientId);
    this.setState({
      controls: initialStateControls
    });
    switch (this.props.selectedTab) {
      case 'mode':
        this.props.getModeInterventionsAction(this.props.patientId);
        break;
      case 'tasks':
        this.props.getTasksInterventionsAction(this.props.patientId);
        break;
      default:
        this.props.getInterventionsAction(this.props.patientId);
    }
  }
  getFormData() {
    return {
      itemId: this.state.editId,
      interventionId: this.state.controls.interventionId.value,
      groupId: this.state.controls.groupId.value,
      dosage: this.state.controls.dosage.value,
      domain: this.state.controls.domain.value,
      comment: this.state.controls.comment.value,
      duration: this.state.controls.duration.value
    };
  }

  async handleUpdate() {
    this.props.showLoader();
    const formData = this.getFormData();
    try {
      const res = await editIntervention(this.props.protocol.id, formData);
      if (res && res.status === 200) {
        const message = this.state.edit
          ? 'Интервенция обновлена!'
          : 'Интервенция добавлена!';
        this.submitComplete();
        this.props.showMessageAction({
          type: 'success', // 'danger'
          message: message,
          icon: 'success'
        });
        // if (!this.state.edit) {
        //   Actions.push(INTERVENTIONS_PAGE, {
        //     activeTab: this.getPageType(),
        //   });
        // }
      } else {
        this.props.showMessageAction({
          type: 'danger', // 'danger'
          message: 'Ошибка отправки формы',
          icon: 'danger'
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.props.hideLoader();
    }
  }

  getSelectedGroup() {
    if (this.props.modalType === INTERVENTION_MODE) {
      return this.props.groups && this.props.groups.length > 0
        ? this.props.groups[0].key
        : null;
    } else {
      return this.state.controls.groupId.value;
    }
  }

  getSelectedIntervention() {}

  saveChanges(el) {
    this.updateInputState('interventionId', el);
  }

  toggleCustomModal(isOpen) {
    this.setState({ modal: isOpen });
  }

  saveCustomPreparate(el) {
    this.updateInputState('interventionId', el);
  }

  render() {
    return this.state.modal ? (
      <AddCustomIntervention
        visible={this.state.modal}
        saveCustomPreparate={el => this.saveCustomPreparate(el)}
        toggleCustomModal={isOpen => this.toggleCustomModal(isOpen)}
      />
    ) : (
      <>
        <ModalFullscreen
          isVisible={this.props.addInterventionModal}
          modalTitle={
            this.state.edit ? 'Редактировать интервенцию.' : this.getTitle()
          }
          titleStyle={{ fontSize: PX16 }}
          onBackButtonPress={this.props.hideAddInterventionModal}
          onClose={this.props.hideAddInterventionModal}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={WHITE}
          backdropOpacity={0.8}
          gradientTop={GRADIENT_TOP}
          gradientBottom={GRADIENT_BOTTOM}>
          <View>
            {this.state.controls && (
              <View style={{ paddingHorizontal: PX22 }}>
                <SearchInput
                  isRequired={this.state.controls.interventionId.isRequired}
                  value={
                    this.props.modalData
                      ? this.props.modalData.interventionName
                      : null
                  }
                  selectedId={
                    this.props.modalData
                      ? this.props.modalData.interventionId
                      : null
                  }
                  label={'Название интервенции'}
                  saveChanges={el => this.saveChanges(el)}
                  action={this.props.getInterventionsListAction}
                  isIntervention
                  toggleCustomModal={isOpen => this.toggleCustomModal(isOpen)}
                />

                <SelectOptions
                  isRequired={this.state.controls.groupId.isRequired}
                  style={{ marginBottom: PX30 }}
                  onChange={v => this.updateInputState('groupId', v)}
                  title="Время приема"
                  selected={this.getSelectedGroup()}
                  items={this.props.groups || []}
                  disabled={this.props.modalType === INTERVENTION_MODE}
                />

                <InputComponent
                  isRequired={this.state.controls.dosage.isRequired}
                  label="Дозировка"
                  onChangeText={v => this.updateInputState('dosage', v)}
                  value={this.state.controls.dosage.value}
                  fontSize={PX18}
                  touched={this.state.controls.dosage.touched}
                  valid={this.state.controls.dosage.valid}
                  error="Минимум 2 символа"
                  style={{ paddingBottom: PX10 }}
                />

                <InputComponent
                  isRequired={this.state.controls.domain.isRequired}
                  label="Домен"
                  onChangeText={v => this.updateInputState('domain', v)}
                  value={this.state.controls.domain.value}
                  fontSize={PX18}
                  touched={this.state.controls.domain.touched}
                  valid={this.state.controls.domain.valid}
                  error="Минимум 2 символа"
                  style={{ paddingBottom: PX10 }}
                />

                <InputComponent
                  isRequired={this.state.controls.duration.isRequired}
                  label="Длительность"
                  onChangeText={v => this.updateInputState('duration', v)}
                  value={this.state.controls.duration.value}
                  fontSize={PX18}
                  touched={this.state.controls.duration.touched}
                  valid={this.state.controls.duration.valid}
                  error=""
                  style={{ paddingBottom: PX10 }}
                />

                <InputComponent
                  isRequired={this.state.controls.comment.isRequired}
                  label="Комментарий"
                  onChangeText={v => this.updateInputState('comment', v)}
                  value={this.state.controls.comment.value}
                  fontSize={PX18}
                  touched={this.state.controls.comment.touched}
                  valid={this.state.controls.comment.valid}
                  error="Минимум 2 символа"
                  style={{ paddingBottom: PX10 }}
                />

                <Button
                  onPress={() => this.handleUpdate()}
                  disabled={this.isDisabled()}
                  style={{ backgroundColor: WHITE }}
                  textStyles={{ color: DARK_BLUE }}>
                  {this.state.edit ? 'Сохранить' : 'Добавить'}
                </Button>
              </View>
            )}
          </View>
        </ModalFullscreen>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
  text: {
    ...MEDIUM_FONT,
    color: WHITE,
    fontSize: PX18
  },

  circle: {
    width: PX37,
    height: PX37,
    borderRadius: PX20,
    backgroundColor: BLUE2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: PX18,
    right: 0
  },
  rowStyle: {
    paddingHorizontal: PX22,
    color: WHITE,
    fontSize: PX16,
    opacity: 0.75,
    paddingVertical: PX8
  },
  pickerWrap: {
    alignItems: 'center'
  }
});

const mapStateToProps = state => ({
  addInterventionModal: state.modals.addInterventionModal,
  modalData: state.modals.addInterventionData,
  modalType: state.interventions.interventionsTypeSelect,
  role: state.auth.authData.type,
  patientId: state.patients.selectedPatientId,
  groups: state.interventions.interventionsGroups,
  list: state.interventions.interventionsList,
  protocol: state.interventions.protocol,
  selectedTab: state.interventions.selectedTab
});

const mapDispatchToProps = {
  getInterventionsListAction,
  getInterventionsGroupsAction,
  getInterventionsTypeAction,
  hideAddInterventionModal,
  getTasksInterventionsAction,
  getModeInterventionsAction,
  getInterventionsAction,
  getMineDataAction,
  showLoader,
  hideLoader,
  showMessageAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddIntervention);
