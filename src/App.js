import React from 'react';
import {LogLevel} from 'consola';
import {Col, Divider, Dropdown, Grid, Row} from 'rsuite';
import {JSONLoader} from './utilities/JSONLoader';

const consola = require('consola');
consola.level = LogLevel.Trace;

class App extends React.Component {

  loader = null;

  constructor(props) {
    super(props);

    this.state = {
      sessionList: [],
      error: null,
    };

    this.loader = new JSONLoader('/sessions/sessions.json', false, this.sessionListLoaded);
  }

  sessionListLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session list');
      this.setState({
        error: 'failed to load session list',
      });
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session list');
      consola.trace(response.data);
      this.setState({
        sessionList: response.data.sessions,
        error: null,
      });
    } else {
      consola.success('got cached session list');
    }

    /*
{
  "sessions": [
    {
      "key": "20220106-041213",
      "display": "Jan 6 2022, 04:12:13"
    },
    {
      "key": "20220106-052035",
      "display": "Jan 6 2022, 05:20:35"
    },
    {
      "key": "20220106-060746",
      "display": "Jan 6 2022, 06:07:46"
    }
  ]
}
     */
  };

  selectSession(eventKey, event) {
    consola.debug(eventKey);
  }

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

    // TODO: include Session component

    // TODO: use a Placeholder until a session is picked
    // TODO: replace the Placeholder with Session component, passing the key as a prop to load it

    return <div style={{margin: 20}}>
      <Grid fluid>
        <Row>
          <Col xs={2}><img src="assets/icons/logo_nina.png" width={30} height={30} alt="NINA"/></Col>
          <Col xs={2} style={{fontSize: 'x-large'}}>NINA Web</Col>
        </Row>
      </Grid>
      <Divider/>
      <Dropdown title="Select Session" onSelect={this.selectSession}>
        {this.state.sessionList.map(session => (
            <Dropdown.Item eventKey={session.key} key={session.key}>{session.display}</Dropdown.Item>
        ))}
      </Dropdown>
    </div>;

  }
}

export default App;
