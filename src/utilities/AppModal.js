import React from 'react';
import {Modal} from 'rsuite';

const AppModal = (props) => {

  // TODO: at phone widths, this is too wide

  const {open, handleClose, title, children} = props;

  return (
      <div>
        <Modal open={open} onClose={handleClose} className="modal">
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
