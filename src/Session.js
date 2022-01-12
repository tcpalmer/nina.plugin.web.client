import React from 'react';
import Target from './Target';
import {PanelGroup} from 'rsuite';

const consola = require('consola');

class Session extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {sessionHistory, sessionPath} = this.props;
    consola.trace('Session render');

    if (!sessionHistory) {
      return null;
    }

    return <div>
        {sessionHistory.targets.map(target => (
            <Target key={target.id} target={target} sessionPath={sessionPath}/>
        ))}
    </div>;
  }

}

export default Session;
