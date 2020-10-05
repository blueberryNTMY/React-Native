import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { View, StyleSheet } from 'react-native';
import {
  H2,
  P2,
  SelectionInput,
  Selection,
  Picker,
  showAlert,
} from '../components/common';
import Layout from '../components/common/Layout';
import { BLACK, REGULAR_FONT } from '../constants';
import { ModalFullscreen } from '../components/modals';
import { Button } from '../components/common/Buttons';
import FloatInput from '../components/common/FloatInput';

export default class PriceCalc extends Component {
  state = {
    price: '', // Стоимость изделия в магазине
    weight: '', // Вес изделия
    type: '', // тип изделия
    insert: '', // начилие вставки
    material: '', // металл
    fineness: '', // проба
    insertWeight: '', // вес вставки

    modalVisible: false,
    modalTitle: '',
    modalType: '',

    calcModalVisible: false,
    calcDisabled: true,
  };

  getChecked = i => {
    const { modalType } = this.state;
    this.setState({
      [modalType]: i,
      modalType: '',
    });
  };

  goRegister = () => {
    this.setState({ calcModalVisible: false }, () => {
      Actions.signUp();
    });
  };

  goOffers = () => {
    this.setState({ calcModalVisible: false }, () => {
      Actions.offers();
    });
  };

  transformPrice = p => p.replace(/[.,\s]/g, '');

  calculate = () => {
    this.props.showLoader();
    this.props
      .calculatePriceAction({
        price: this.transformPrice(this.state.price),
        weight: this.state.weight,
        type: this.state.type.id,
        material: this.state.material.id,
        fineness: this.state.fineness,
        insertWeight: this.state.insertWeight,
        insert: this.state.insert,
      })
      .then(() => {
        if (this.props.calculate_success && !this.props.calculate_error) {
          this.setState({ calcModalVisible: true });
        } else {
          showAlert('Error', this.props.calculate_error.response.statusText);
        }
      })
      .finally(() => {
        this.props.hideLoader();
      });
  };

  onChangeSelect = state => {
    this.setState({ ...state }, () => {
      const {
        price,
        weight,
        type,
        material,
        fineness,
        insertWeight,
      } = this.state;
      if (price && weight && type && material && fineness) {
        const insert = insertWeight ? 1 : 0;
        this.setState({
          insert,
          calcDisabled: false,
        });
      } else {
        this.setState({ calcDisabled: true });
      }
    });
  };

