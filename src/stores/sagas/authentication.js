import {
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import axios from 'axios';
import get from 'lodash/get';

import {
  SAVE_CURRENT_USER,
  SIGN_IN,
  SIGN_UP,
  IS_LOGIN,
  LOG_OUT,
  CLEAR_CURRENT_USER,
  CREATE_USER,
  DELETE_USER,
  UPDATE_USER,
} from '../constants/auth';
import adapter from '../adapter';

function onAuthStateChanged() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const currentUser = await firebase.firestore().collection('users').doc(user.uid);
        currentUser.get()
          .then((res) => {
            resolve({ ...res.data(), email: user.email, id: user.uid });
          });
      } else {
        reject(new Error('Ops!'));
      }
    });
  });
}

const HANDLERS = {
  * [SIGN_IN](data) {
    try {
      yield put({ type: SAVE_CURRENT_USER, payload: data });
      localStorage.setItem('isAuth', true);
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  * [SIGN_UP](defer, data) {
    try {
      yield call(adapter, {
        method: 'post',
        url: '/auth/signup',
        headers: {
          'content-type': 'application/json',
        },
        data,
      });

      yield HANDLERS[SIGN_IN](defer, { username: data.username, password: data.password });
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signUpRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  * [IS_LOGIN]() {
    try {
      const result = yield call(onAuthStateChanged);
      if (result) {
        yield put({ type: SAVE_CURRENT_USER, payload: result });
        localStorage.setItem('isAuth', true);
      } else {
        window.location.pathname = '/';
        localStorage.setItem('isAuth', false);
      }
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  * [LOG_OUT]() {
    try {
      yield firebase.auth().signOut();
      yield put({ type: CLEAR_CURRENT_USER });
      window.location.pathname = '/';
      localStorage.setItem('isAuth', false);
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  [CREATE_USER](data) {
    try {
      axios({
        method: 'post',
        url: 'api/user/add/',
        withCredentials: true,
        data: {
          email: data.email,
          password: data.password,
          disabled: data.disabled,
        },
      })
        .then((res) => {
          if (get(res, 'data.error') !== undefined) {
            data.reject(res.data.error);
          }

          if (get(res, 'data.userUid') !== undefined) {
            data.resolve(get(res, 'data.userUid'));
          }
        });
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  [UPDATE_USER](data) {
    try {
      axios({
        method: 'post',
        url: 'api/user/update/',
        withCredentials: true,
        data: {
          uid: data.uid,
          email: data.email,
          disabled: data.disabled,
        },
      })
        .then((res) => {
          if (get(res, 'data.error') !== undefined) {
            data.reject(res.data.error);
          }

          if (get(res, 'data.userUid') !== undefined) {
            data.resolve(get(res, 'data.userUid'));
          }
        });
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
  [DELETE_USER](uid) {
    try {
      axios({
        method: 'delete',
        url: 'api/user/delete/',
        withCredentials: true,
        data: {
          uid,
        },
      });
    } catch (err) {
      if (err.response != null) {
        const error = new Error(`Store::AuthSagas:signInRequest Request failed with status ${err.response.status} and message ${err.response.data.message}`);
        error.errorMessage = err.response.data.message;
        console.log(error);
      } else {
        console.log(err);
      }
    }
  },
};

export function* switchSagasAuth({ type, payload }) {
  const handler = HANDLERS[type];

  if (handler != null) yield* handler(payload);
}

export default function* sagaReducerAuth() {
  yield takeEvery('*', switchSagasAuth);
}
