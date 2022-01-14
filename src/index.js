import ReactDOM from 'react-dom';
import App from './App';
import {CustomProvider} from 'rsuite';
import 'rsuite/styles/index.less';
import './custom.less';

ReactDOM.render(<CustomProvider theme="dark">
  <App/>
</CustomProvider>, document.getElementById('root'));
