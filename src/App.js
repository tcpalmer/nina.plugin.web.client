import React from 'react';
import {LogLevel} from 'consola';
import {Button, Col, Divider, Drawer, Dropdown, Grid, Row} from 'rsuite';
import PlaceholderWrapper from './utilities/wrappers';
import Session from './Session';
import {AppState} from './utilities/AppState';
import Console from './utilities/Console';
import {formatDateTime} from './utilities/utils';

const logo = require('./assets/icons/logo_nina.png');

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
      consoleOpen: false,
      consoleButtonClass: 'console-button-info',
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
      this.addConsoleMessage('error', 'Failed to load list of sessions.  Is NINA running and plugin enabled?');
      return;
    }

    this.addConsoleMessage('info', 'loaded list of all sessions: ' + response.url);
    this.setState({
      sessionList: response.data.sessions,
    });
  };

  sessionHistoryChanged = (response) => {

    if (response.error) {
      this.addConsoleMessage('error', 'Failed to load history for session.  Is NINA running and plugin enabled?');
      return;
    }

    this.addConsoleMessage('info', 'loaded session history: ' + response.url);

    this.setState({
      sessionHistory: response.data,
      selectedSession: this.state.pendingSelectedSession,
      selectedSessionDisplay: this.getSessionDisplayName(this.state.pendingSelectedSession),
    });
  };

  getSessionDisplayName(sessionKey) {
    const elem = this.state.sessionList.find(element => element.key === sessionKey);
    return elem !== null ? elem.display: 'n/a';
  }

  addConsoleMessage(type, message) {
    const date = formatDateTime(new Date());
    const copy = [{type, date, message}, ...this.state.consoleMessages];
    this.setState({
      consoleMessages: copy,
      consoleButtonClass: 'console-button-' + type,
    });
  }

  setConsoleOpen(state) {
    this.setState({consoleOpen: state});
  }

  selectSession = (eventKey) => {
    consola.debug('selected session: ' + eventKey);
    if (this.state.selectedSession !== eventKey) {
      this.setState({
        pendingSelectedSession: eventKey,
      });

      this.appState.startSessionHistoryLoad(eventKey);
    }
  };

  getConsoleSize() {
    if (window.matchMedia('(min-width: 992px)').matches) {
      return 'md';
    }

    return window.matchMedia('(min-width: 680px)').matches ? 'sm' : 'xs';
  }

  render() {
    consola.trace('App: render');
    const {sessionList, sessionHistory, selectedSession, selectedSessionDisplay, consoleMessages, consoleOpen, consoleButtonClass} = this.state;
    const sessionPath = '/sessions/' + selectedSession;

    return <div style={{margin: 20}}>
      <React.StrictMode>

        <Grid fluid>
          <Row>
            <Col><img src={logo} width={30} height={30} alt="NINA"/></Col>
            <Col className="header-text">NINA Session Status</Col>
          </Row>

          <Divider/>

          <Row>
            <Col>
              <Dropdown title="Select Session" activeKey={selectedSession} onSelect={this.selectSession}>
                {sessionList.map(session => (
                    <Dropdown.Item eventKey={session.key} key={session.key}>{session.display}</Dropdown.Item>
                ))}
              </Dropdown>
            </Col>
            <Col><Button onClick={() => this.setConsoleOpen(true)} className={consoleButtonClass}>Show Console</Button>
            </Col>
          </Row>
        </Grid>

        <Divider/>

        <PlaceholderWrapper enabled={this.state.selectedSession === null}/>
        <Session key={sessionHistory ? sessionHistory.id : null} sessionHistory={sessionHistory} sessionName={selectedSession} sessionDisplay={selectedSessionDisplay} sessionPath={sessionPath}/>

        <Drawer size={this.getConsoleSize()} open={consoleOpen} onClose={() => this.setConsoleOpen(false)}>
          <Drawer.Body>
            <Console messages={consoleMessages}/>
          </Drawer.Body>
        </Drawer>

      </React.StrictMode>
    </div>;
  }

}

export default App;
