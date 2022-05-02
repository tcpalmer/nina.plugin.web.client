import React from 'react';
import Target from './Target';
import {Badge, Message} from 'rsuite';
import {Api1020} from './utilities/Api1020';
import ImageViewer from './ImageViewer';
import AlertModalWrapper from './utilities/AlertModal';
import {SettingsManager} from './utilities/SettingsManager';
import EventChart from './EventChart';

const consola = require('consola');

class Session extends React.Component {

  settingsManager = null;

  constructor(props) {
    super(props);

    this.state = {
      imageViewerOpen: false,
      showAlert: false,
      api: new Api1020(),
    };

    this.settingsManager = new SettingsManager();
  }

  isActive(target) {
    return this.props.sessionHistory.activeTargetId === target.id;
  }

  handleImageClick = (imageRecord) => {

    if (!this.props.sessionHistory) {
      return null;
    }

    this.state.api.imageCreate(this.props.sessionHistory, this.props.sessionName, this.settingsManager, imageRecord, (response, image) => {
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

  getTarget(target, targetKey, sessionPath) {
    const key = this.isActive(target) ? target.id + '_' + targetKey : target.id;
    return <Target key={key} active={this.isActive(target)} target={target} sessionPath={sessionPath} imageClick={this.handleImageClick}/>;
  }

  render() {
    const {imageViewerOpen, showAlert, alertMessage, imageRecord, imageSrc} = this.state;
    const {sessionHistory, sessionName, sessionDisplay, sessionUpdatedKey, sessionPath} = this.props;

    if (!sessionHistory) {
      return null;
    }

    consola.trace(`session render: ${sessionName} version ${sessionHistory.sessionVersion}`);

    const badge = (sessionHistory.activeSession || sessionHistory.activeTargetId) ? 'live' : false;
    const eventChartKey = `ec-${sessionHistory.id}`;
    const profileName = sessionHistory.profileName;

    return <div>
      <Badge content={badge}>
        <Message className="session-name">
          <div>Session: {sessionDisplay}</div>
          <div className="profile-name">{profileName}</div>
        </Message>
      </Badge>

      <EventChart key={eventChartKey} sessionHistory={sessionHistory} sessionPath={sessionPath}/>

      {sessionHistory.targets.map(target => (
          this.getTarget(target, sessionUpdatedKey, sessionPath)
      ))}

      {imageViewerOpen &&
      <ImageViewer imageRecord={imageRecord} imageSrc={imageSrc} onClose={this.closeImageViewer}/>
      }

      <AlertModalWrapper enabled={showAlert} message={alertMessage}/>

    </div>;
  }

}

export default Session;
