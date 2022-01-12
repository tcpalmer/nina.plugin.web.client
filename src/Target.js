import React from 'react';
import ImageTable from './ImageTable';
import {getImageRecords} from './utilities/sessionUtils';
import {Panel} from 'rsuite';

const consola = require('consola');

class Target extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    consola.trace('Target render');
    const {target, sessionPath} = this.props;
    const rows = getImageRecords(target);

    return <Panel header={'Target: ' + target.name} collapsible bordered>
      <ImageTable sessionPath={sessionPath} rows={rows}/>
    </Panel>;
  }
}

export default Target;
