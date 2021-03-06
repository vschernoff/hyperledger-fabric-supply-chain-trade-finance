import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { Button } from '@blueprintjs/core';

import { useSocket } from 'use-socketio';
import { get } from '../helper/api';

import ShipmentDetailPage from './ShipmentDetailPage';

import Table from '../components/Table/Table';

import { TABLE_MAP, STATUSES } from '../constants';
import { filterData } from '../helper/utils';

import notifications from '../helper/notification';

import Loading from '../components/Loading';

const Shipments = ({
  role,
  filter,
  search,
  content,
  setContent,
  dataForFilter,
  setDataForFilter,
  filterOptions
}) => {
  // const [selectedShipment, setSelectedShipment] = useState({});
  const [shipment, showShipmentDetail] = useState(content);
  const [shipments, loading, setData] = get('listShipments');

  useSocket('notification', (message) => {
    setData(notifications(shipments.result, message, 'shipments'));
  });

  const onNotification = (message) => {
    const notification = JSON.parse(message);

    if (notification.type === 'confirmShipment' || notification.type === 'confirmDelivery') {
      if (
        shipment
        && shipment.state !== shipments.result.find(i => i.key.id === shipment.id).state
      ) {
        showShipmentDetail(
          Object.assign({}, shipment, {
            state: STATUSES.SHIPMENT[notification.data.value.state]
          })
        );
      }
    }
  };

  useSocket('notification', onNotification);

  if (loading) {
    return <Loading />;
  }

  let filteredData = shipments.result;

  if (!loading && filteredData && filteredData.length > 0) {
    filteredData = filteredData.map(i => Object.assign({}, i.value, {
      id: i.key.id,
      contractID: i.value.contract.key.id,
      state: STATUSES.SHIPMENT[i.value.state],
      documents: i.value.contract.value.documents,
      productName: i.value.contract.value.productName
    }));

    if (dataForFilter.length === 0) {
      setDataForFilter(filteredData);
    }

    filteredData = filterData({
      type: 'id',
      status: filter,
      search,
      filterOptions,
      tableData: filteredData
    });
  }

  return shipment ? (
    <ShipmentDetailPage
      showShipmentDetail={showShipmentDetail}
      setContent={setContent}
      shipment={shipment}
      role={role}
    />
  ) : (
    <div>
      <Table
        fields={TABLE_MAP.SHIPMENTS}
        data={filteredData}
        onSelect={(item) => {
          setContent(item);
        }}
      />
    </div>
  );
};

export default Shipments;

Shipments.propTypes = {
  role: PropTypes.string
};
