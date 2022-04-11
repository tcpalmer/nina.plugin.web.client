const consola = require('consola');

export class Api1020 {

  #basePath = '/api/1020';

  async imageCreate(sessionHistory, sessionName, settingsManager, imageRecord, callback) {

    const request = {
      sessionName: sessionName,
      id: imageRecord.id,
      fullPath: imageRecord.fullPath,
      stretchOptions: {
        autoStretchFactor: settingsManager.getAutoStretchFactor(),
        blackClipping: settingsManager.getBlackClipping(),
        unlinkedStretch: settingsManager.getUnlinkedStretch(),
      },
      imageScale: settingsManager.getImageScale(),
      qualityLevel: settingsManager.getImageQuality(),
    };

    const url = this.#basePath + '/image/create';

    const response = await fetch(url, {
      method: 'PUT',
      cache: 'no-cache',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request),
    });

    consola.trace('API RESPONSE');
    consola.trace(response);

    if (response.ok && response.status === 200) {
      const json = await response.json();
      callback(response, json);
      consola.trace('JSON: ' + JSON.stringify(json));
    } else {
      consola.trace('API ERROR: ' + response.status);
      callback(response, null);
    }
  }
}
