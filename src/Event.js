import {Autofocus} from './utilities/Autofocus';
import {DateTime} from 'luxon';

const consola = require('consola');

export class Event {

  constructor(id, type, subType, time, source) {

    if (!Event.EVENT_TYPES.hasOwnProperty(type)) {
      consola.error('unknown event type: ' + type + ', replacing with UNKNOWN');
      type = 'UNKNOWN';
    }

    this.id = id;
    this.type = type;
    this.subType = subType;
    this.time = time;
    this.value = -1;
    this.source = source;
  }

  static EVENT_TYPES = {
    'UNKNOWN': {'name': 'Unknown', 'value': 0, 'color': '#888', 'marker': ''},
    'NINA': {'name': 'NINA', 'value': 1, 'color': '#fff', 'marker': ''},

    'MERIDIAN-FLIP': {'name': 'MF', 'value': 2, 'color': '#eee8aa', 'marker': 'MF'},
    'AUTO-FOCUS': {'name': 'AF', 'value': 3, 'color': '#ffefd5', 'marker': 'AF'},

    'IMAGE-OTHER': {'name': 'Other', 'value': 4, 'color': '#999', 'marker': 'Io'},
    'IMAGE-NONE': {'name': 'None', 'value': 5, 'color': '#999', 'marker': 'In'},

    'IMAGE-SII': {'name': 'SII', 'value': 6, 'color': '#daa520', 'marker': 'S2'},
    'IMAGE-OIII': {'name': 'OIII', 'value': 7, 'color': '#6495ED', 'marker': 'O3'},
    'IMAGE-HA': {'name': 'Ha', 'value': 8, 'color': '#8b0000', 'marker': 'Ha'},

    'IMAGE-B': {'name': 'B', 'value': 9, 'color': '#22b', 'marker': 'B'},
    'IMAGE-G': {'name': 'G', 'value': 10, 'color': '#2b2', 'marker': 'G'},
    'IMAGE-R': {'name': 'R', 'value': 11, 'color': '#b22', 'marker': 'R'},
    'IMAGE-L': {'name': 'L', 'value': 12, 'color': '#bbb', 'marker': 'L'},
  };

  // Ordered list of event types - in bottom-up order for y axis plot
  static EVENT_TYPES_LIST = [
    'UNKNOWN',
    'NINA',
    'MERIDIAN-FLIP',
    'AUTO-FOCUS',
    'IMAGE-OTHER',
    'IMAGE-NONE',
    'IMAGE-SII',
    'IMAGE-OIII',
    'IMAGE-HA',
    'IMAGE-B',
    'IMAGE-G',
    'IMAGE-R',
    'IMAGE-L',
  ];

  static getEvents = (sessionHistory) => {

    let events = [];

    events.push(...this.getGeneralEvents(sessionHistory));
    events.push(...this.getAutoFocusEvents(sessionHistory));
    events.push(...this.getImageEvents(sessionHistory));

    // Sort by time
    events.sort(function compare(e1, e2) {
      return e1.time - e2.time;
    });

    // Set the value (y axis) for the event chart
    for (const event of events) {
      event.value = this.EVENT_TYPES[event.type].value;
    }

    return events;
  };

  static getGeneralEvents(sessionHistory) {
    const events = [];
    const generalEvents = sessionHistory.events;

    if (generalEvents && generalEvents.length > 0) {
      for (const event of generalEvents) {
        const type = this.getType(event.type);
        events.push(new Event(event.id, type.type, type.subType, DateTime.fromISO(event.time).toMillis(), event));
      }
    }

    return events;
  }

  static getAutoFocusEvents(sessionHistory) {
    const events = [];
    const autofocusList = sessionHistory.autofocus;

    if (autofocusList && autofocusList.length > 0) {
      for (const af of autofocusList) {
        const autofocus = new Autofocus(af.raw);
        events.push(new Event(autofocus.id, 'AUTO-FOCUS', autofocus.autofocuser, autofocus.startTime, autofocus));
      }
    }

    return events;
  }

  static getImageEvents(sessionHistory) {
    const events = [];
    const targets = sessionHistory.targets;

    if (targets && targets.length > 0) {
      for (const target of targets) {
        const images = target.imageRecords;
        if (images && images.length > 0) {
          for (const image of images) {
            const type = this.getImageType(image.filterName);
            events.push(new Event(image.id, type.type, type.subType, image.epochMilliseconds, image));
          }
        }
      }
    }

    return events;
  }

