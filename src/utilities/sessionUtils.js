import {formatDateTimeISO} from './utils';

export function getImageRecords(target) {
  return target.imageRecords.map((row) => ({
    ...row,
    started: formatDateTimeISO(row.started),
    hfrText: Number.parseFloat(row.HFR).toPrecision(4),
  }));
}

export function getThumbnailSize(sessionPath, item, notify) {
  const img = new Image();
  img.onload = function() {
    notify({width: this.width, height: this.height});
  };

  img.src = sessionPath + '/thumbnails/' + item.id + '.jpg';
}
