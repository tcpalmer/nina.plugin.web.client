//

export function formatDateTime(dts) {
  const dateTime = new Date(dts);
  const dateOptions = {year: 'numeric', month: '2-digit', day: '2-digit'};
  const timeOptions = {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false};
  return dateTime.toLocaleTimeString([], timeOptions) + ' ' + dateTime.toLocaleDateString([], dateOptions);
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