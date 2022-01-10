import React from 'react';
import {Cell, Column, HeaderCell, Table} from 'rsuite-table';
import Placeholder from 'rsuite/Placeholder';
import 'rsuite-table/dist/css/rsuite-table.css';
//import 'rsuite/styles/index.less';
//import './custom-theme.less';

const consola = require('consola');

class ImageListTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      lang: navigator.language,
      sortColumn: 'index',
      sortType: 'asc',
    };
  }

  getSortedRows() {
    const {sortColumn, sortType} = this.state;
    const {rows} = this.props;

    consola.trace('ImageListTable getSortedRows: ' + rows.length + ' rows');

    if (sortColumn && sortType) {
      return rows.sort((a, b) => {
        const x = a[sortColumn];
        const y = b[sortColumn];
        if (typeof x === 'string') {
          return (sortType === 'asc') ? x.localeCompare(y, this.state.lang) : y.localeCompare(x, this.state.lang);
        } else {
          return (sortType === 'asc') ? x - y : y - x;
        }
      });
    }

    return rows;
  }

  handleSortColumn = (sortColumn, sortType) => {
    this.setState({
      sortColumn: sortColumn,
      sortType: sortType,
    });
  };

  render() {
    consola.trace('ImageListTable render');
    const {sortColumn, sortType} = this.state;
    const {urlPath} = this.props;

    if (!this.props.rows || this.props.rows.length === 0) {
      return <Placeholder.Grid rows={5} columns={7} active={false}/>;
    }

    return <Table
        autoHeight
        data={this.getSortedRows()}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={this.handleSortColumn}
        loading={false}
    >
      <Column width={100} sortable fixed resizable>
        <HeaderCell>ID</HeaderCell>
        <Cell dataKey="index"/>
      </Column>

      <Column width={100} resizable>
        <HeaderCell>Started</HeaderCell>
        <Cell dataKey="started"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Duration</HeaderCell>
        <Cell dataKey="duration"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Filter</HeaderCell>
        <Cell dataKey="filterName"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Stars</HeaderCell>
        <Cell dataKey="detectedStars"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>HFR</HeaderCell>
        <Cell dataKey="HFR"/>
      </Column>

      <Column width={400} resizable>
        <HeaderCell>Image</HeaderCell>
        <ThumbnailCell dataKey="id" urlPath={urlPath}/>
      </Column>

    </Table>;
  }
}

const ThumbnailCell = ({urlPath, rowData, dataKey, ...props}) => (
    <Cell {...props} style={{padding: 0}}>
      <div
          style={{
            width: 256,
            height: 192,
            //background: '#f5f5f5',
            //: 20,
            //marginTop: 2,
            //overflow: 'hidden',
            //display: 'inline-block'
          }}
      >
        <img src={urlPath + '/thumbnails/' + rowData[dataKey] + '.jpg'} width="40" alt="thumbnail n/a"/>
      </div>
    </Cell>
);

export default ImageListTable;
