import {DateTime, Duration} from 'luxon';

const consola = require('consola');

/**
 * Autofocus encapsulates an autofocus run.
 *
 */
export class Autofocus {

  constructor(raw) {
    this.startTime = DateTime.fromISO(raw.Timestamp).toMillis();
    this.duration = Duration.fromISOTime(raw.Duration).toMillis();
    this.endTime = DateTime.fromISO(raw.Timestamp).plus(Duration.fromMillis(this.duration)).toMillis();

    this.autofocuser = raw.AutoFocuserName;
    this.starDetector = raw.StarDetectorName;
    this.filter = raw.Filter;
    this.temperature = raw.Temperature;
    this.method = raw.Method;
    this.fitting = raw.Fitting;
    this.finalPosition = raw.CalculatedFocusPoint.Position;
    this.estimatedFinalHFR = raw.CalculatedFocusPoint.Value;
    this.rms = raw.RSquares;

    this.id = this.startTime.toString(16);
  }

}
