/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, SafeAreaView, SectionList, Text } from 'react-native';
import LayoutWithMenuAndTitle from '../../components/layouts/LayoutWithMenuAndTitle';
import {
  PX20,
  PX10,
  PX25,
  PX24,
  MEDIUM_FONT,
  WHITE,
  GRAY_LIGHT,
} from '../../constants';
import NoItems from '../../components/common/noItems';
import QuestionMarkBtn from '../../components/common/QuestionMarkBtn';
import { Loading } from '../../components/common';
import BiomarkerItem from '../biomarkers/BiomarkerItem';

const Report = ({
  filters,
  title,
  onFilter,
  allBiomarkersList,
  allBiomarkersListError,
  loading,
  onSearch,
  selectedUser,
  onUpdate,
  lazyLoading,
  isSearch,
}) => {
  const renderNoContent = section => {
    if (section.data.length === 0) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: WHITE,
            marginBottom: PX20,
            marginTop: selectedUser ? PX20 : 0,
          }}>
          <NoItems title={'Нет биомаркеров'} />
        </View>
      );
    }
  };

  return (
    <LayoutWithMenuAndTitle
      title={title ? title : 'Биомаркеры'}
      navigation={false}
      filters={filters}
      rightButton={<QuestionMarkBtn />}
      simpleRightButton={true}
      onFilter={key => onFilter(key)}
      selectedUser={selectedUser}
      loading={!allBiomarkersList && !allBiomarkersListError}
      style={{ paddingTop: PX10, fontSize: PX25 }}
      filterSearch
      ifScrollNeed={false}
      onSearch={onSearch}>
      {loading ? (
        <Loading />
      ) : (
        <>
          {allBiomarkersList.data && allBiomarkersList.data.length > 0 ? (
            <>
              <SafeAreaView
                style={{ flex: 1, marginTop: selectedUser ? PX25 : 0 }}>
                <SectionList
                  sections={allBiomarkersList.data.reduce((r, s) => {
                    r.push({ title: s.name, data: s.result });
                    return r;
                  }, [])}
                  keyExtractor={(item, index) => item + index}
                  renderSectionHeader={({ section }) => {
                    return (
                      <Text
                        style={{
                          ...MEDIUM_FONT,
                          fontSize: PX24,
                          backgroundColor: GRAY_LIGHT,
                        }}>
                        {section.title}
                      </Text>
                    );
                  }}
                  renderItem={({ item }) => {
                    return (
                      <BiomarkerItem
                        item={item}
                        periods={allBiomarkersList.periods}
                      />
                    );
                  }}
                  renderSectionFooter={({ section }) =>
                    renderNoContent(section)
                  }
                  // onEndReached={() => (!isSearch ? onUpdate() : null)}
                  onMomentumScrollEnd={() => (!isSearch ? onUpdate() : null)}
                  onEndReachedThreshold={0.4}
                  ListFooterComponent={() => (lazyLoading ? <Loading /> : null)}
                />
              </SafeAreaView>
            </>
          ) : (
            <NoItems
              title={
                allBiomarkersListError
                  ? 'Ошибка загрузки биомаркеров'
                  : 'Нет биомаркеров'
              }
            />
          )}
        </>
      )}
    </LayoutWithMenuAndTitle>
  );
};

export default Report;
