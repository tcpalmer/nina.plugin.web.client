import React from 'react';
import {Modal} from 'rsuite';
import {getModalSize} from './utils';

const AppModal = (props) => {

  const {open, handleClose, title, children} = props;

  return (
      <div>
        <Modal size={getModalSize()} open={open} onClose={handleClose} className="modal">
          <Modal.Header>
            <Modal.Title><h1>{title}</h1></Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {children}
          </Modal.Body>
        </Modal>
      </div>
  );
};

export default AppModal;
