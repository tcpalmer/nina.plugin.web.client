const consola = require('consola');

export class Api1020 {

  #basePath = '/api/1020';

  /*

SESSION HISTORY
{
  "id": "33bbdeee-a043-4895-b932-811c314f22f6",
  "pluginVersion": "1.0.2.0",
  "startTime": "2022-01-24T06:55:29.8437203-05:00",
  "activeTargetId": null,
  "stretchOptions": {
    "autoStretchFactor": 0.2,
    "blackClipping": -2.8,
    "unlinkedStretch": true
  },
  "targets": [
    {
      "id": "12efe254-344a-4a9d-921c-6728ebd1f9bc",
       ...

IMAGE RECORD
        {
          "id": "5118b2c5-b00e-48ee-ac02-82f467be1c1d",
          "index": 1,
          "fileName": "2022-01-24_06-55-26___3.00s_0000.fits",
          "fullPath": "G:/Libraries/Documents/N.I.N.A/TEST/2022-01-23/LIGHT/2022-01-24_06-55-26___3.00s_0000.fits",
          "started": "2022-01-24T06:55:26.5597271-05:00",
          "epochMilliseconds": 1643025326559,
          "duration": 3.0,
          "filterName": "",
          "detectedStars": 0,
          "HFR": 0.0
        },

REQUEST
{
    "sessionName": "20220120-193813",
    "id": "abcd-123-zyxw",
    "fullPath": "C:/Users/Tom/source/repos/tmp/180.00sec_Ha_gain_139_offset_21_1x1__0099.xisf",
    "stretchOptions": {
        "autoStretchFactor": 0.2,
        "blackClipping": -2.8,
        "unlinkedStretch": false
    },
    "imageScale": 1,
    "qualityLevel": 100
}

   */

  async imageCreate(sessionHistory, sessionName, imageRecord, callback) {

    const request = {
      sessionName: sessionName,
      id: imageRecord.id,
      fullPath: imageRecord.fullPath,
      stretchOptions: sessionHistory.stretchOptions,
      imageScale: 0.5,
      qualityLevel: 100,
    };

    const url = this.#basePath + '/image/create';

    const response = await fetch(url, {
      method: 'PUT',
      cache: 'no-cache',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request),
    });

    consola.trace("API RESPONSE");
    consola.trace(response);

    if (response.ok && response.status === 200) {
      const json = await response.json();
      callback(response, json);
      consola.trace('JSON: ' + JSON.stringify(json));
    } else {
      consola.trace("API ERROR: " + response.status);
      callback(response, null);
    }
  }

}
