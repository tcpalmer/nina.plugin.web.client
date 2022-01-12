import React from 'react';
import {LogLevel} from 'consola';
import {Col, Divider, Dropdown, Grid, Row} from 'rsuite';
import PlaceholderWrapper from './utilities/wrappers';
import Session from './Session';
import {AppState} from './utilities/AppState';

const consola = require('consola');
consola.level = LogLevel.Trace;

class App extends React.Component {

  appState = null;

  constructor(props) {
    super(props);

    this.state = {
      sessionList: [],
      selectedSession: null,
      pendingSelectedSession: null,
      sessionHistory: null,
      error: null,
    };
  }

  componentDidMount() {
    consola.trace('App mounting');
    this.appState = new AppState(this.sessionListChanged, this.sessionHistoryChanged);
    this.appState.start();
  }

  componentWillUnmount() {
    consola.trace('App unmounting');
    this.appState.stop();
  }

  sessionListChanged = (response) => {

    if (response.error) {
      this.setState({
        error: 'failed to load session list',
      });

      return;
    }

    this.setState({
      sessionList: response.data.sessions,
      error: null,
    });
  };

  sessionHistoryChanged = (response) => {
    if (response.error) {
      this.setState({
        error: 'failed to load session history',
      });

      return;
    }

    this.setState({
      sessionHistory: response.data,
      selectedSession: this.state.pendingSelectedSession,
      error: null,
    });
  };

  // TODO: we need to display the session key in some text area beside the dropdown

  selectSession = (eventKey) => {
    consola.debug('selected session: ' + eventKey);
    if (this.state.selectedSession !== eventKey) {
      this.setState({
        pendingSelectedSession: eventKey,
      });

      this.appState.startSessionHistoryLoad(eventKey);
    }
  };

  render() {
    consola.trace('App render');
    const {sessionList, sessionHistory, selectedSession, error} = this.state;
    const sessionPath = '/sessions/' + selectedSession;

    return <div style={{margin: 20}}>
      <React.StrictMode>
        <Grid fluid>
          <Row>
            <Col xs={2}><img src="assets/icons/logo_nina.png" width={30} height={30} alt="NINA"/></Col>
            <Col xs={4} style={{fontSize: 'x-large'}}>NINA Session Status</Col>
          </Row>
        </Grid>

        <Divider/>

        <Dropdown title="Select Session" activeKey={selectedSession} onSelect={this.selectSession}>
          {sessionList.map(session => (
              <Dropdown.Item eventKey={session.key} key={session.key}>{session.display}</Dropdown.Item>
          ))}
        </Dropdown>

        <Divider/>

        <PlaceholderWrapper enabled={this.state.selectedSession === null}/>
        <Session sessionHistory={sessionHistory} sessionPath={sessionPath}/>
      </React.StrictMode>
    </div>;
  }
}

export default App;
