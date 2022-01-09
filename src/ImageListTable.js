import React from 'react';
import 'rsuite-table/dist/css/rsuite-table.css';
import {Cell, Column, HeaderCell, Table} from 'rsuite-table';

const consola = require('consola');

class ImageListTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let {data} = this.props;
    consola.trace('ImageListTable render: ' + data.length + ' rows');

    return <Table
        autoHeight
        data={this.props.data}
        //sortColumn={sortColumn}
        //sortType={sortType}
        //onSortColumn={handleSortColumn}
        //loading={loading}
    >
      <Column width={100} sortable fixed resizable>
        <HeaderCell>ID</HeaderCell>
        <Cell dataKey="index"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Started</HeaderCell>
        <Cell dataKey="started"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Duration</HeaderCell>
        <Cell dataKey="duration"/>
      </Column>

      <Column width={100} sortable resizable>
        <HeaderCell>Filter</HeaderCell>
        <Cell dataKey="filter"/>
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
        <ThumbnailCell dataKey="id"/>
      </Column>

    </Table>;
  }
}

const ThumbnailCell = ({rowData, dataKey, ...props}) => (
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
        <img src={'/sessions/20220106-060746/thumbnails/13545edd-e06d-4b47-94b9-252cb9436ed9.jpg'} width="40"
             alt="thumbnail"/>
      </div>
    </Cell>
);

export default ImageListTable;
