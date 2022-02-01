const consola = require('consola');
const version = require('../webClientVersion.json');

/**
 * Use localStorage to persist application settings
 */
export class SettingsManager {

  #version = version.version;

  versionKey = 'version';
  imageScaleKey = 'imageScale';
  imageQualityKey = 'imageQuality';
  autoStretchFactorKey = 'autoStretchFactor';
  blackClippingKey = 'blackClipping';
  unlinkedStretchKey = 'unlinkedStretch';

  #defaults = null;

  constructor() {
    this.#defaults = this.#getDefaults();

    const version = localStorage.getItem(this.versionKey);
    if (version === null) {
      consola.trace('settings not found, setting to defaults');
      this.reset();

    } else {
      consola.trace('found settings for version ' + version);
      if (version !== this.#version) {
        consola.info('settings not current version which is ' + this.#version);
        // Future: if stored version != current version => settings converter
      }
    }
  }

  getVersion() {
    return localStorage.getItem(this.versionKey);
  }

  getImageScale = () => {
    return Number(localStorage.getItem(this.imageScaleKey));
  };

  setImageScale(value) {
    localStorage.setItem(this.imageScaleKey, value.toString());
  }

  getImageQuality() {
    return Number(localStorage.getItem(this.imageQualityKey));
  }

  setImageQuality(value) {
    localStorage.setItem(this.imageQualityKey, value.toString());
  }

  getAutoStretchFactor() {
    return Number(localStorage.getItem(this.autoStretchFactorKey));
  }

  setAutoStretchFactor(value) {
    localStorage.setItem(this.autoStretchFactorKey, value.toString());
  }

  getBlackClipping() {
    return Number(localStorage.getItem(this.blackClippingKey));
  }

  setBlackClipping(value) {
    localStorage.setItem(this.blackClippingKey, value.toString());
  }

  getUnlinkedStretch() {
    const value = localStorage.getItem(this.unlinkedStretchKey);
    return value === 'true';
  }

  setUnlinkedStretch(value) {
    localStorage.setItem(this.unlinkedStretchKey, value.toString());
  }

  reset() {
    localStorage.clear();
    this.#defaults.forEach((value, key) => {
      localStorage.setItem(key, value);
    });
  }

  #getDefaults() {
    const defaults = new Map();
    defaults.set(this.versionKey, this.#version);
    defaults.set(this.imageScaleKey, '0.75');
    defaults.set(this.imageQualityKey, '100');
    defaults.set(this.autoStretchFactorKey, '0.2');
    defaults.set(this.blackClippingKey, '-2.8');
    defaults.set(this.unlinkedStretchKey, 'true');
    return defaults;
  }

}
