import React from 'react';
import {SettingsManager} from './SettingsManager';
import {Button, ButtonToolbar, Divider, Form, Modal, Radio, RadioGroup, Schema} from 'rsuite';
import {BooleanType, MixedType} from 'schema-typed';

const SettingsForm = (props) => {
  const {open, handleClose} = props;
  const settingsManager = new SettingsManager();

  const formRef = React.useRef();
  const [formError, setFormError] = React.useState({});
  const [formValue, setFormValue] = React.useState({
    imageScale: settingsManager.getImageScale(),
    imageQuality: settingsManager.getImageQuality(),
    autoStretchFactor: settingsManager.getAutoStretchFactor(),
    blackClipping: settingsManager.getBlackClipping(),
    unlinkedStretch: settingsManager.getUnlinkedStretch(),
  });

  const handleSubmit = () => {

    if (!formRef.current.check()) {
      return;
    }

    settingsManager.setImageScale(formValue[settingsManager.imageScaleKey]);
    settingsManager.setImageQuality(formValue[settingsManager.imageQualityKey]);
    settingsManager.setAutoStretchFactor(formValue[settingsManager.autoStretchFactorKey]);
    settingsManager.setBlackClipping(formValue[settingsManager.blackClippingKey]);
    settingsManager.setUnlinkedStretch(formValue[settingsManager.unlinkedStretchKey]);

    handleClose();
  };

  return (
      <div>
        <Modal open={open} onClose={handleClose} className="modal" backdrop="static" keyboard={false}>
          <Modal.Header closeButton={false}>
            <Modal.Title><h1>Settings</h1></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Divider/>
            <h2>Image Generation</h2>
            <p>The following settings control the generation of full-sized images in the image viewer. See the Help page for details.</p>
            <h2/>
            <Form
                ref={formRef}
                onChange={setFormValue}
                onCheck={setFormError}
                formValue={formValue}
                model={model}
            >
              <TextField name="imageScale" label="Image Scale"/>
              <TextField name="imageQuality" label="Image Quality"/>
              <TextField name="autoStretchFactor" label="Stretch Factor"/>
              <TextField name="blackClipping" label="Black Clipping"/>

              <BooleanField
                  name="unlinkedStretch"
                  label="Unlinked Stretch"
                  accepter={RadioGroup}
                  error={formError.unlinkedStretch}
                  inline
              >
                <Radio value={true}>On</Radio>
                <Radio value={false}>Off</Radio>
              </BooleanField>

              <Divider/>
              <ButtonToolbar>
                <Button appearance="primary" onClick={handleSubmit}>Submit</Button>
                <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
              </ButtonToolbar>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
  );
};

const TextField = React.forwardRef((props, ref) => {
  const {name, label, accepter, ...rest} = props;
  return (
      <Form.Group controlId={name} ref={ref}>
        <Form.ControlLabel>{label} </Form.ControlLabel>
        <Form.Control name={name} accepter={accepter} {...rest} />
      </Form.Group>
  );
});

const BooleanField = React.forwardRef((props, ref) => {
  const {name, message, label, accepter, error, ...rest} = props;
  return (
      <Form.Group controlId={name} ref={ref} className={error ? 'has-error' : ''}>
        <Form.ControlLabel>{label} </Form.ControlLabel>
        <Form.Control name={name} accepter={accepter} errorMessage={error} {...rest} />
        <Form.HelpText>{message}</Form.HelpText>
      </Form.Group>
  );
});

// Schema NumberType doesn't accept values with a leading or trailing decimal point so '.1' is bad - that's why we have to use base MixedType to do it.

const regex = (value) => {
  return /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(value);
};

const range = (min, max, value) => {
  return value >= min && value <= max;
};

const model = Schema.Model({
  imageScale: MixedType().
      addRule((value, data) => { return regex(value); }, 'must be a number').
      addRule((value, data) => { return range(0, 1, value); }, 'must be 0-1').
      isRequired('required'),
  imageQuality: MixedType().
      addRule((value, data) => { return regex(value); }, 'must be a number').
      addRule((value, data) => { return range(10, 100, value); }, 'must be 10-100').
      isRequired('required'),
  autoStretchFactor: MixedType().
      addRule((value, data) => { return regex(value); }, 'must be a number').
      addRule((value, data) => { return range(0, 1, value); }, 'must be 0-1').
      isRequired('required'),
  blackClipping: MixedType().
      addRule((value, data) => { return regex(value); }, 'must be a number').
      isRequired('required'),
  unlinkedStretch: BooleanType(),
});

export default SettingsForm;
