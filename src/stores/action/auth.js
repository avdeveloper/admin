import {
  SIGN_IN,
  SIGN_UP,
  IS_LOGIN,
  LOG_OUT,
  CREATE_USER,
  DELETE_USER,
  UPDATE_USER,
  SAVE_CURRENT_USER,
} from '../constants/auth';

export const signIn = payload => ({
  type: SIGN_IN,
  payload,
});

export const signUp = payload => ({
  type: SIGN_UP,
  payload,
});

export const isLogin = payload => ({
  type: IS_LOGIN,
  payload,
});

export const signOut = payload => ({
  type: LOG_OUT,
  payload,
});

export const createUser = payload => ({
  type: CREATE_USER,
  payload,
});

export const deleteUser = payload => ({
  type: DELETE_USER,
  payload,
});

export const updateUser = payload => ({
  type: UPDATE_USER,
  payload,
});
export const updateUserLocal = payload => ({
  type: SAVE_CURRENT_USER,
  payload,
});
