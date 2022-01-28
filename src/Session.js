import React from 'react';
import Target from './Target';
import {Badge, Message} from 'rsuite';
import {Api1020} from './utilities/Api1020';
import ImageViewer from './ImageViewer';
import AlertModalWrapper from './utilities/AlertModal';

const consola = require('consola');

class Session extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imageViewerOpen: false,
      showAlert: false,
      api: new Api1020(),
    };
  }

  isActive(target) {
    return this.props.sessionHistory.activeTargetId === target.id;
  }

  handleImageClick = (imageRecord) => {

    if (!this.props.sessionHistory) {
      return null;
    }

    this.state.api.imageCreate(this.props.sessionHistory, this.props.sessionName, imageRecord, (response, image) => {
      if (response.ok) {
        this.setState({imageViewerOpen: true, showAlert: false, imageRecord: imageRecord, imageSrc: image.urlPath});
      } else {
        const msg = `Original image unavailable or failed to load.  Also be sure NINA is running and the Web plugin is enabled.  (Image: ${imageRecord.fullPath})`;
        this.setState({imageViewerOpen: false, showAlert: true, alertMessage: msg});
      }
    });
  };

  closeImageViewer = () => {
    this.setState({imageViewerOpen: false, showAlert: false, imageRecord: null, imageSrc: null});
  };

  render() {
    const {imageViewerOpen, showAlert, alertMessage, imageRecord, imageSrc} = this.state;
    const {sessionHistory, sessionName, sessionDisplay, sessionPath} = this.props;

    if (!sessionHistory) {
      return null;
    }

    consola.trace('Session: render: ' + sessionName);

    const badge = sessionHistory.activeTargetId ? 'live' : false;

    return <div>
      <Badge content={badge}>
        <Message className="session-name">Session: {sessionDisplay}</Message>
      </Badge>

      {sessionHistory.targets.map(target => (
          <Target key={target.id} active={this.isActive(target)} target={target} sessionPath={sessionPath} imageClick={this.handleImageClick}/>
      ))}

      {imageViewerOpen &&
      <ImageViewer imageRecord={imageRecord} imageSrc={imageSrc} onClose={this.closeImageViewer}/>
      }

      <AlertModalWrapper enabled={showAlert} message={alertMessage}/>

    </div>;
  }

}

export default Session;
