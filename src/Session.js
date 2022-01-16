import React from 'react';
import Target from './Target';
import {Badge, Message} from 'rsuite';

const consola = require('consola');

class Session extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {sessionHistory, sessionName, sessionPath} = this.props;
    consola.trace('Session: render');

    if (!sessionHistory) {
      return null;
    }

    const badge = sessionHistory.activeTargetId ? 'live' : false;

    return <div>
      <Badge content={badge}>
        <Message className="session-name">Selected Session: {sessionName}</Message>
      </Badge>
      {sessionHistory.targets.map(target => (
          <Target key={target.id} target={target} sessionPath={sessionPath}/>
      ))}
    </div>;
  }

}

export default Session;
