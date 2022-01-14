//

import {formatDateTime} from './utils';

export function getImageRecords(target) {
  return target.imageRecords.map((row) => ({
    ...row,
    started: formatDateTime(row.started),
    hfrText: Number.parseFloat(row.HFR).toPrecision(4),
  }));
}
