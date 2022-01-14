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

  // TODO: I think I want to render each row as 2 columns:
  //   a bigger thumbnail
  //   a vertical list of the image props
  //   BUT then you can't sort by stars, HFR, etc
  //   UNLESS you have some higher level controls outside the table:
  //     set the sort column
  //     filter by filter
  //   OR still have the columns - but can shove whatever into that vertical list?

  render() {
    consola.trace('ImageListTable render');
    const {sortColumn, sortType} = this.state;
    const {sessionPath} = this.props;
    const notLoaded = !this.props.rows || this.props.rows.length === 0;

    return <Panel header="Acquired Images" bordered bodyFill>
      <PlaceholderWrapper enabled={notLoaded}/>
      {!notLoaded &&
      <Table
          height={600}
          rowHeight={192}
          data={this.getSortedRows()}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={this.handleSortColumn}
          loading={false}
      >
        <Column width={256} fixed>
          <HeaderCell>Image</HeaderCell>
          <ThumbnailCell dataKey="id" sessionPath={sessionPath}/>
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

const ThumbnailCell = ({sessionPath, rowData, dataKey, ...props}) => (
    <Cell {...props} style={{padding: 0}}>
      <div
          style={{
            //background: '#f5f5f5',
            //: 20,
            //marginTop: 2,
            //overflow: 'hidden',
            //display: 'inline-block'
          }}
      >
        <img src={sessionPath + '/thumbnails/' + rowData[dataKey] + '.jpg'} alt="thumbnail n/a"/>
      </div>
    </Cell>
);

export default ImageTable;
