//

import React from 'react';
import Placeholder from 'rsuite/Placeholder';

function PlaceholderWrapper(props) {
  if (!props.enabled) {
    return null;
  }

  return <Placeholder.Grid rows={props.rows} columns={props.columns} active={props.active}/>;
}

PlaceholderWrapper.defaultProps = {
  rows: 10,
  columns: 6,
  active: true
};

export default PlaceholderWrapper;
