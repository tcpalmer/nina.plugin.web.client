//

export function getImageRecords(session) {
  return session.targets[0].imageRecords.map((row) => ({...row, started: formatDateTime(row.started)}));
}

function formatDateTime(dts) {
  const dataTime = new Date(dts);
  const dateOptions = {year: 'numeric', month: '2-digit', day: '2-digit'};
  const timeOptions = {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false};
  return dataTime.toLocaleTimeString([], timeOptions) + ' ' + dataTime.toLocaleDateString([], dateOptions);
}
