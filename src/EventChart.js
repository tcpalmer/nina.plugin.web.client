import React from 'react';
import {Brush, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis} from 'recharts';
import {DateTime, Duration} from 'luxon';
import {Panel} from 'rsuite';
import {Event} from './Event';
import {formatDateTimeMS, precision} from './utilities/utils';

const consola = require('consola');

class EventChart extends React.Component {

  constructor(props) {
    super(props);
  }

  prepEvents(sessionHistory) {
    const events = Event.getEvents(sessionHistory);
    const domain = this.reMapEventValues(events);

    return {
      events: events,
      domain: domain,
    };
  }

  reMapEventValues = (events) => {
    let types = [];

    // Find all unique event types
    for (const event of events) {
      if (!types.includes(event.type)) {
        types.push(event.type);
      }
    }

    // Order them by defined list
    let ordered = [];
    for (const type of Event.EVENT_TYPES_LIST) {
      if (types.includes(type)) {
        ordered.push(type);
      }
    }

    // Create the y axis value to use for the plot.  This basically collapses to only the unique event types
    // and maps from 0 to ordered.length-1 so we only plot the event types currently in the session.
    for (const event of events) {
      event.Yvalue = ordered.findIndex((type) => (type === event.type));
    }

    return {min: 0, max: ordered.length - 1, types: ordered};
  };

  /*
  It would be nice to have the Brush retain positions across session updates but it gets wonky.  But the behavior required a wait which made the traveller jump
  once released (and was slow).  Also, if the right traveller was all the way right, then after an update you'd want it to reset to the max again, but didn't.

  You need to set start/end in componentDidMount and add the following to Brush:
  startIndex={this.state.startIndex} endIndex={this.state.endIndex} onChange={this.onBrushChange}

  onBrushChange = (range) => {
    clearTimeout(this.brushTimeout);
    this.brushTimeout = setTimeout(() => {
      this.setState({
        startIndex: range.startIndex,
        endIndex: range.endIndex,
      });
    }, 1000);
  };
   */

  render() {
    const {sessionHistory, sessionPath} = this.props;

    if (!sessionHistory) {
      return null;
    }

    const {events, domain} = this.prepEvents(sessionHistory);

    const eventTickFormatter = (value) => {
      const type = domain.types[value];
      return Event.EVENT_TYPES[type].name;
    };

    const eventShape = (props) => {
      const fill = eventColor(props);
      const marker = eventMarker(props);
      const pos = (marker.length === 1) ? {x: -3.3, y: 3.4} : {x: -5.5, y: 3.4};

      return (
          <svg>
            <circle cx={props.cx} cy={props.cy} r="10" fill={fill}/>
            <text x={props.cx + pos.x} y={props.cy + pos.y} className="event-marker">{marker}</text>
          </svg>
      );
    };

    const eventColor = (props) => {
      const type = domain.types[props.Yvalue];
      return Event.getEventColor(type, props.subType);
    };

    const eventMarker = (props) => {
      const type = domain.types[props.Yvalue];
      return Event.getEventMarker(type, props.subType);
    };

    return <div>
      <Panel header="Events" bordered bodyFill>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart data={events} margin={{top: 30, right: 30, left: 20, bottom: 30}}>
            <CartesianGrid strokeDasharray="3 1" stroke={'#666'}/>
            <XAxis
                type="number"
                name="Time"
                dataKey="time"
                tickFormatter={(time) => DateTime.fromMillis(time).toFormat('HH:mm')}
                padding={{left: 20, right: 20}}
                domain={['auto', 'auto']}
            />
            <YAxis
                type="number"
                dataKey="Yvalue"
                domain={[0, domain.max]}
                tickCount={domain.types.length}
                tickFormatter={eventTickFormatter}
            />
            <Brush
                dataKey="time"
                height={20} stroke="#444" fill="#888" travellerWidth={10}
                tickFormatter={(time) => DateTime.fromMillis(time).toFormat('HH:mm:ss')}
            />
            <Tooltip content={<EventTooltip sessionPath={sessionPath}/>}/>
            <Scatter
                id="id"
                dataKey="time"
                name="Type"
                shape={eventShape}
                isAnimationActive={false}
            />
          </ScatterChart>

        </ResponsiveContainer>

      </Panel>
    </div>;
  }
}

class EventTooltip extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {active, payload, sessionPath} = this.props;
    let extra = null;

    if (active && payload && payload.length) {
      const event = payload[0].payload;
      const time = formatDateTimeMS(event.time);

      const type = event.type;
      let name = '';
      if (type.startsWith('IMAGE') || type === 'NINA') {
        name = event.subType;
      } else {
        name = type;
      }

      if (type === 'AUTO-FOCUS') {

        const duration = Duration.fromMillis(event.source.duration).toFormat('mm:ss');
        const temp = precision(event.source.temperature, 3);
        const r2Q = precision(event.source.rms.Quadratic, 3);
        const r2H = precision(event.source.rms.Hyperbolic, 3);
        const r2L = precision(event.source.rms.LeftTrend, 3);
        const r2R = precision(event.source.rms.RightTrend, 3);

        extra =
            <div>
              <p/>
              <p>{`Filter: ${event.source.filter}`}</p>
              <p>{`Duration: ${duration}`}</p>
              <p>{`Temp: ${temp}`} &deg;C</p>
              <p>{`Position: ${event.source.finalPosition}`}</p>
              <p>{`R2 Q/H/L/R: ${r2Q} / ${r2H} / ${r2L} / ${r2R}`}</p>
            </div>;
      }

      if (type.startsWith('IMAGE')) {
        const stars = event.source.detectedStars;
        const HFR = precision(event.source.HFR);
        const thumbnailSrc = `${sessionPath}/thumbnails/${event.source.id}.jpg`;

        extra =
            <div>
              <p/>
              <p>{`Stars: ${stars}`}</p>
              <p>{`HFR: ${HFR}`}</p>
              <p/>
              <img src={`${thumbnailSrc}`} alt="thumbnail n/a"/>
            </div>;
      }

      return (
          <div className="chart-tooltip">
            <p>{`Type: ${name}`}</p>
            <p>{`${time}`}</p>
            {extra}
          </div>
      );

    }

    return null;
  }
}

export default EventChart;
