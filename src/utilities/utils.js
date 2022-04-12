import {DateTime} from 'luxon';

export function formatDateTimeISO(dts) {
  return dtFormat(DateTime.fromISO(dts));
}

export function formatDateTimeMS(dts) {
  return dtFormat(DateTime.fromMillis(dts));
}

// TODO: need to test and see if locale is being properly handled
function dtFormat(dt) {
  return dt.toFormat('HH:mm:ss LL/dd/yyyy');
}

export function duration(duration) {
  return DateTime.fromISO(duration).toFormat('m:ss');
}

export function precision(value, prec = 4) {
  return Number.parseFloat(value).toPrecision(prec);
}

export function fixed(value, digits = 2) {
  return value.toFixed(digits);
}

export function getModalSize() {
  if (window.matchMedia('(min-width: 800px)').matches) {
    return 'md';
  }

  return window.matchMedia('(min-width: 680px)').matches ? 'sm' : 'xs';
}

/*
   iPad: 810 width -> md
   iPhone: 375 width -> sm w/ 350px
 */