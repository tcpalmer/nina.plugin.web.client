import React from 'react';
import {LogLevel} from 'consola';
import {SessionHistoryLoader} from './utilities/SessionHistoryLoader';
import {getImageRecords} from './utilities/sessionUtils';
import ImageListTable from './ImageListTable';

const consola = require('consola');
consola.level = LogLevel.Trace;

class App extends React.Component {

  loader = null;

  constructor(props) {
    super(props);

    this.state = {
      imageRecords: [],
    };

    this.loader = new SessionHistoryLoader('/sessions/20220106-060746/sessionHistory.json', true, this.sessionLoaded);
  }

  sessionLoaded = (response) => {

    if (response.error) {
      // TODO: display some sort of error message
      consola.warn('failed to load session history');
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session history');
      consola.debug(response.data);
      this.setState({
        imageRecords: getImageRecords(response.data),
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

    return <div>
      <ImageListTable data={this.state.imageRecords}/>
    </div>;
  }
}

export default App;
