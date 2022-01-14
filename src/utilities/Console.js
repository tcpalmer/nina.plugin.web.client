import React from 'react';
import {List} from 'rsuite';
import {formatDateTime} from './utils';

const consola = require('consola');

class Console extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  format(date, message) {
    return formatDateTime(date) + ' ' + message;
  }

  render() {
    const {messages} = this.props;

    consola.trace('Console render ' + messages.length + ' messages');

    return <List size="sm" bordered>
      {messages.map((item, index) => (
          <List.Item key={index} index={index} className={'console-item-' + item.type}>
            {this.format(item.date, item.message)}
          </List.Item>
      ))}
    </List>;
  }
}

export default Console;
