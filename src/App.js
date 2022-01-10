import React from 'react';
import {LogLevel} from 'consola';
import {SessionHistoryLoader} from './utilities/SessionHistoryLoader';
import {Notification} from 'rsuite';
import {getImageRecords} from './utilities/sessionUtils';
import ImageListTable from './ImageListTable';

const consola = require('consola');
consola.level = LogLevel.Trace;

class App extends React.Component {

  loader = null;

  constructor(props) {
    super(props);

    this.state = {
      urlPath: '/sessions/20220106-060746', // TODO: needs to be dynamic
      imageRecords: [],
      error: null,
    };

    this.loader = new SessionHistoryLoader(this.state.urlPath + '/sessionHistory.json', true, this.sessionLoaded);
  }

  sessionLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session history');
      this.setState({
        error: 'failed to load session history',
      });
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session history');
      consola.trace(response.data);
      this.setState({
        imageRecords: getImageRecords(response.data),
        error: null,
      });
    } else {
      consola.success('got cached session history');
    }
  };

  componentDidMount() {
    consola.trace('App mounting');
    this.loader.load();
  }

  componentWillUnmount() {
    consola.trace('App unmounting');
    this.loader.stop();
  }

  render() {
    consola.trace('App render');
    const {urlPath, imageRecords, error} = this.state;

    let notify;
    if (error) {
      notify = <Notification type="error" header="error">Failed to load session history</Notification>;
    }

    return <div>
      {notify}
      <ImageListTable urlPath={urlPath} rows={imageRecords}/>
    </div>;
  }
}

export default App;
