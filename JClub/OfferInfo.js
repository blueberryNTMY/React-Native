import React, { Component } from 'react';
import {
  StyleSheet, View, Image, TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import ImageView from 'react-native-image-view';
import { Actions } from 'react-native-router-flux';
import CountDown from 'react-native-countdown-component';
import Moment from 'moment';
import { connect } from 'react-redux';
import Layout from '../components/common/Layout';
import {
  H2, H3, P1, P2, P3, Selection, Line, CabinetLink, Loading, showAlert,
} from '../components/common';
import FloatInput from '../components/common/FloatInput';
import { Button, ButtonOutline, ButtonText } from '../components/common/Buttons';
import {
  GRAY, VIEW_PADDING_HORIZONTAL, LIGHT_GRAY, WINDWIDTH, REGULAR_FONT, BLACK,
} from '../constants';
import { SectionDoubleLine } from '../components/common/Sections';
import { ModalSmall } from '../components/modals/ModalSmall';
import validate from '../utils/validate';
import { declineOffer } from '../reduxStore/api/offers';
import { hideLoader, showLoader } from '../reduxStore/actions/loaderToggle';
import OpeningHours from '../components/OpeningHours';

class OfferInfo extends Component {
  static defaultProps = {
    data: {
      title: '',
    },
  }

  state = {
    isImageViewVisible: false,
    declineModal: false,
    declineReasonModal: false,
    gallery: [],
    showLoader: false,
    coundownFinish: this.props.data.status_data.timer - (+Moment() / 1000).toFixed(0) || 0,
    imageIndex: 0,
    controls: {
      reason: {
        value: '',
        valid: false,
        validationRules: {
          minLength: 1,
        },
        touched: false,
      },
    },
    endOffer: false,
  }

  componentDidMount() {
    this.props.navigation.setParams({
      title: this.props.data.title || 'No title',
    });
    const gallery = [];
    this.props.data.images.map((item) => {
      gallery.push({
        source: {
          uri: item.image,
        },
        title: item.type,
        width: 806,
        height: 720,
      });
    });
    this.setState({ gallery });
  }

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
  }

  renderBottom(coundownTime) {
    const { subStatus, status_data } = this.props.data;
    if (status_data.title) {
      return <View style={[{
        paddingBottom: 15,
        paddingTop: 15,
      }, styles.shadowBox]}>
        <P2 style={styles.infoMessage}>
          {status_data.title}
        </P2>
        {coundownTime > 0
          ? <View style={{
            paddingTop: 0,
            marginBottom: 0,
            textAlign: 'center',
          }}>
            <CountDown
              until={coundownTime}
              onFinish={() => this.setState({ endOffer: true })}
              digitStyle={{
                backgroundColor: 'transparent',
                padding: 0,
                width: 0,
                height: 0,
                borderRadius: 0,
                margin: 0,
              }}
              timeLabelStyle={{
                display: 'none',
              }}
              size={14}
              digitTxtStyle={{
                ...REGULAR_FONT,
                color: BLACK,
                fontSize: 16,
              }}
              separatorStyle={{
                ...REGULAR_FONT,
                color: BLACK,
                fontSize: 16,
              }}
              showSeparator
              timeToShow={['H', 'M', 'S']}
            />
            <View style={styles.container}>
              {status_data.buttons && status_data.buttons.map((e, i) => {
                if (e.type === 'decline') {
                  return <ButtonOutline key={i} style={{
                    flex: 1,
                    marginRight: 7,
                  }}
                    onPress={() => this.setState({ declineReasonModal: true })}>
                    {e.name}
                  </ButtonOutline>;
                }
                if (e.type === 'accept') {
                  return <Button key={i} style={{
                    flex: 1,
                    marginLeft: 7,
                  }} onPress={() => this.props.payment(this.props.data.id)}>
                    {e.name}
                  </Button>;
                }
              })
              }
              {status_data.title === 'Оплатите изделие:' ? <Button style={{
                flex: 1,
                marginBottom: 30,
              }} onPress={() => this.props.payment(this.props.data.id)}>
                Оплатить
              </Button> : null}
            </View>
          </View> : <P2 style={styles.infoMessage}>
            Время действия предложения вышло
          </P2>}
      </View>;
    }
    return <P2 style={styles.infoMessage}>
      {subStatus}
    </P2>;
  }


  submitDecline = (isReason) => {
    this.setState({
      showLoader: true,
    });
    declineOffer({
      id: this.props.data.id,
      message: this.state.controls.reason.value,
    }).then((res) => {
      this.props.showLoader();
      if (res.status === 200) {
        this.setState({ declineReasonModal: false, showLoader: false }, () => {
          setTimeout(() => {
            this.setState({ declineModal: true });
          }, 700);
        });
      }
    }).catch((e) => {
      showAlert('Ошибка', e.response.data.message[0], [
        {
          text: 'OK', onPress: () => null,
        },
      ]);
    }).finally(() => {
      this.setState({
        showLoader: false,
      });
      this.props.hideLoader();
    });
  }

  isValidData = data => data.length > 0 || Object.keys(data).length !== 0;

  render() {
    const {
      images,
      orderResponse,
      shop,
      code,
      id,
      inserts,
    } = this.props.data;

    return (
      <Layout style={{ paddingHorizontal: 0 }}>
        <View style={{ paddingHorizontal: VIEW_PADDING_HORIZONTAL }}>
          <ImageView
            images={this.state.gallery}
            imageIndex={this.state.imageIndex}
            isVisible={this.state.isImageViewVisible}
          />
          <View style={styles.imagesContainer}>
            {images && images.map((item, i) => (
              <TouchableWithoutFeedback
                key={i}
                onPress={() => this.setState({ isImageViewVisible: true, imageIndex: i })}>
                <Image
                  style={styles.imageStyle}
                  source={{ uri: item.image }}/>
              </TouchableWithoutFeedback>
            ))}
          </View>
          <Line/>

          <H2 style={{ marginBottom: 0 }}>Параметры ювелирного изделия</H2>
          <Selection
            label="Тип изделия"
            value={this.isValidData(orderResponse) ? orderResponse.calculate.type : '-'}
            disabled
          />
          <Selection
            label="Металл"
            value={this.isValidData(orderResponse) ? orderResponse.calculate.material : '-'}
            disabled
          />
          <Selection
            label="Проба"
            value={this.isValidData(orderResponse) ? orderResponse.calculate.fineness : '-'}
            disabled
          />
          <Selection
            label="Вес изделия, г"
            value={this.isValidData(orderResponse) ? orderResponse.calculate.weight : '-'}
            disabled
          />

          <Selection
            label="Вставки, г"
            value={this.isValidData(orderResponse) ? orderResponse.calculate.insertWeight : '-'}
            disabled
          />

          {inserts && <H3 style={{ color: GRAY, marginBottom: 0, paddingTop: 10 }}>ВСТАВКИ</H3>}
          {inserts && inserts.map((item, i) => (
            <Selection
              key={i}
              label={item.title}
              value={item.weight}
              disabled
            />
          ))}

          <SectionDoubleLine
            mainText="Стоимость в ювелирном магазине"
            mainSubtext={this.isValidData(orderResponse)
              ? `${orderResponse.calculate.shopPrice.price} руб.`
              : '-'}
            secondaryText="за 1 г."
            secondarySubtext={this.isValidData(orderResponse)
              ? `${orderResponse.calculate.shopPrice.pricePerGram} руб.`
              : '-'}
          />

          <Line style={{ marginHorizontal: -VIEW_PADDING_HORIZONTAL }}/>


          <H2 style={{ marginBottom: 0 }}>Стоимость и условия проката</H2>
          <SectionDoubleLine
            mainText="Стоимость проката на 10 дней"
            mainSubtext={this.isValidData(orderResponse) ? `${orderResponse.calculate.rent.price || ''} руб.` : null}
            secondaryText=""
            secondarySubtext={''}
          />
          <Line/>
          <SectionDoubleLine
            mainText="Залоговая стоимость"
            mainSubtext={this.isValidData(orderResponse) ? `${orderResponse.calculate.deposit.price} руб.` : null}
            secondaryText=""
            secondarySubtext={''}
          />

          <Line/>

          <H2 style={{ marginBottom: 0 }}>Быстрый выкуп</H2>
          <SectionDoubleLine
            mainText="Стоимость быстрого выкупа"
            mainSubtext={this.isValidData(orderResponse)
              ? `${orderResponse.calculate.fast_buyout.price} руб.`
              : '-'}
            secondaryText="за 1 г."
            secondarySubtext={this.isValidData(orderResponse)
              ? `${orderResponse.calculate.fast_buyout.pricePerGram} руб.`
              : '-'}
          />

          <CabinetLink
            onPress={() => Actions.textPage({ title: 'Про услугу Быстрый выкуп', id: orderResponse.info.buyout_id })}
            text="Про услугу Быстрый выкуп"
            icon
          />

          <H2 style={{ marginBottom: 0, marginTop: 10 }}>Место получения:</H2>
          <P1 style={{ marginBottom: 0 }}>{orderResponse.get_place || ''}</P1>
          <ButtonText onPress={() => Actions.maps({
            shops: [
              {
                name: orderResponse.get_place,
                location: {
                  latitude: parseFloat(orderResponse.get_place_location.latitude) || 0,
                  longitude: parseFloat(orderResponse.get_place_location.longitude) || 0,
                },
              },
            ],
            shopInfo: shop,
          })}>
            Показать на карте
          </ButtonText>
          {orderResponse.get_place_opening_hours
            ? <OpeningHours style={{ marginBottom: 15 }} hours={orderResponse.get_place_opening_hours}
                          hideHollydays/> : null}
          <P2 style={{ marginBottom: 0, color: GRAY }}>
            Получить взятое на прокат ювелирное изделие можно сразу после
            Оплаты услуги Проката в часы работы Магазина, в котором Вы его выбрали.
          </P2>

          <Line/>

          <H2 style={{ marginBottom: 0, marginTop: 10 }}>Место возврата:</H2>
          <P1 style={{ marginBottom: 0 }}>{orderResponse.back_place || ''}</P1>
          <ButtonText onPress={() => Actions.maps({
            shops: [
              {
                name: orderResponse.back_place,
                location: {
                  latitude: parseFloat(orderResponse.back_place_location.latitude) || 0,
                  longitude: parseFloat(orderResponse.back_place_location.longitude) || 0,
                },
              },
            ],
            shopInfo: shop,
          })}>
            Показать на карте
          </ButtonText>
          {
            orderResponse.back_place_opening_hours
              ? <OpeningHours hours={orderResponse.back_place_opening_hours}/> : null
          }

          <P2 style={{ marginBottom: 0, color: GRAY }}>
            Возврат ювелирного украшения должен быть осуществлен не позднее окончания
            10-ого календарного дня со дня начала проката в часы работы пункта приема.
          </P2>
          <Line/>

          <CabinetLink
            onPress={() => Actions.textPage({ title: 'Договор оферты', id: orderResponse.info.contract_id })}
            text="Договор оферты"
            subtext="Просьба внимательно ознакомиться с Договором Проката, регулирующим все
            взаимоотношения сторон по условиям Проката ювелирных украшений."
            icon
          />

          <H2 style={{ marginBottom: 0, marginTop: 10 }}>Возврат залоговой стоимости ювелирного изделия </H2>
          <P2 style={{ marginBottom: 0, color: GRAY }}>После окончания срока Проката и
            возврата ювелирного изделия, Вам будет
            возвращена залоговая стоимость за минусом стоимости услуги.</P2>

          <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <P3 style={{ marginBottom: 5 }}>Залоговая стоимость</P3>
              <H3 style={{
                marginBottom: 0, paddingTop: 0, color: GRAY, textTransform: 'none',
              }}>
                {this.isValidData(orderResponse)
                  ? `${orderResponse.calculate.deposit.price} руб.`
                  : '-'}
              </H3>
            </View>
            <View style={{ flex: 1 }}>
              <P3 style={{ marginBottom: 5 }}>Стоимость{'\n'}проката</P3>
              <H3 style={{
                marginBottom: 0, paddingTop: 0, color: GRAY, textTransform: 'none',
              }}>{this.isValidData(orderResponse)
                ? `${orderResponse.calculate.rent.price} руб.`
                : '-'}</H3>
            </View>
            <View style={{ flex: 1 }}>
              <P3 style={{ marginBottom: 5 }}>Сумма возврата по завершении проката</P3>
              <H3 style={{
                marginBottom: 0, paddingTop: 0, color: GRAY, textTransform: 'none',
              }}>{this.isValidData(orderResponse)
                ? `${orderResponse.calculate.return} руб.`
                : '-'}</H3>
            </View>
          </View>

          <Line/>

          <Selection
            label="Код сделки"
            value={code.toUpperCase() || 'No code'}
            style={{ borderColor: LIGHT_GRAY }}
            disabled
          />

          <P2 style={{ marginTop: 10, color: GRAY }}>
            Полные параметры нашего Коммерческого предложения вместе с
            Договором проката высланы Вам на Email, указанный при регистрации.
          </P2>

          {this.renderBottom(this.state.coundownFinish)}

        </View>

        <ModalSmall
          isVisible={this.state.declineReasonModal}
          onBackButtonPress={() => this.setState({ declineReasonModal: false })}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={'white'}
          avoidKeyboard={true}
          backdropOpacity={1}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <H2>Укажите причины</H2>
          </View>
          <P2>Указав причины возврата, Вы поможете сделать наш сервис лучше! </P2>
          <FloatInput
            label="Причина"
            onChangeText={v => this.updateInputState('reason', v)}
            value={this.state.controls.reason.value}
            fontSize={17}
            touched={this.state.controls.reason.touched}
            valid={this.state.controls.reason.valid}
            style={{ marginTop: 5 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'space-between' }}>
            <ButtonText style={{ flex: 1 }}
                        onPress={() => this.setState({ declineReasonModal: false })}>Отмена</ButtonText>
            <ButtonText style={{ flex: 1 }}
                        onPress={() => this.submitDecline()}>
              Пропустить
            </ButtonText>
            <ButtonText style={{ flex: 1 }}
                        onPress={() => this.submitDecline('reason')}>
              Отправить
            </ButtonText>
          </View>
          {this.state.showLoader
            ? <View style={styles.loaderStyle}>
              <Loading/>
            </View> : null
          }
        </ModalSmall>

        <ModalSmall
          isVisible={this.state.declineModal}
          onBackButtonPress={() => Actions.pop()}
          useNativeDriver={true}
          propagateSwipe={true}
          backdropColor={'white'}
          backdropOpacity={1}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <H2>Благодарим Вас</H2>
          </View>
          <P2>Мы обязательно постараемся учесть Ваш комментарий и улучшить наш сервис в будущем!</P2>
          <View style={{ flexDirection: 'row', alignItems: 'space-between' }}>
            <ButtonText style={{ flex: 1 }} onPress={() => Actions.pop()}>
              ОК
            </ButtonText>
          </View>
        </ModalSmall>
      </Layout>
    );
  }
}

const imgWidth = (WINDWIDTH / 3) - 17;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  imageStyle: {
    width: imgWidth,
    height: imgWidth,
    borderRadius: 5,
    marginRight: 5,
  },
  imagesContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  infoMessage: {
    paddingTop: 0,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 30,
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

const mapDispatchToProps = {
  showLoader,
  hideLoader,
};

export default connect(null, mapDispatchToProps)(OfferInfo);
