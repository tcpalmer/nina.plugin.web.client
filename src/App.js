import React from 'react';
import {LogLevel} from 'consola';
import {Container, Content, Divider, Header, Nav, Navbar} from 'rsuite';
import {AppState} from './utilities/AppState';
import {formatDateTimeISO, formatDateTimeMS} from './utilities/utils';
import Cog from '@rsuite/icons/legacy/Cog';
import AppModal from './utilities/AppModal';
import HelpContent from './utilities/HelpContent';
import PlaceholderWrapper from './utilities/wrappers';
import Session from './Session';
import Console from './utilities/Console';
import SettingsForm from './utilities/SettingsForm';
import {v4 as uuidv4} from 'uuid';

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
      showSettings: false,
      showConsole: false,
      showHelp: false,
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
      sessionUpdatedKey: uuidv4(),
    });
  };

  getSessionDisplayName(sessionKey) {
    const elem = this.state.sessionList.find(element => element.key === sessionKey);
    return elem !== null ? elem.display : 'n/a';
  }

  addConsoleMessage(type, message) {
    const date = formatDateTimeMS(new Date().getTime());
    const copy = [{type, date, message}, ...this.state.consoleMessages];
    this.setState({
      consoleMessages: copy,
      consoleButtonClass: 'console-button-' + type,
    });
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

  openSettings = () => { this.setState({showSettings: true}); };
  closeSettings = () => { this.setState({showSettings: false}); };

  openConsole = () => { this.setState({showConsole: true}); };
  closeConsole = () => { this.setState({showConsole: false}); };

  openHelp = () => { this.setState({showHelp: true}); };
  closeHelp = () => { this.setState({showHelp: false}); };

  render() {
    consola.trace('App: render');
    const {sessionList, sessionHistory, selectedSession, selectedSessionDisplay, sessionUpdatedKey, consoleMessages, consoleButtonClass} = this.state;
    const {showSettings, showConsole, showHelp} = this.state;
    const sessionPath = '/sessions/' + selectedSession;

    return <div style={{margin: 20}}>
      <React.StrictMode>

        <Container>
          <Header>
            <Navbar>
              <Nav> <Nav.Item><img src={logo} width={30} height={30} alt="NINA"/></Nav.Item> </Nav>

              <Nav>
                <Nav.Dropdown title="Sessions" activeKey={selectedSession} onSelect={this.selectSession}>
                  {sessionList.map(session => (
                      <Nav.Dropdown.Item eventKey={session.key} key={session.key}>{session.display}</Nav.Dropdown.Item>
                  ))}
                </Nav.Dropdown>
              </Nav>

              <Nav> <Nav.Item onClick={this.openConsole} className={consoleButtonClass}>Console</Nav.Item> </Nav>
              <Nav> <Nav.Item onClick={this.openHelp}>Help</Nav.Item> </Nav>
              <Nav> <Nav.Item icon={<Cog/>} onClick={this.openSettings}/> </Nav>

            </Navbar>
          </Header>

          <Content>
            <Divider/>
            <PlaceholderWrapper enabled={this.state.selectedSession === null}/>
            <Session key={sessionHistory?.id}
                     sessionHistory={sessionHistory}
                     sessionName={selectedSession}
                     sessionDisplay={selectedSessionDisplay}
                     sessionUpdatedKey={sessionUpdatedKey}
                     sessionPath={sessionPath}
            />
          </Content>

        </Container>

        <SettingsForm key={new Date()} open={showSettings} handleClose={this.closeSettings}/>
        <AppModal open={showConsole} handleClose={this.closeConsole} title="Console"><Console messages={consoleMessages}/></AppModal>
        <AppModal open={showHelp} handleClose={this.closeHelp} title="Help"><HelpContent/></AppModal>

      </React.StrictMode>
    </div>;
  }

}

export default App;
