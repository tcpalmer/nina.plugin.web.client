const consola = require('consola');

/**
 * SessionLoader will load (and optionally periodically reload) the requested session history JSON from the server.
 *
 * The provided callback function is intended to update the state of a component and will be called with a
 * response containing the fetched object, a flag indicating whether the object was from the browser's cache
 * or not, and an error flag.
 *
 * Since fetch returns a 200 regardless of whether the object was found in the browser cache or not, we have to
 * store and compare the ETag of the response to determine cache status (i.e. we don't get a 304 here).
 */
export class SessionHistoryLoader {

  static timeout = 10000;

  #url = null;
  #periodic = false;
  #timeoutID = null;
  #lastETag = null;
  #loadedCallback = () => {};

  constructor(url, periodic, loadedCallback) {
    this.#url = url;
    this.#periodic = periodic;
    this.#loadedCallback = loadedCallback;
  }

  load() {
    this._load().then(r => {});

    if (this.#periodic) {
      this.#timeoutID = setTimeout(this.reload, SessionHistoryLoader.timeout);
    }
  }

  reload = () => {
    this._load().then(r => {});
    this.#timeoutID = setTimeout(this.reload, SessionHistoryLoader.timeout);
  };

  stop() {
    if (this.#timeoutID) {
      clearTimeout(this.#timeoutID);
      this.#timeoutID = null;
    }
  }

  async _load() {
    consola.trace('fetching ' + this.#url + ', etag: ' + this.#lastETag);

    try {
      const init = {cache: 'no-cache', headers: {'Content-Type': 'application/json'}};
      const response = await fetch(this.#url, init);
      consola.trace(response);

      if (response.ok) {
        const sessionHistory = await response.json();
        let cacheUsed = false;

        if (response.headers.get('ETag') !== this.#lastETag) {
          this.#lastETag = response.headers.get('ETag');
          consola.trace('new etag: ' + this.#lastETag);

        } else {
          cacheUsed = true;
        }

        consola.trace(sessionHistory);
        this.#loadedCallback({data: sessionHistory, cacheUsed: cacheUsed, error: false});

      } else {
        consola.error('request failed to: ' + this.#url + ', response:');
        consola.error(response);
        this.#loadedCallback({data: null, cacheUsed: false, error: true});
      }

    } catch (e) {
      consola.error(e);
      this.#loadedCallback({data: null, cacheUsed: false, error: true});
    }

  }
}