  render() {
    const { calculate_success, authData } = this.props;

    const userIsLogIn = () => !!authData;

    const {
      type: types,
      material: materials,
    } = this.props.calc_constants_success;

    const {
      type,
      price,
      weight,
      material,
      fineness,
      insertWeight,
      modalVisible,
      modalTitle,
      modalType,
      calcModalVisible,
      calcDisabled,
    } = this.state;

    return (
      <Layout>
        <P2>
          Посмотрите на бирку понравившегося Вам украшения и введите параметры
          изделия:
        </P2>
        <Selection
          label="Тип изделия"
          value={type.title}
          onClick={() =>
            this.onChangeSelect({
              modalVisible: true,
              modalTitle: 'Тип изделия',
              modalType: 'type',
            })
          }
          placeholder={'Выберите'}
        />
        <Selection
          label="Металл"
          value={material.title}
          onClick={() =>
            this.onChangeSelect({
              modalVisible: true,
              modalTitle: 'Металл',
              modalType: 'material',
            })
          }
          placeholder={'Выберите'}
        />
        <SelectionInput
          label="Проба"
          keyboardType={'numeric'}
          value={fineness}
          onChangeText={v => this.onChangeSelect({ fineness: v })}
          placeholder={'0'}
        />
        <SelectionInput
          label="Вес изделия, г"
          value={weight}
          keyboardType={'numeric'}
          onChangeText={v => this.onChangeSelect({ weight: v })}
          placeholder={'0'}
        />
        <SelectionInput
          label="Вес вставок, карат"
          value={insertWeight}
          keyboardType={'numeric'}
          onChangeText={v => this.onChangeSelect({ insertWeight: v })}
          placeholder={'0'}
        />
        <H2 style={{ marginTop: 10 }}>Стоимость изделия в магазине</H2>

        <View style={styles.container}>
          <FloatInput
            keyboardType={'phone-pad'}
            onChangeText={v => this.onChangeSelect({ price: v })}
            value={price}
            fontSize={25}
            placeholder={'0'}
            style={styles.numberInput}
            valid={price}
          />
          <P2 style={styles.text}>руб.</P2>
        </View>

        <Button
          disabled={calcDisabled}
          onPress={() => this.calculate()}
          style={{
            marginBottom: 40,
            lineHeight: 24,
          }}>
          Рассчитать
        </Button>

        <ModalFullscreen
          isVisible={modalVisible}
          modalTitle={modalTitle}
          modalType={modalType}
          onBackButtonPress={() => this.setState({ modalVisible: false })}
          onClose={() => this.setState({ modalVisible: false })}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={BLACK}
          backdropOpacity={0.8}>
          <Picker
            data={modalType === 'type' ? types : materials}
            checked={
              modalType === 'type' ? parseInt(type.id) : parseInt(material.id)
            }
            getChecked={i => this.getChecked(i)}
            action={() => this.setState({ modalVisible: false })}
          />
        </ModalFullscreen>

        {calculate_success && (
          <ModalFullscreen
            isVisible={calcModalVisible}
            modalTitle={'Стоимость проката'}
            onBackButtonPress={() => this.setState({ calcModalVisible: false })}
            onClose={() => this.setState({ calcModalVisible: false })}
            useNativeDriver={true}
            propagateSwipe={true}
            backdropColor={BLACK}
            backdropOpacity={0.8}
            isNeedArrow={true}>
            <H2 style={{ marginTop: 10 }}>Ориентировочная стоимость проката</H2>
            <Selection
              label="10 календарных дней"
              value={`${calculate_success.values.rent.price} руб.`}
              disabled
            />
            <Selection
              label="Залоговая стоимость"
              value={`${calculate_success.values.deposit.price} руб.`}
              disabled
            />
            <View style={styles.textContainer}>
              <P2>за 1 г.</P2>
              <P2
                style={{
                  paddingRight: 50,
                  textTransform: 'none',
                }}>{`${calculate_success.values.deposit.pricePerGram} руб.`}</P2>
            </View>
            <Selection
              label="Быстрый выкуп"
              value={`${calculate_success.values.fast_buyout.price} руб.`}
              disabled
            />
            <View style={styles.textContainer}>
              <P2>за 1 г.</P2>
              <P2
                style={{
                  paddingRight: 50,
                  textTransform: 'none',
                }}>{`${calculate_success.values.fast_buyout.pricePerGram} руб.`}</P2>
            </View>
            <Selection
              label="Стоимость в магазине"
              value={`${calculate_success.values.shopPrice.price} руб.`}
              disabled
            />
            <View style={styles.textContainer}>
              <P2>за 1 г.</P2>
              <P2
                style={{
                  paddingRight: 50,
                  textTransform: 'none',
                }}>{`${calculate_success.values.shopPrice.pricePerGram} руб.`}</P2>
            </View>
            <P2
              style={{
                marginTop: 20,
                marginBottom: 0,
              }}>
              Не является публичной офертой.
            </P2>
            <P2 style={{ marginBottom: 20 }}>
              {userIsLogIn()
                ? 'Точный расчет Коммерческого предложения, возможен только после оформления Пользователем услуги Запрос на прокат'
                : `Со всеми условиями проката и его точную стоимость можно расчитать только после регистрациив личном кабинете члена "Ювелирного Клуба"`}
            </P2>
            {userIsLogIn() ? (
              <Button
                onPress={() => this.goOffers()}
                style={{
                  marginBottom: 40,
                  lineHeight: 24,
                }}>
                Взять на прокат
              </Button>
            ) : (
              <Button
                onPress={() => this.goRegister()}
                style={{
                  marginBottom: 40,
                  lineHeight: 24,
                }}>
                Зарегистрироваться
              </Button>
            )}
          </ModalFullscreen>
        )}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  numberInput: {
    margin: 0,
    textAlign: 'center',
  },
  textContainer: {
    marginTop: -10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  container: {
    marginTop: 15,
    marginBottom: 10,
    flex: 1,
  },
  text: {
    ...REGULAR_FONT,
    position: 'absolute',
    right: 0,
    top: 14,
    textTransform: 'none',
  },
});
