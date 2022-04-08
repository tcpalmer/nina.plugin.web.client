import React from 'react';
import {Nav, Navbar, Panel} from 'rsuite';
import {Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {fixed, formatDateTimeISO, precision} from './utilities/utils';

const consola = require('consola');

class QualityChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftMetric: 'HFR',
      selectedFilter: 'All',
      rightMetric: 'stars',
    };
  }

  /*
      TODO: think it would be best to normalize the ADU values ...?
      TODO: appears to be completely redrawing the whole target on session history changes.

      TODO:
        - How well does mobile work?
        - Test with dynamic data
        - Dynamic by width:
          - X axis tickCount needs to be dynamic based on number of images and available width
          - Brush start is number of elements - 100, min of 1. 100 is NINA setting, might be less for mobile widths
        - Dynamic height: for mobile widths, the plot is too compressed, need to reduce height and y axis ticks
   */

  #metricNames = [
    'index', 'fileName', 'started', 'filterName', 'detectedStars', 'HFR', 'ADUStDev', 'ADUMean', 'ADUMedian', 'ADUMin', 'ADUMax', 'ADUMAD',
    'GuidingRMS', 'GuidingRMSArcSec', 'GuidingRMSRA', 'GuidingRMSRAArcSec', 'GuidingRMSDEC', 'GuidingRMSDECArcSec'];
  #displayMetricNames = [
    'index', 'file', 'started', 'filter', 'stars', 'HFR', 'ADU StdDev', 'ADU Mean', 'ADU Median', 'ADU Min', 'ADU Max', 'ADU MAD',
    'RMS', 'RMS ArcSec', 'RMS RA', 'RMS RA ArcSec', 'RMS DEC', 'RMS DEC ArcSec'];
  #selectableMetricNames = [
    'stars', 'HFR', 'ADU StdDev', 'ADU Mean', 'ADU Median', 'ADU Min', 'ADU Max', 'ADU MAD', 'RMS', 'RMS ArcSec', 'RMS RA', 'RMS RA ArcSec', 'RMS DEC', 'RMS DEC ArcSec',
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
          out[displayName] = precision(value);
        } else if (displayName.startsWith('ADU')) {
          out[displayName] = fixed(value);
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

    consola.trace('chart prep summary:');
    consola.trace(summary);

    return {'summary': summary, 'filters': filters, 'data': data};
  }

  xAxisTicks() {
    return 10;
  }

  brushStartIndex(size) {
    const start = size - 100;
    return start < 0 ? 0 : start;
  }

  selectLeftPlot = (eventKey) => { this.setState({leftMetric: eventKey}); };
  selectFilter = (eventKey) => { this.setState({selectedFilter: eventKey}); };
  selectRightPlot = (eventKey) => { this.setState({rightMetric: eventKey}); };

  filterByFilter = (filter, data) => {
    return (filter === 'All') ? data : data.filter(item => item.filter === filter);
  };

// TODO: could possibly use this to sync multiple plots to the same scale (e.g. add ADU-specific chart?)
// TODO: see the SynchronizedLineChart example - it does this.  Looks like syncId="anyId" does it
  onBrushChange = (event) => {
    // event: { startIndex: 3, endIndex: 49 }
    // would have to move this function to a parent component that then sets props for each chart drawing component
    // think you would want an option to sync scales or not
    // indices are zero-based so 50 images is 0-49
    // unfortunately, this seems to be called on every movement of a traveller, even if the index doesn't change
  };

  render() {
    const {leftMetric, selectedFilter, rightMetric} = this.state;
    const {target} = this.props;
    const result = this.chartPrep(target.imageRecords);
    const summary = result.summary;
    const filters = result.filters;
    const data = result.data;

    // The plot dropdowns will only contain metrics that have a non-zero range
    let metricDropdown = Object.keys(summary).filter(metric => summary[metric].range > 0);
    metricDropdown.unshift('None');

    // TODO: need style to shrink dropdowns?
    // TODO: possible to get/plot temp?

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
          <LineChart data={this.filterByFilter(selectedFilter, data)} margin={{top: 30, right: 10, left: 10, bottom: 20}}>
            <CartesianGrid strokeDasharray="3 2" stroke={'#666'}/>
            <XAxis dataKey="index" tickCount={this.xAxisTicks()}/>
            <YAxis yAxisId="left" tickCount={6} domain={['auto', 'auto']}/>
            <YAxis yAxisId="right" tickCount={6} domain={['auto', 'auto']} orientation="right"/>
            <Brush dataKey="index" height={20} stroke="#444" fill="#888" travellerWidth={10} startIndex={this.brushStartIndex(data.length)}/>
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