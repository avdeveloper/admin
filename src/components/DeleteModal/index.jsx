import React from 'react';
import { Modal, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './style.scss';


const DeleteModal = ({
  idForDelete,
  onClose,
  deleteFunction,
  pending,
  objectDelete,
}) => (
  <Modal
    isOpen={!!idForDelete}
    toggle={onClose}
    centered
  >
    <div className="modal__content">
      <div className={classnames({
        'modal__deleting--hide': !pending,
        modal__deleting: pending,
      })}
      >
        <Spinner />
      </div>
      <span className="modal__text">
        {`Are you sure you want to delete this ${objectDelete} ?`}
      </span>
      <div className="modal__buttons-block">
        <button
          type="button"
          className="modal__button"
          onClick={() => deleteFunction(idForDelete)}
        >
       Yes
        </button>
        <button
          type="button"
          className="modal__button"
          onClick={onClose}
        >
       No
        </button>
      </div>
    </div>
  </Modal>
);

DeleteModal.propTypes = {
  idForDelete: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
  deleteFunction: PropTypes.func.isRequired,
  objectDelete: PropTypes.string.isRequired,
};

export default DeleteModal;
