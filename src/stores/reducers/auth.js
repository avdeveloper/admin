import {
  SAVE_CURRENT_USER,
  CLEAR_CURRENT_USER,
} from '../constants/auth';

const HANDLERS = {
  [SAVE_CURRENT_USER]: (state, action) => ({
    ...state,
    currentUser: action.payload,
    isAuthenticated: true,
  }),
  [CLEAR_CURRENT_USER]: state => ({
    ...state,
    currentUser: null,
    isAuthenticated: false,
  }),
};

const initialState = {
  isAuthenticated: false,
  currentUser: null,
};

export default function authReducer(state = initialState, action) {
  const handler = HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
