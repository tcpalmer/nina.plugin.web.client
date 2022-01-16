import React from 'react';
import {Cell, Column, HeaderCell, Table} from 'rsuite-table';
import {Panel} from 'rsuite';
import PlaceholderWrapper from './utilities/wrappers';

const consola = require('consola');

class ImageTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      lang: navigator.language,
      sortColumn: 'index',
      sortType: 'desc',
    };
  }

  getSortedRows() {
    const {sortColumn, sortType} = this.state;
    const {rows} = this.props;

    consola.trace('ImageTable: getSortedRows: ' + rows.length + ' rows');

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

  // TODO: add filter by filter

  render() {
    const {sortColumn, sortType} = this.state;
    const {sessionPath, rows, size} = this.props;
    const loaded = rows && rows.length > 0;

    consola.trace('ImageTable: render, row/col: ' + JSON.stringify(size));

    return <Panel header="Acquired Images" bordered bodyFill>
      <PlaceholderWrapper enabled={!loaded}/>
      {loaded &&
      <Table
          height={600}
          rowHeight={size.height}
          data={this.getSortedRows()}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={this.handleSortColumn}
          loading={false}
      >
        <Column width={size.width} fixed>
          <HeaderCell>Image</HeaderCell>
          <ThumbnailCell dataKey="id" sessionPath={sessionPath} thumbnailSize={size}/>
        </Column>

        <Column width={60} sortable resizable>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="index"/>
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
          <Cell dataKey="hfrText"/>
        </Column>

        <Column width={180} resizable>
          <HeaderCell>Started At</HeaderCell>
          <Cell dataKey="started"/>
        </Column>

      </Table>}
    </Panel>;
  }
}

const ThumbnailCell = ({sessionPath, thumbnailSize, rowData, dataKey, ...props}) => (
    <Cell {...props} style={{padding: 0}}>
      <div>
        <img src={sessionPath + '/thumbnails/' + rowData[dataKey] + '.jpg'} alt="thumbnail n/a" width={thumbnailSize.width} height={thumbnailSize.height}/>
      </div>
    </Cell>
);

export default ImageTable;
