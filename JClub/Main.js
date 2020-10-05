import React, { Component } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
  IS_IOS,
  WINDWIDTH,
} from '../constants';
import { Button, ButtonOutline, ButtonText } from '../components/common/Buttons';
import {
  H2, LayoutWithLogo, Loading, P2, showAlert,
} from '../components/common';
import { ModalSmall } from '../components/modals';
import validate from '../utils/validate';
import FloatInput from '../components/common/FloatInput';
import { becomePartner } from '../reduxStore/api/partner';

class Main extends Component {
  state = {
    controls: {
      phone: {
        value: '+7',
        cleanValue: '',
        valid: false,
        validationRules: {
          isPhone: true,
        },
        touched: false,
      },
    },
    modalPartner: false,
    modalSuccess: false,
    showLoader: false,
  };

  handleSubmit = () => {
    this.setState({ showLoader: true });
    becomePartner({ phone: this.state.controls.phone.cleanValue })
      .then(() => {
        this.setState({
          modalPartner: false,
          controls: {
            phone: {
              value: '+7',
            },
          },
        }, () => {
          setTimeout(() => {
            this.setState({
              modalSuccess: true,
            });
          }, 600);
        })
      })
      .catch((e) => {
        showAlert('Ошибка', e.response.data.phone[0], [
          {
            text: 'OK', onPress: () => null,
          },
        ]);
      })
      .finally(() => {
        this.setState({ showLoader: false })
      })
  };

  updateInputState = (key, value) => {
    this.setState(prevState => ({
      ...prevState,
      controls: {
        ...prevState.controls,
        [key]: {
          ...prevState.controls[key],
          valid: validate(value, prevState.controls[key].validationRules),
          touched: true,
          value,
          cleanValue: this.formatPhone(value),
        },
      },
    }));
  }

  formatPhone = phone => phone.replace(/[- )(]/g, '');

  render() {
    const { imageStyle, buttonsContainerStyle } = styles;
    const {
      modalPartner,
      modalSuccess,
    } = this.state;
    return (
      <LayoutWithLogo>
        <View style={{ justifyContent: 'flex-start', flex: 2 }}>
          <Image style={imageStyle} source={require('../../assets/images/welcome.png')} />
        </View>
        <View style={buttonsContainerStyle}>
          <ButtonOutline onPress={() => Actions.calc()}>
            Самостоятельный расчет Проката
          </ButtonOutline>

          <Button onPress={() => Actions.signIn()}>
            Войти
          </Button>

          <ButtonText onPress={() => this.setState({ modalPartner: true })}>
            Стать партнером Ювелирного Клуба
          </ButtonText>
        </View>

         <ModalSmall
          isVisible={ modalPartner }
          onBackButtonPress={() => this.setState({ modalPartner: false })}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={'white'}
          backdropOpacity={1}
          avoidKeyboard={true}
          style={{ position: 'relative' }}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <H2>Стать партнером ЮК</H2>
            <P2>
              Укажите номер телефона. Сотрудники
              "Ювелирного клуба" свяжутся с Вами и обсудят условия сотрудничества.
            </P2>
          </View>
          <FloatInput
            label="Номер телефона (логин)"
            keyboardType={'phone-pad'}
            onChangeText={(formatted, extracted) => this.updateInputState('phone', formatted, extracted)}
            placeholder="+7"
            value={this.state.controls.phone.value}
            mask={'+7 [000] [000] [00] [00]'}
            fontSize={17}
            touched={this.state.controls.phone.touched}
            valid={this.state.controls.phone.valid}
            error="Неверный формат номера телефона"
          />
          <View style={{ flexDirection: 'row', alignItems: 'space-between' }}>
            <ButtonText style={{ flex: 1 }}
                        onPress={() => this.setState({ modalPartner: false })}>
              Отмена
            </ButtonText>
            <ButtonText style={{ flex: 1 }}
                        disabled={!this.state.controls.phone.valid}
                        loading={this.state.loading}
                        onPress={() => this.handleSubmit()}>
              Отправить
            </ButtonText>
          </View>
          { this.state.showLoader
            ? <View style={styles.loaderStyle}>
              <Loading />
            </View> : null
          }

        </ModalSmall>

        <ModalSmall
          isVisible={ modalSuccess }
          onBackButtonPress={() => this.setState({ modalSuccess: false })}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={'white'}
          backdropOpacity={1}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <H2>Благодарим Вас</H2>
            <P2>
              В ближайшее время сотрудники "Ювелирного клуба" свяжутся с Вами и обсудят условия сотрудничества.
            </P2>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'space-between' }}>
            <ButtonText style={{ flex: 1 }}
                        onPress={() => this.setState({ modalSuccess: false })}>
              Ок
            </ButtonText>
          </View>
        </ModalSmall>
      </LayoutWithLogo>
    );
  }
}


const styles = StyleSheet.create({
  imageStyle: {
    alignSelf: 'center',
    height: WINDWIDTH * 0.80,
  },
  buttonsContainerStyle: {
    flex: 2,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  loaderStyle: {
    backgroundColor: 'rgba(255,255,255, 0.4)',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Main;
