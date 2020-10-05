import React from 'react';
import { Component } from 'react';
import { View, Text, Linking } from 'react-native';
import { H1, P3 } from '../../components/common/Text';
import validate from '../../utils/validate';
import { InputComponent } from '../../components/common/InputComponent';
import { signInAction } from '../../reduxStore/actions/auth';
import { connect } from 'react-redux';
import LayoutWithLogo from '../../components/layouts/LayoutWithLogo';
import { Button, ButtonLink } from '../../components/common';
import { Actions } from 'react-native-router-flux';
import {
  BUTTON_LINK_TEXT_COLOR,
  PX10,
  PX15,
  PX18,
  WHITE,
  USER_AGREEMENT_LINK,
  PRIVACY_POLICY_LINK,
  PX80,
} from '../../constants';
import { hideLoader, showLoader } from '../../reduxStore/actions/loaderToggle';
import { styles } from './authStyles';
import { showMessageAction } from '../../reduxStore/actions/Message';
import { SIGN_UP_PAGE } from '../../navigator/pagesConstants';

const tabs = [
  {
    title: 'Вход',
    key: '0',
  },
  {
    title: 'Регистрация',
    key: '1',
  },
];
class SignIn extends Component {
  state = {
    activeScreen: '0',
    controls: {
      username: {
        isRequired: true,
        value: this.props.email || '',
        valid: !!this.props.email,
        validationRules: {
          isEmail: true,
        },
        touched: false,
      },
      password: {
        isRequired: true,
        value: '',
        valid: false,
        validationRules: {
          minLength: 6,
        },
        touched: false,
      },
    },
  };

  submit = () => {
    this.props.showLoader();
    const { username, password } = this.state.controls;
    this.props
      .signInAction({
        username: username.value,
        password: password.value,
      })
      .then(res => {
        if (res.request.status !== 200) {
          this.props.showMessageAction({
            type: 'danger',
            message: res.response.data.message,
          });
        }
      })
      .catch(e => {
        this.props.showMessageAction({
          type: 'danger',
          message: e.message,
        });
      })
      .finally(() => {
        this.props.hideLoader();
      });
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
        },
      },
    }));
  };

  onChangeScreen = key => {
    if (key !== this.state.activeScreen) {
      Actions.push(SIGN_UP_PAGE);
    } else {
      return key;
    }
  };

  render() {
    const { controls } = this.state;
    const {
      resetPassword,
      bottomButtons,
      formStyle,
      signUpLink,
      titleStyle,
    } = styles;
    return (
      <LayoutWithLogo
        activeTab={this.state.activeScreen}
        changeScreen={this.onChangeScreen}
        tabs={tabs}
        scrollViewPaddingTop={{ paddingTop: PX80 }}>
        <View style={formStyle}>
          <InputComponent
            isRequired={this.state.controls.username.isRequired}
            label="Логин"
            onChangeText={v => this.updateInputState('username', v.trim())}
            value={controls.username.value}
            fontSize={PX18}
            touched={controls.username.touched}
            valid={controls.username.valid}
            error="Введите валидный Email"
            type={'email-address'}
            isNeedActiveBackground={true}
          />
          <InputComponent
            isRequired={this.state.controls.password.isRequired}
            label="Пароль"
            onChangeText={v => this.updateInputState('password', v)}
            value={controls.password.value}
            fontSize={PX18}
            secure={true}
            eyeButton={true}
            touched={controls.password.touched}
            valid={controls.password.valid}
            isNeedActiveBackground={true}
            error="Минимум 6 символов"
          />
          <View style={resetPassword}>
            <ButtonLink
              style={{ marginTop: PX10 }}
              onPress={() => Actions.resetPassword()}
              textStyles={{ color: BUTTON_LINK_TEXT_COLOR }}>
              Забыли пароль?
            </ButtonLink>
          </View>
        </View>
        <P3 style={{ color: WHITE, marginTop: 10, marginBottom: 10 }}>
          Используя приложение, Вы принимаете нашу
          <Text
            style={{ textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(USER_AGREEMENT_LINK)}>
            {` Политику в отношении обработки персональных данных `}
          </Text>
          и
          <Text
            style={{ textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(PRIVACY_POLICY_LINK)}>
            {` Пользовательское соглашение `}
          </Text>
        </P3>
        <View style={bottomButtons}>
          <Button
            disabled={!controls.username.valid || !controls.password.valid}
            onPress={() => this.submit()}>
            Войти
          </Button>
          {/* <ButtonLink
            onPress={() => Actions.signUp()}
            textStyles={signUpLink}
            style={{ marginVertical: PX15 }}>
            Нет аккаунта? Зарегистрироваться
          </ButtonLink> */}
        </View>
      </LayoutWithLogo>
    );
  }
}

const mapDispatchToProps = {
  signInAction,
  showLoader,
  hideLoader,
  showMessageAction,
};

export default connect(
  null,
  mapDispatchToProps,
)(SignIn);
