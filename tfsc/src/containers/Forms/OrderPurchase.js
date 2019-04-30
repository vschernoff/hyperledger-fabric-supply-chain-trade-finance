import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Overlay, FormGroup, InputGroup, Card, Label
} from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';

import { post } from '../../helper/api';

import ActionCompleted from '../../components/ActionCompleted';

import { INPUTS } from '../../constants';

import { formReducer } from '../../reducers';

const OrderForm = ({ dialogIsOpen, setDialogOpenState }) => {
  const initialState = {
    productName: '',
    quantity: 0,
    price: 0,
    destinationPort: '',
    dueDate: new Date()
  };
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const [newOrder, placeOrder, reset] = post('placeOrder')();

  if (!newOrder.pending) {
    if (newOrder.complete) {
      setTimeout(() => {
        setDialogOpenState(false);
        reset();
      }, 1500);
    }
  }

  const handleOverlayClose = () => setDialogOpenState(false);

  return (
    <Overlay usePortal canOutsideClickClose isOpen={dialogIsOpen} onClose={handleOverlayClose}>
      <Card style={{ width: '20vw' }}>
        <ActionCompleted res={newOrder} action="New Order Purchased" result="Accepted" />
        {!newOrder.pending && !newOrder.complete && !newOrder.data ? (
          <>
            {INPUTS.NEW_PURCHASE_ORDER.map(({
              label, type, placeholder, field
            }) => (
              <FormGroup key={label} label={label}>
                <InputGroup
                  type={type}
                  placeholder={placeholder}
                  value={formState[field]}
                  onChange={({ target: { value } }) => dispatch({
                    type: 'change',
                    payload: {
                      field,
                      value
                    }
                  })
                  }
                />
              </FormGroup>
            ))}
            <Label>
              Due Date
              <DateInput
                value={formState.dueDate}
                formatDate={date => date.toLocaleDateString()}
                onChange={(date) => {
                  dispatch({
                    type: 'change',
                    payload: {
                      field: 'dueDate',
                      value: date
                    }
                  });
                }}
                timePrecision={undefined}
                parseDate={str => new Date(str)}
                placeholder={'D/M/YYYY'}
              />
            </Label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                large
                intent="primary"
                onClick={() => {
                  dispatch({ type: 'reset', payload: initialState });
                  placeOrder(formState);
                }}
              >
                Order
              </Button>
            </div>
          </>
        ) : (
          <></>
        )}
      </Card>
    </Overlay>
  );
};

OrderForm.propTypes = {
  dialogIsOpen: PropTypes.bool,
  setDialogOpenState: PropTypes.func
};

export default OrderForm;
