import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import 'bootstrap/dist/css/bootstrap.css';

const Table = ({ data, tableConfig, loading }) => (
  <ReactTable
    columns={tableConfig}
    defaultPageSize={10}
    data={data}
    noDataText={loading ? '' : 'No rows found'}
    loading={loading}
  />
);

export default Table;
