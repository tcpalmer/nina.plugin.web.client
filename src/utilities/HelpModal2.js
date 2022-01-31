import React from 'react';
import {Modal} from 'rsuite';

const usePrevious = (value) => {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const HelpModal2 = ({open, close}) => {
  const [openState, setOpenState] = React.useState(open);
  const lastOpen = usePrevious(open);
  React.useEffect(() => {
    if (open !== lastOpen) {
      setOpenState(open);
    }
  }, [open, lastOpen]);

  const handleClose = () => {
    setOpenState(false);
    close();
  };

  return (
      <div className="modal-container">
        <Modal open={open} onClose={handleClose} className={'help'}>
          <Modal.Header>
            <Modal.Title><h1>Help</h1></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Help Me!
            </p>
          </Modal.Body>
        </Modal>
      </div>
  );
};

export default HelpModal2;