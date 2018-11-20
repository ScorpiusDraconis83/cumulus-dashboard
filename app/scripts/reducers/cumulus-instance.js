'use strict';
import { set } from 'object-path';

import {
  ADD_CMR
} from '../actions';

export const initialState = {};

export default function reducer (state = initialState, action) {
  state = { ...state };
  const { data } = action;
  switch (action.type) {
    case ADD_CMR:
      if (data.cmr.environment) set(state, 'cmrEnvironment', data.cmr.environment);
      if (data.cmr.provider) set(state, 'cmrProvider', data.cmr.provider);
      break;

  }
  return state;
}
