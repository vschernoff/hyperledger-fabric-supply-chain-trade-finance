import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';

import { useSocket } from 'use-socketio';
import { useFetch } from '../hooks';

import VerifyProof from './Forms/VerifyProof';
import Table from '../components/Table/Table';
import { TABLE_MAP, STATUSES } from '../constants';

const Proofs = ({ role }) => {
  const [vpDialogIsOpen, setVpDialogOpenState] = useState(false);
  const [proofs, loading, setData] = useFetch('listProofs');

  const [selectedProof, setSelectedProof] = useState({});
  const onNotification = (message) => {
    const notification = JSON.parse(message);

    if (notification.type === 'proof') {
      const newState = proofs.concat([]);
      const itemToUpdateIndex = newState.findIndex(i => i.contractId === notification.contractId);
      newState[itemToUpdateIndex] = notification;
      setData(newState);
    }

    if (notification.type === 'validateProof') {
      const newState = proofs.concat([]);
      const itemToUpdateIndex = newState.findIndex(i => i.proofId === notification.proofId);
      newState[itemToUpdateIndex] = notification;
      setData(newState);
    }
  };

  useSocket('notification', onNotification);

  let dataToDisplay = proofs.result;

  if (dataToDisplay) {
    dataToDisplay = dataToDisplay.map(i => Object.assign({}, i.value, { id: i.key.id, state: STATUSES.PROOF[i.value.state] }));
  }

  return loading ? (
    <>Loading...</>
  ) : (
    <div>
      <VerifyProof
        dialogIsOpen={vpDialogIsOpen}
        setDialogOpenState={setVpDialogOpenState}
        proof={selectedProof}
        role={role}
      />
      <Table
        fields={TABLE_MAP.PROOFS}
        data={dataToDisplay}
        actions={item => (item.state === 'Generated' ? (
            <div>
              <Button
                onClick={() => {
                  setSelectedProof(item);
                  setVpDialogOpenState(true);
                }}
                style={{ marginRight: '5px' }}
                intent="primary"
              >
                Verify {role === 'uscts' ? 'Commertial Trade' : 'Goods'}
              </Button>
            </div>
        ) : (
            <></>
        ))
        }
      />
    </div>
  );
};

export default Proofs;

Proofs.propTypes = {
  role: PropTypes.string
};
