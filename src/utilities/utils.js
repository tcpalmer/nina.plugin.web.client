import {DateTime} from 'luxon';

export function formatDateTimeISO(dts) {
  return dtFormat(DateTime.fromISO(dts));
}

export function formatDateTimeISOToLocale(dts) {
  return eventFormat(DateTime.fromISO(dts));
}

export function formatDateTimeMS(dts) {
  return dtFormat(DateTime.fromMillis(dts));
}

export function formatDateTimeMSToLocale(dts) {
  return eventFormat(DateTime.fromMillis(dts));
}

export function sessionKeyToLocale(key) {
  // Session keys are: yyyyMMdd-HHmmss
  const date = key.substring(0, key.indexOf('-'));
  const time = key.substring(key.indexOf('-') + 1);
  const dateDT = DateTime.fromFormat(date, 'yyyyMMdd');
  const timeDT = DateTime.fromFormat(time, 'HHmmss');

  return dateDT.toLocaleString(DateTime.DATE_FULL) + ' ' + timeDT.toFormat('HH:mm:ss');
}

function eventFormat(dt) {
  return dt.toFormat('HH:mm:ss') + ' ' + dt.toLocaleString(DateTime.DATE_SHORT);
}

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