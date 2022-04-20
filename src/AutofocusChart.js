import React from 'react';
import {CartesianGrid, ComposedChart, ErrorBar, Line, ResponsiveContainer, Scatter, XAxis, YAxis} from 'recharts';
import {duration, formatDateTimeISO, precision} from './utilities/utils';
import {evaluate} from 'mathjs';

class AutofocusChart extends React.Component {

  constructor(props) {
    super(props);
  }

  getDomain(points, calculatedPoint) {
    const xmin = Math.min(points[0].Position, calculatedPoint.Position);
    const xmax = Math.max(points[points.length - 1].Position, calculatedPoint.Position);
    const xPad = Math.round((xmax - xmin) / 8);
    const xDomain = [xmin - xPad, xmax + xPad];

    const ymin = Math.min(points[0].Value, calculatedPoint.Value);
    const ymax = Math.max(points[points.length - 1].Value, calculatedPoint.Value);
    const yPad = Math.round((ymax - ymin) / 2);
    const yDomain = [ymin - yPad, ymax + yPad];

    return {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, xDomain: xDomain, yDomain: yDomain};
  }

  getTrendLines(autofocus, points, calculatedPoint, domain) {
    if (!autofocus || !points || points.length === 0 || calculatedPoint.Position <= 0 || calculatedPoint.Value <= 0) {
      return null;
    }

    if (!autofocus.Fittings || !autofocus.Fittings.LeftTrend || !autofocus.Fittings.RightTrend) {
      return null;
    }

    if (autofocus.Fittings.LeftTrend.includes('NaN') || autofocus.Fittings.RightTrend.includes('NaN')) {
      return null;
    }

    const leftTrendLine = this.generateTrendLinePoints(true, autofocus.Fittings.LeftTrend, points, calculatedPoint, domain);
    const rightTrendLine = this.generateTrendLinePoints(false, autofocus.Fittings.RightTrend, points, calculatedPoint, domain);

    return {left: leftTrendLine, right: rightTrendLine};
  }

  generateTrendLinePoints(isLeft, lineEquation, points, calculatedPoint, domain) {
    if (calculatedPoint.Position <= 0 || calculatedPoint.Value <= 0) {
      return null;
    }

    let extend = (domain.xmax - domain.xmin) * .03;
    extend = isLeft ? extend : -1 * extend;

    const p1x = (isLeft ? points[0].Position : points[points.length - 1].Position) - extend;
    const p1y = evaluate(lineEquation, {x: p1x});
    const p2x = calculatedPoint.Position + extend;
    const p2y = evaluate(lineEquation, {x: p2x});

    return [{Position: p1x, Value: p1y}, {Position: p2x, Value: p2y}];
  }

  prep(autofocus) {

    if (!autofocus || !autofocus.MeasurePoints || !autofocus.CalculatedFocusPoint) {
      return {ready: false};
    }

    const points = autofocus.MeasurePoints;
    const calculatedPoint = autofocus.CalculatedFocusPoint;
    const domain = this.getDomain(points, calculatedPoint);
    const otherPoints = [calculatedPoint];
    const trendLines = this.getTrendLines(autofocus, points, calculatedPoint, domain);

    return {
      ready: true,
      points: points,
      domain: domain,
      otherPoints: otherPoints,
      trendLines: trendLines,
    };
  }

  render() {
    const {autofocus} = this.props;
    const {ready, points, domain, otherPoints, trendLines} = this.prep(autofocus);

    return (
        <div>
          {ready &&
              <div className="autofocus-tooltip">
                <div className="autofocus-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        width="500" height="500"
                        data={points}
                        margin={{top: 30, right: 30, left: 20, bottom: 30}}
                    >
                      <CartesianGrid strokeDasharray="3 2" stroke={'#666'}/>
                      <XAxis type="number" dataKey="Position" tickCount={10} domain={domain.xDomain}/>
                      <YAxis type="number" dataKey="Value" domain={domain.yDomain}
                             tickCount={6}
                             tickFormatter={(value) => precision(value, 3)}
                      />
                      <Line name="curve" type="linear" isAnimationActive={false} dataKey="Value" stroke="antiquewhite" dot={{fill: 'antiquewhite'}} activeDot={{r: 6}}>
                        <ErrorBar dataKey="Error" width={3} stroke="#700"/>
                      </Line>
                      <Scatter name="other" data={otherPoints} isAnimationActive={false} fill="#070" shape="diamond"/>
                      {trendLines && trendLines.left &&
                          <Line name="leftTrendLine"
                                data={trendLines.left} type="linear" dataKey="Value"
                                isAnimationActive={false}
                                dot={false}
                                stroke="#700" strokeWidth="1.5"
                                strokeDasharray="3 3"
                          />}
                      {trendLines && trendLines.right &&
                          <Line name="rightTrendLine"
                                data={trendLines.right} type="linear" dataKey="Value"
                                isAnimationActive={false}
                                dot={false}
                                stroke="#700" strokeWidth="1.5"
                                strokeDasharray="3 3"
                          />}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="autofocus-table">
                  <table>
                    <tbody>
                    <tr>
                      <td>Auto Focuser</td>
                      <td>{autofocus.AutoFocuserName}</td>
                    </tr>
                    <tr>
                      <td>Star Detector</td>
                      <td>{autofocus.StarDetectorName}</td>
                    </tr>
                    <tr>
                      <td>Time</td>
                      <td>{formatDateTimeISO(autofocus.Timestamp)}</td>
                    </tr>
                    <tr>
                      <td>Duration</td>
                      <td>{duration(autofocus.Duration)}</td>
                    </tr>
                    <tr>
                      <td>Final position</td>
                      <td>{autofocus.CalculatedFocusPoint.Position}</td>
                    </tr>
                    <tr>
                      <td>Final HFR</td>
                      <td>{precision(autofocus.CalculatedFocusPoint.Value, 3)} (estimated)</td>
                    </tr>
                    <tr>
                      <td>Temperature</td>
                      <td>{precision(autofocus.Temperature, 3)}</td>
                    </tr>
                    <tr>
                      <td>Filter</td>
                      <td>{autofocus.Filter}</td>
                    </tr>
                    <tr>
                      <td>Method</td>
                      <td>{autofocus.Method}</td>
                    </tr>
                    <tr>
                      <td>Fitting</td>
                      <td>{autofocus.Fitting}</td>
                    </tr>
                    <tr>
                      <td>Hyperbolic R<sup>2</sup></td>
                      <td>{precision(autofocus.RSquares.Hyperbolic)}</td>
                    </tr>
                    <tr>
                      <td>Trend Lines R<sup>2</sup></td>
                      <td>{precision(autofocus.RSquares.LeftTrend)} / {precision(autofocus.RSquares.RightTrend)}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
          }
          {!ready &&
              <div className="autofocus-tooltip">
                <p>Problem handling autofocus event</p>
              </div>
          }
        </div>
    );
  }
}

export default AutofocusChart;
