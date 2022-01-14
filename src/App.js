import React from 'react';
import {LogLevel} from 'consola';
import {Button, Col, Divider, Drawer, Dropdown, Grid, Row} from 'rsuite';
import PlaceholderWrapper from './utilities/wrappers';
import Session from './Session';
import {AppState} from './utilities/AppState';
import Console from './utilities/Console';
import {formatDateTime} from './utilities/utils';


const consola = require('consola');
consola.level = LogLevel.Trace;

// TODO: at some point, use @media in CSS to pseudo-support responsive

class App extends React.Component {

  appState = null;

  constructor(props) {
    super(props);

    this.state = {
      sessionList: [],
      selectedSession: null,
      pendingSelectedSession: null,
      sessionHistory: null,
      consoleOpen: false,
      consoleMessages: [],
    };
  }

  componentDidMount() {
    consola.trace('App mounting');
    this.addConsoleMessage('info', 'application loading');
    this.appState = new AppState(this.sessionListChanged, this.sessionHistoryChanged);
    this.appState.start();
  }

  componentWillUnmount() {
    consola.trace('App unmounting');
    this.appState.stop();
  }

  sessionListChanged = (response) => {

    if (response.error) {
      this.addConsoleMessage('error', 'Failed to load list of sessions.  Is NINA running?');
      return;
    }

    this.addConsoleMessage('warn', 'loaded list of all sessions: ' + response.url);
    this.setState({
      sessionList: response.data.sessions,
    });
  };

  sessionHistoryChanged = (response) => {

    if (response.error) {
      this.addConsoleMessage('error', 'Failed to load history for session.  Is NINA running?');
      return;
    }

    this.addConsoleMessage('info', 'loaded session history: ' + response.url);
    this.setState({
      sessionHistory: response.data,
      selectedSession: this.state.pendingSelectedSession,
    });
  };

  addConsoleMessage(type, message) {
    // TODO: if type=warn, set Show Console button to yellow, error->red, info->clear to default
    const date = formatDateTime(new Date());
    const copy = [{type, date, message}, ...this.state.consoleMessages];
    this.setState({
      consoleMessages: copy,
    });
  }

  setConsoleOpen(state) {
    this.setState({consoleOpen: state});
  }

  // TODO: we need to display the session key in some text area below dropdown divider

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
    const {sessionList, sessionHistory, selectedSession, consoleMessages, consoleOpen} = this.state;
    const sessionPath = '/sessions/' + selectedSession;

    return <div style={{margin: 20}}>
      <React.StrictMode>

        <Grid fluid>
          <Row>
            <Col xs={2}><img src="assets/icons/logo_nina.png" width={30} height={30} alt="NINA"/></Col>
            <Col xs={4} style={{fontSize: 'x-large'}}>NINA Session Status</Col>
          </Row>
          <Divider/>
          <Row>
            <Col xs={2}>
              <Dropdown title="Select Session" activeKey={selectedSession} onSelect={this.selectSession}>
                {sessionList.map(session => (
                    <Dropdown.Item eventKey={session.key} key={session.key}>{session.display}</Dropdown.Item>
                ))}
              </Dropdown>
            </Col>
            <Col xs={8}><Button onClick={() => this.setConsoleOpen(true)}>Show Console</Button>
            </Col>
          </Row>
        </Grid>

        <Divider/>

        <PlaceholderWrapper enabled={this.state.selectedSession === null}/>
        <Session sessionHistory={sessionHistory} sessionPath={sessionPath}/>

        <Drawer size={'lg'} open={consoleOpen} onClose={() => this.setConsoleOpen(false)}>
          <Drawer.Body>
            <Console messages={consoleMessages}/>
          </Drawer.Body>
        </Drawer>

      </React.StrictMode>
    </div>;
  }

}

export default App;
