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
  #sessionHistoryLoader = null;

  constructor(sessionListChanged, sessionHistoryChanged) {
    this.#sessionListChanged = sessionListChanged;
    this.#sessionHistoryChanged = sessionHistoryChanged;
  }

  start() {
    this.#sessionListLoader = new JSONLoader('/sessions/sessions.json', this.sessionListLoaded);
    this.#sessionListLoader.start();
    //this.#sessionListLoader.setLoadInterval(10); TODO: for now we're not reloading the session list but we should since it could change
  }

  startSessionHistoryLoad(sessionKey) {
    if (this.#sessionHistoryLoader) {
      this.#sessionHistoryLoader.stop();
    }

    this.#sessionHistoryLoader = new JSONLoader('/sessions/' + sessionKey + '/sessionHistory.json',
        this.sessionHistoryLoaded);
    this.#sessionHistoryLoader.start();
  }

  stop() {
    if (this.#sessionListLoader) {this.#sessionListLoader.stop();}
    if (this.#sessionHistoryLoader) {this.#sessionHistoryLoader.stop();}
  }

  sessionListLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session list');
      this.#sessionListChanged({data: null, error: true});
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session list');
      consola.trace(response.data);
      this.#sessionListChanged({data: response.data, error: false});
      return;
    }

    consola.success('got cached session list, no change');
  };

  sessionHistoryLoaded = (response) => {

    if (response.error) {
      consola.error('failed to load session history');
      this.#sessionHistoryChanged({data: null, error: true});
      return;
    }

    if (!response.cacheUsed) {
      consola.success('loaded fresh session history');
      consola.trace(response.data);
      const sessionHistory = response.data;

      if (sessionHistory.activeTargetId) {
        consola.trace('session has an active target, reload enabled');
        this.#sessionHistoryLoader.setLoadInterval(10);
      } else {
        consola.trace('session does not have an active target, reload disabled');
      }

      this.#sessionHistoryChanged({data: sessionHistory, error: false});
      return;
    }

    consola.success('got cached session history, no change');
  };

}
