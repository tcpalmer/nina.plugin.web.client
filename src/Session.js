import React from 'react';

const consola = require('consola');

class Session extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  // TODO: how can we tell if a Session is still live or not?

  render() {
    consola.trace('Session render');
    return <div></div>;
  }

}

export default Session;
