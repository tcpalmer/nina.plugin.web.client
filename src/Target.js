import React from 'react';
import {Notification} from 'rsuite';

const consola = require('consola');

class Target extends React.Component {

  constructor(props) {
    super(props);

    this.state = {error: false};
  }

  render() {
    consola.trace('Target render');

    let notify;
    if (this.state.error) {
      notify = <Notification type="error" header="error">Failed to load session history</Notification>;
    }

    //       <ImageListTable urlPath={urlPath} rows={imageRecords}/>

    return <div>
    </div>;
  }

}

export default Target;
