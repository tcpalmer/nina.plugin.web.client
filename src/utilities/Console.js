import React from 'react';
import {List} from 'rsuite';

const consola = require('consola');

class Console extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {messages} = this.props;

    consola.trace('Console render ' + messages.length + ' messages');

    return <List size="sm" bordered>
      {messages.map((item, index) => (
          <List.Item key={index} index={index} className={'console-item-' + item.type}>
            {item.date + ' ' + item.message}
          </List.Item>
      ))}
    </List>;
  }

}

export default Console;
