import React from 'react';
import className from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spinner } from 'reactstrap';

import { isLogin } from '../../stores/action/auth';
import './homePage.scss';
import config from '../../constants/firebaseConfig';


class HomePage extends React.PureComponent {
  static propsTypes = {
    isLogin: PropTypes.func,
  }

  constructor(props) {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    super(props);
    this.state = {
      appName: '',
      topText: '',
      bottomText: '',
      aboutText: '',
      errMsg: '',
      isUpdateData: false,
      pending: false,
      succesfullMsg: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.changeRemoteData = this.changeRemoteData.bind(this);
    this.db = firebase.firestore();
  }

  componentDidMount() {
    const {
      isLogin,
    } = this.props;
    isLogin();
    this.db.collection('settings').doc('homepage').get()
      .then(doc => this.setState({
        ...doc.data(),
        isUpdateData: true,
      }));

    this.db.collection('settings').doc('about').get()
      .then(doc => this.setState({
        ...doc.data(),
        isUpdateData: true,
      }));
  }

  handleChange({ target }) {
    this.setState({
      errMsg: '',
      [target.name]: target.value,
    });
  }

  async changeRemoteData() {
    const {
      appName,
      topText,
      bottomText,
      aboutText,
    } = this.state;

    if (!appName.trim() || !topText.trim() || !bottomText.trim() || !aboutText.trim()) {
      this.setState({
        errMsg: 'Please fill in all fields.',
        appName: appName.trim(),
        topText: topText.trim(),
        bottomText: bottomText.trim(),
      });
      return false;
    }

    this.setState({
      pending: true,
    });

    try {
      await this.db.collection('settings').doc('homepage').update({
        appName,
        topText,
        bottomText,
      })
  
      await this.db.collection('settings').doc('about').set({
        aboutText,
      })

      this.setState({
        succesfullMsg: 'Data successfully updated',
      });

      setTimeout(() => {
        this.setState({
          succesfullMsg: '',
        });
      }, 1000);
    } catch {
      this.setState({
        errMsg: 'Update error',
      });
    }
      

    this.setState({
      pending: false,
    });

    return false;
  }

  render() {
    const {
      appName,
      topText,
      bottomText,
      errMsg,
      isUpdateData,
      pending,
      aboutText,
      succesfullMsg,
    } = this.state;

    return (
      <form className="homepage">

        <div className="homepage__input-block">
        App Name:
          <input
            className={
              className(
                'homepage__input',
                {
                  'homepage__input--error': !!errMsg && !appName.trim(),
                },
              )}
            onChange={this.handleChange}
            value={appName}
            name="appName"
          />
        </div>

        <div className="homepage__input-block">
        Top Text:
          <input
            className={
              className(
                'homepage__input',
                {
                  'homepage__input--error': !!errMsg && !topText.trim(),
                },
              )}
            onChange={this.handleChange}
            value={topText}
            name="topText"
          />
        </div>

        <div className="homepage__input-block">
        Bottom text:
          <input
            className={
              className(
                'homepage__input',
                {
                  'homepage__input--error': !!errMsg && !bottomText.trim(),
                },
              )}
            onChange={this.handleChange}
            value={bottomText}
            name="bottomText"
          />
        </div>

        <hr />

        <div className="homepage__input-block">
        About text:
          <input
            className={
              className(
                'homepage__input',
                {
                  'homepage__input--error': !!errMsg && !aboutText.trim(),
                },
              )}
            onChange={this.handleChange}
            value={aboutText}
            name="aboutText"
          />
        </div>

        <div className="homepage__save-block">
          <button
            className="homepage__save-button"
            type="button"
            onClick={this.changeRemoteData}
            disabled={!isUpdateData}
          >
          Save
          </button>
          {pending && <Spinner />}
        </div>
        <div className={className({
          "homepage__err-message": errMsg,
          "homepage__ok-message": succesfullMsg,
        })}>
          {errMsg}{succesfullMsg}
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  isLogin: () => dispatch(isLogin()),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
