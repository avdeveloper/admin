import { fork, all } from 'redux-saga/effects';

import authSaga from './authentication';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
  ]);
}

export {
  authSaga,
};
