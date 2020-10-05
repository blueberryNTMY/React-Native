import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import PriceCalc from '../screens/PriceCalc';
import {
  getCalcConstantsAction,
  calculatePriceAction,
} from '../reduxStore/actions/price-calc';

import { Loading, showAlert } from '../components/common';
import { showLoader, hideLoader } from '../reduxStore/actions/loaderToggle';

class PriceCalcContainer extends Component {
  componentDidMount() {
    this.props.getCalcConstantsAction().then(() => {
      if (this.props.calc_constants_error) {
        showAlert(
          'Error',
          this.props.calc_constants_error.response.statusText,
          [
            {
              text: 'OK',
              onPress: () => Actions.pop(),
            },
          ],
        );
      }
    });
  }

  render() {
    const {
      calc_constants_success: success,
      calc_constants_error: error,
    } = this.props;
    if (!error && success) {
      return <PriceCalc {...this.props} />;
    }
    if (error) {
      return null;
    }
    return <Loading fullPage />;
  }
}

const mapStateToProps = state => ({
  calc_constants_success: state.price_calc.calc_constants_success,
  calc_constants_error: state.price_calc.calc_constants_error,
  calculate_success: state.price_calc.calculate_success,
  calculate_error: state.price_calc.calculate_error,
  authData: state.auth.authData,
});
const mapDispatchToProps = {
  getCalcConstantsAction,
  calculatePriceAction,
  showLoader,
  hideLoader,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PriceCalcContainer);
