import { useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line import/prefer-default-export
export const useAsyncEndpoint = (fn) => {
  const [res, setRes] = useState({
    data: null,
    complete: false,
    pending: false,
    error: false
  });
  const [req, setReq] = useState();
  const r = () => setRes({
    data: null,
    complete: false,
    pending: false,
    error: false
  });
  useEffect(() => {
    if (!req) {
      return;
    }
    setRes({
      data: null,
      pending: true,
      error: false,
      complete: false
    });
    axios(req)
      .then(resp => setRes({
        data: resp.data,
        pending: false,
        error: false,
        complete: true
      }))
      .catch(() => setRes({
        data: null,
        pending: false,
        error: true,
        complete: true
      }));
  }, [req]);

  return [res, (...args) => setReq(fn(...args)), r];
};
