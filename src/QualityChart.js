import React from 'react';
import {Nav, Navbar, Panel} from 'rsuite';
import {Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {fixed, formatDateTimeISO, precision} from './utilities/utils';

class QualityChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftMetric: 'HFR',
      selectedFilter: 'All',
      rightMetric: 'Stars',
    };
  }

  #metricNames = [
    'index', 'fileName', 'started', 'filterName', 'detectedStars', 'HFR', 'FocuserTemperature', 'WeatherTemperature', 'ADUStDev', 'ADUMean', 'ADUMedian', 'ADUMin', 'ADUMax', 'ADUMAD',
    'GuidingRMS', 'GuidingRMSArcSec', 'GuidingRMSRA', 'GuidingRMSRAArcSec', 'GuidingRMSDEC', 'GuidingRMSDECArcSec'];
  #displayMetricNames = [
    'index', 'file', 'started', 'filter', 'Stars', 'HFR', 'Focuser Temp', 'Weather Temp', 'ADU StdDev', 'ADU Mean', 'ADU Median', 'ADU Min', 'ADU Max', 'ADU MAD',
    'RMS', 'RMS ArcSec', 'RMS RA', 'RMS RA ArcSec', 'RMS DEC', 'RMS DEC ArcSec'];
  #selectableMetricNames = [
    'Stars',
    'HFR',
    'Focuser Temp',
    'Weather Temp',
    'ADU StdDev',
    'ADU Mean',
    'ADU Median',
    'ADU Min',
    'ADU Max',
    'ADU MAD',
    'RMS',
    'RMS ArcSec',
    'RMS RA',
    'RMS RA ArcSec',
    'RMS DEC',
    'RMS DEC ArcSec',
  ];

  chartPrep(imageRecords) {

    let filters = ['All'];
    let summary = {};
    for (const metric of this.#selectableMetricNames) {
      summary[metric] = {min: Number.MAX_VALUE, max: Number.MIN_VALUE};
    }

    let data = [];
    for (const record of imageRecords) {
      let out = {};

      // Select and reformat metrics of interest
      for (const [i, metric] of this.#metricNames.entries()) {
        const displayName = this.#displayMetricNames[i];
        const value = record[metric];

        if (displayName === 'started') {
          out[displayName] = formatDateTimeISO(value);
        } else if (displayName === 'HFR') {
          out[displayName] = Number(precision(value));
        } else if (displayName.startsWith('ADU')) {
          out[displayName] = Number(fixed(value));
        } else {
          out[displayName] = value;
        }

        // Determine min/max/range of metrics that can be plotted
        if (this.#selectableMetricNames.includes(displayName)) {
          if (value < summary[displayName].min)
            summary[displayName].min = value;
          if (value > summary[displayName].max)
            summary[displayName].max = value;

          const range = summary[displayName].max - summary[displayName].min;
          summary[displayName].range = range < 1e-10 ? 0 : range;
        }
      }

      if (!filters.includes(out.filter)) {
        filters.push(out.filter);
      }

      data.push(out);
    }

    for (const metric of this.#selectableMetricNames) {
      if (summary[metric].max === Number.MIN_VALUE)
        summary[metric].max = summary[metric].min;
    }

    return {'summary': summary, 'filters': filters, 'data': data};
  }

  xAxisTicks() {
    return 10;
  }

  selectLeftPlot = (eventKey) => { this.setState({leftMetric: eventKey}); };
  selectFilter = (eventKey) => { this.setState({selectedFilter: eventKey}); };
  selectRightPlot = (eventKey) => { this.setState({rightMetric: eventKey}); };

  filterByFilter = (filter, data) => {
    return (filter === 'All') ? data : data.filter(item => item.filter === filter);
  };

  render() {
    const {leftMetric, selectedFilter, rightMetric} = this.state;
    const {target} = this.props;

    const result = this.chartPrep(target.imageRecords);
    const summary = result.summary;
    const filters = result.filters;
    const data = result.data;
    const filteredData = this.filterByFilter(selectedFilter, data);

    const key = `qc-${target.id}`;

    // The plot dropdowns will only contain metrics that have a non-zero range
    let metricDropdown = Object.keys(summary).filter(metric => summary[metric].range > 0);
    metricDropdown.unshift('None');

    return <div>
      <Panel header="Quality Metrics" bordered bodyFill>

        <Navbar>
          <Nav>
            <Nav.Dropdown title={'Left Side: ' + leftMetric} activeKey={leftMetric} onSelect={this.selectLeftPlot}>
              {metricDropdown.map(item => (
                  <Nav.Dropdown.Item eventKey={item} key={item}>{item}</Nav.Dropdown.Item>
              ))}
            </Nav.Dropdown>
          </Nav>
          <Nav>
            <Nav.Dropdown title={'Filter: ' + selectedFilter} activeKey={selectedFilter} onSelect={this.selectFilter}>
              {filters.map(item => (
                  <Nav.Dropdown.Item eventKey={item} key={item}>{item}</Nav.Dropdown.Item>
              ))}
            </Nav.Dropdown>
          </Nav>
          <Nav>
            <Nav.Dropdown title={'Right Side: ' + rightMetric} activeKey={rightMetric} onSelect={this.selectRightPlot}>
              {metricDropdown.map(item => (
                  <Nav.Dropdown.Item eventKey={item} key={item}>{item}</Nav.Dropdown.Item>
              ))}
            </Nav.Dropdown>
          </Nav>
        </Navbar>

        <ResponsiveContainer width="100%" height={450}>
          <LineChart key={key} data={filteredData} margin={{top: 30, right: 10, left: 10, bottom: 20}}>
            <CartesianGrid strokeDasharray="3 2" stroke={'#666'}/>
            <XAxis dataKey="index" tickCount={this.xAxisTicks()}/>
            <YAxis type="number" yAxisId="left" tickCount={6} domain={['auto', 'auto']}/>
            <YAxis type="number" yAxisId="right" tickCount={6} domain={['auto', 'auto']} orientation="right"/>
            <Brush dataKey="index" height={20} stroke="#444" fill="#888" travellerWidth={10}/>
            <Tooltip content={<QualityTooltip leftLabel={leftMetric} rightLabel={rightMetric}/>}/>
            <Legend/>
            {leftMetric !== 'None'} &&
            <Line yAxisId="left" type="monotone" isAnimationActive={false} dataKey={leftMetric} stroke="#4E9A06" dot={{fill: '#4E9A06'}} activeDot={{r: 6}}/>
            }
            {rightMetric !== 'None'} &&
            <Line yAxisId="right" type="monotone" isAnimationActive={false} dataKey={rightMetric} stroke="#C88D00" dot={{fill: '#C88D00'}} activeDot={{r: 6}}/>
            }
          </LineChart>
        </ResponsiveContainer>

      </Panel>
    </div>;
  }
}

class QualityTooltip extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {active, payload, leftLabel, rightLabel} = this.props;

    if (active && payload && payload.length) {
      let index = 0;
      let leftTip, rightTip = null;

      if (leftLabel !== 'None') {
        leftTip = <p>{leftLabel}: {payload[index].value}</p>;
        index++;
      }

      if (rightLabel !== 'None') {
        rightTip = <p>{rightLabel}: {payload[index].value}</p>;
      }

      return (
          <div className="chart-tooltip">
            {leftTip}
            {rightTip}
            <p>{`Filter: ${payload[0].payload.filter}`}</p>
            <p>{`${payload[0].payload.started}`}</p>
            <p>{`${payload[0].payload.file}`}</p>
          </div>
      );
    }

    return null;
  }
}

export default QualityChart;