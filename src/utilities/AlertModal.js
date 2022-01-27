import React from 'react';
import {Button, Modal} from 'rsuite';
import {RemindFill} from '@rsuite/icons';

function AlertModalWrapper(props) {
  if (!props.enabled) {
    return null;
  }

  return <AlertModal key={new Date()} message={props.message}/>;
}

function AlertModal(props) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);
  const {message} = props;

  return <Modal backdrop={true} role="alertdialog" open={open} onClose={handleClose} size="xs">
    <Modal.Body>
      <RemindFill
          style={{
            color: '#ffb300',
            fontSize: 24,
          }}
      />
      {message}
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose} appearance="primary">Ok</Button>
    </Modal.Footer>
  </Modal>;
}

export default AlertModalWrapper;