  static getType(hint) {
    switch (hint) {
      case 'NINA-START':
        return {'type': 'NINA', 'subType': 'NINA Start'};
      case 'NINA-ADV-SEQ-START':
        return {'type': 'NINA', 'subType': 'Adv Seq Start'};
      case 'NINA-ADV-SEQ-STOP':
        return {'type': 'NINA', 'subType': 'Adv Seq Stop'};
      case 'NINA-STOP':
        return {'type': 'NINA', 'subType': 'NINA Stop'};
      case 'NINA-PARK':
        return {'type': 'NINA', 'subType': 'Park'};
      case 'NINA-UNPARK':
        return {'type': 'NINA', 'subType': 'Unpark'};
      case 'NINA-CENTER':
        return {'type': 'NINA', 'subType': 'Center'};
      case 'NINA-SLEW':
        return {'type': 'NINA', 'subType': 'Slew'};
      case 'NINA-MF':
        return {'type': 'NINA', 'subType': 'MF'};
      case 'NINA-ERROR-AF':
        return {'type': 'NINA', 'subType': 'Error: AF'};
      case 'NINA-ERROR-PLATESOLVE':
        return {'type': 'NINA', 'subType': 'Error: Plate Solve'};

      default:
        return {'type': 'UNKNOWN', 'subType': ''};
    }
  }

  static getImageType(filter) {

    if (!filter || filter.length === 0) {
      return {'type': 'IMAGE-NONE', 'subType': 'No Filter'};
    }

    if (this.filterMatch(filter, ['l', 'lum', 'luminance'])) {
      return {'type': 'IMAGE-L', 'subType': 'Lum'};
    }

    if (this.filterMatch(filter, ['r', 'red'])) {
      return {'type': 'IMAGE-R', 'subType': 'R'};
    }

    if (this.filterMatch(filter, ['g', 'grn', 'green'])) {
      return {'type': 'IMAGE-G', 'subType': 'G'};
    }

    if (this.filterMatch(filter, ['b', 'blu', 'blue'])) {
      return {'type': 'IMAGE-B', 'subType': 'B'};
    }

    if (this.filterMatch(filter, ['h', 'ha', 'halpha'])) {
      return {'type': 'IMAGE-HA', 'subType': 'Ha'};
    }

    if (this.filterMatch(filter, ['o', 'o3', 'oiii', 'oxy', 'oxygen'])) {
      return {'type': 'IMAGE-OIII', 'subType': 'OIII'};
    }

    if (this.filterMatch(filter, ['s', 's2', 'sii', 'sul', 'sulphur'])) {
      return {'type': 'IMAGE-SII', 'subType': 'SII'};
    }

    return {'type': 'IMAGE-OTHER', 'subType': filter};
  }

  static filterMatch(name, alternates) {
    const cmp = name.toLowerCase();
    for (const alt of alternates) {
      if (cmp === alt) {
        return true;
      }
    }

    return false;
  }

  static getEventColor(type, subType) {
    if (type === 'NINA') {
      if (subType === 'NINA Start') { return '#2b2'; }
      if (subType === 'NINA Stop') { return '#b22'; }
      if (subType === 'Adv Seq Start') { return '#292'; }
      if (subType === 'Adv Seq Stop') { return '#922'; }
      if (subType === 'Park') { return '#888'; }
      if (subType === 'Unpark') { return '#888'; }
      if (subType === 'Center') { return '#888'; }
      if (subType === 'Slew') { return '#888'; }
      if (subType === 'MF') { return '#888'; }
      if (subType === 'Error: AF') { return '#da0'; }
      if (subType === 'Error: Plate Solve') { return '#da0'; }
    }

    return Event.EVENT_TYPES[type].color;
  }

  static getEventMarker(type, subType) {
    if (type === 'NINA') {
      if (subType === 'NINA Start') { return 'N'; }
      if (subType === 'NINA Stop') { return 'N'; }
      if (subType === 'Adv Seq Start') { return 'S'; }
      if (subType === 'Adv Seq Stop') { return 'E'; }
      if (subType === 'Park') { return 'PK'; }
      if (subType === 'Unpark') { return 'UP'; }
      if (subType === 'Center') { return 'C'; }
      if (subType === 'Slew') { return 'SL'; }
      if (subType === 'MF') { return 'MF'; }
      if (subType === 'Error: AF') { return 'EA'; }
      if (subType === 'Error: Plate Solve') { return 'EP'; }
    }

    return Event.EVENT_TYPES[type].marker;
  }
}

