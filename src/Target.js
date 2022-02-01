import React from 'react';
import ImageTable from './ImageTable';
import {getImageRecords, getThumbnailSize} from './utilities/sessionUtils';
import {Panel} from 'rsuite';
import PlaceholderWrapper from './utilities/wrappers';

const consola = require('consola');

class Target extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      rows: [],
      mq992: window.matchMedia('(min-width: 992px)'),
    };
  }

  componentDidMount() {
    const {target, sessionPath} = this.props;
    if (target && sessionPath) {
      this.startPrep(target, sessionPath);
    }

    this.state.mq992.onchange = (event) => {
      this.setState({
        displaySize: this.getDisplaySize(this.state.thumbnailSize),
      });
    };
  }

  componentWillUnmount() {
    this.state.mq992.onchange = null;
  }

  startPrep(target, sessionPath) {

    if (this.state.ready) {
      return true;
    }

    const rows = getImageRecords(target);
    if (rows && rows.length > 0) {
      this.state.rows = rows;
      consola.trace('Target: prep, rows: ' + rows.length);

      getThumbnailSize(sessionPath, rows[0], (thumbnailSize) => {
        const displaySize = this.getDisplaySize(thumbnailSize);
        this.setState({
          thumbnailSize: thumbnailSize,
          displaySize: displaySize,
          ready: true,
        });
      });
    }

    return false;
  }

  getDisplaySize(thumbnailSize) {
    return this.state.mq992.matches ?
        {width: thumbnailSize.width, height: thumbnailSize.height} :
        {width: thumbnailSize.width / 3, height: thumbnailSize.height / 3};
  }

  render() {
    const {active, target, sessionPath, imageClick} = this.props;
    const {ready, rows, displaySize} = this.state;

    consola.trace('Target: render, ready=' + ready);

    return <Panel header={'Target: ' + target.name} collapsible bordered defaultExpanded={active}>
      <PlaceholderWrapper enabled={!ready}/>
      {ready &&
      <ImageTable sessionPath={sessionPath} rows={rows} size={displaySize} imageClick={imageClick}/>
      }
    </Panel>;
  }
}

export default Target;
