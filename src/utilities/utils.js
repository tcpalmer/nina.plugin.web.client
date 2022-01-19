//

export function formatDateTime(dts) {
  const dateTime = new Date(dts);
  const dateOptions = {year: 'numeric', month: '2-digit', day: '2-digit'};
  const timeOptions = {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false};
  return dateTime.toLocaleTimeString([], timeOptions) + ' ' + dateTime.toLocaleDateString([], dateOptions);
}
