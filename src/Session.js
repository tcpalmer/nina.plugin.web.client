import React from 'react';
import Target from './Target';
import {Badge, Message} from 'rsuite';

const consola = require('consola');

class Session extends React.Component {

  constructor(props) {
    super(props);
    this.state = {count: 1};
  }

  getTargetKey(target) {
    return target.id + '_' + Math.random().toString();
  }

  isActive(target) {
    return this.props.sessionHistory.activeTargetId === target.id;
  }

  // TODO: possible to show loading spinner when a new session is loading?
  //   after adding the auto-expand for active session, looks like you get an undesired re-render when switching

  render() {
    const {sessionHistory, sessionName, sessionDisplay, sessionPath} = this.props;
    consola.trace('Session: render');

    if (!sessionHistory) {
      return null;
    }

    const badge = sessionHistory.activeTargetId ? 'live' : false;

    return <div>
      <Badge content={badge}>
        <Message className="session-name">Session: {sessionDisplay}</Message>
      </Badge>
      {sessionHistory.targets.map(target => (
          <Target key={this.getTargetKey(target)} active={this.isActive(target)} target={target} sessionPath={sessionPath}/>
      ))}
    </div>;
  }

}

export default Session;
