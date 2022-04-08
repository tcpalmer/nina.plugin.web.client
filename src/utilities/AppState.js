import {JSONLoader} from './JSONLoader';

const consola = require('consola');

/**
 * AppState manages the (re)loading of JSON resources from the server: the list of available sessions, and the
 * session history for the selected session.
 *
 */
export class AppState {

  #sessionListChanged = () => {};
  #sessionHistoryChanged = () => {};

  #sessionListLoader = null;
  #sessionListUrl = '';
  #sessionHistoryLoader = null;
  #sessionHistoryUrl = '';

  constructor(sessionListChanged, sessionHistoryChanged) {
    this.#sessionListChanged = sessionListChanged;
    this.#sessionHistoryChanged = sessionHistoryChanged;
  }

  start() {
    this.#sessionListUrl = '/sessions/sessions.json';
    this.#sessionListLoader = new JSONLoader(this.#sessionListUrl, this.sessionListLoaded);
    this.#sessionListLoader.start();
    this.#sessionListLoader.setLoadInterval(10);
  }

  startSessionHistoryLoad(sessionKey) {
    if (this.#sessionHistoryLoader) {
      this.#sessionHistoryLoader.stop();
    }

    this.#sessionHistoryUrl = '/sessions/' + sessionKey + '/sessionHistory.json';
    this.#sessionHistoryLoader = new JSONLoader(this.#sessionHistoryUrl, this.sessionHistoryLoaded);
    this.#sessionHistoryLoader.start();
  }

  stop() {
    if (this.#sessionListLoader) {this.#sessionListLoader.stop();}
    if (this.#sessionHistoryLoader) {this.#sessionHistoryLoader.stop();}
  }

  sessionListLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session list: ' + this.#sessionListUrl);
      this.#sessionListChanged({data: null, url: this.#sessionListUrl, error: true});
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session list: ' + this.#sessionListUrl);
      //consola.trace(response.data);
      this.#sessionListChanged({data: response.data, url: this.#sessionListUrl, error: false});
      return;
    }

    consola.success('got cached session list, no change');
  };

  sessionHistoryLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session history: ' + this.#sessionHistoryUrl);
      this.#sessionHistoryChanged({data: null, url: this.#sessionHistoryUrl, error: true});
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session history: ' + this.#sessionHistoryUrl);
      //consola.trace(response.data);
      const sessionHistory = response.data;

      if (sessionHistory.activeTargetId) {
        consola.trace('session has an active target, reload enabled');
        this.#sessionHistoryLoader.setLoadInterval(10);
      } else {
        consola.trace('session does not have an active target, reload disabled');
      }

      this.#sessionHistoryChanged({data: sessionHistory, url: this.#sessionHistoryUrl, error: false});
      return;
    }

    consola.success('got cached session history, no change');
  };

}
