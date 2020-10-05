import React, { Component } from 'react';
import { InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import {
  getAllBiomarkersAction,
  getAllUserBiomarkersAction,
  cleanBiomarkersList,
} from '../../reduxStore/actions/biomarkers';
import Report from '../../screens/report/Report';

const filters = [
  {
    title: 'Все',
    key: 'all',
  },
  {
    title: 'Отклонения',
    key: 'deviation',
  },
];

class ReportContainer extends Component {
  state = {
    searchLoad: false,
    searchText: null,
    loading: true,
    filter: 'all',
    page: 0,
    lazyLoading: false,
    isSearch: false,
  };

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (this.props.selectedPatient) {
        this.props
          .getAllUserBiomarkersAction(
            this.props.selectedPatient.guid, //guid
            this.state.page, //page
            undefined, //scale
            undefined, //searchName
            undefined, //onlyDeviation
          )
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      } else {
        this.props
          .getAllBiomarkersAction(
            undefined, //scale
            undefined, //searchName
            this.state.page, //page
            undefined, //onlyDeviation
          )
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      }
    });
  }

  onFilter = filter => {
    if (filter !== this.state.filter) {
      this.props.cleanBiomarkersList();
      this.setState(
        {
          loading: true,
          filter: filter,
          page: 1,
        },
        () => {
          if (this.props.selectedPatient) {
            this.props
              .getAllUserBiomarkersAction(
                this.props.selectedPatient.guid,
                this.state.page,
                undefined,
                undefined,
                filter === 'all' ? 0 : 1,
              )
              .finally(() => {
                this.setState({
                  loading: false,
                });
              });
          } else {
            this.props
              .getAllBiomarkersAction(
                undefined,
                undefined,
                this.state.page,
                filter === 'all' ? 0 : 1,
              )
              .finally(() => {
                this.setState({
                  loading: false,
                });
              });
          }
        },
      );
    }
  };

  sendSearch(value) {
    this.setState(
      {
        searchLoad: true,
        searchText: value,
        isSearch: value ? true : false,
      },
      () => {
        if (this.props.selectedPatient) {
          this.props.cleanBiomarkersList();
          this.props
            .getAllUserBiomarkersAction(
              this.props.selectedPatient.guid,
              undefined,
              undefined,
              value,
              this.state.filter === 'all' ? 0 : 1,
            )
            .finally(() => {
              this.setState({
                searchLoad: false,
              });
            });
        } else {
          this.props.cleanBiomarkersList();
          this.props
            .getAllBiomarkersAction(
              undefined,
              value,
              undefined,
              this.state.filter === 'all' ? 0 : 1,
            )
            .finally(() => {
              this.setState({
                searchLoad: false,
              });
            });
        }
      },
    );
  }

  onUpdate = () => {
    this.setState(
      {
        isSearch: false,
        page: this.state.page + 1,
        lazyLoading: true,
      },
      () => {
        if (this.props.selectedPatient) {
          this.props
            .getAllUserBiomarkersAction(
              this.props.selectedPatient.guid,
              this.state.page,
              undefined,
              this.state.filter === 'all' ? 0 : 1,
            )
            .finally(() => {
              this.setState({ lazyLoading: false });
            });
        } else {
          this.props
            .getAllBiomarkersAction(
              undefined,
              undefined,
              this.state.page,
              this.state.filter === 'all' ? 0 : 1,
            )
            .finally(() => {
              this.setState({ lazyLoading: false });
            });
        }
      },
    );
  };

  componentWillUnmount() {
    this.props.cleanBiomarkersList();
  }

  render() {
    return (
      <Report
        filters={filters}
        onSearch={value => this.sendSearch(value)}
        onUpdate={this.onUpdate}
        loading={this.state.loading || this.state.searchLoad}
        title={this.props.title || ''}
        allBiomarkersList={this.props.allBiomarkersList}
        allBiomarkersListError={this.props.allBiomarkersListError}
        onFilter={this.onFilter}
        selectedUser={this.props.selectedPatient}
        lazyLoading={this.state.lazyLoading}
        isSearch={this.state.isSearch}
      />
    );
  }
}

const mapStateToProps = state => ({
  allBiomarkersList: state.biomarkers.allBiomarkersList,
  allBiomarkersListError: state.biomarkers.allBiomarkersListError,
  scales: state.biomarkers.scales,
  scalesError: state.biomarkers.scalesError,
  selectedPatient: state.patients.selectedPatient,
});

const mapDispatchToProps = {
  getAllBiomarkersAction,
  cleanBiomarkersList,
  getAllUserBiomarkersAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReportContainer);
