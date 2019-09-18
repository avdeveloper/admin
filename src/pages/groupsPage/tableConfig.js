import React from 'react';

export default [
  {
    Header: 'Del',
    accessor: 'removeButton',
    width: 40,
    Cell: row => (
      <span
        onClick={row.value}
        className="add-form__table-btn"
        role="img"
        aria-label="trash"
      >
        &#128465;
      </span>
    ),
  },
  {
    Header: 'Edit',
    accessor: 'editButton',
    width: 50,
    Cell: row => (
      <span
        onClick={row.value}
        className="add-form__table-btn"
        role="img"
        aria-label="ok"
      >
        &#x270D;
      </span>
    ),
  },
  {
    Header: 'Names',
    accessor: 'name',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Type',
    accessor: 'type',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Description',
    accessor: 'description',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Forms',
    accessor: 'forms',
    Cell: row => (
      <span>
        {`${(row.value ? row.value : [{}]).map(i => i.label).join(', ')}`}
      </span>
    ),
  },
  {
    Header: 'Users',
    accessor: 'users',
    Cell: row => (
      <span>
        {`${(row.value ? row.value : [{}]).map(i => i.label).join(', ')}`}
      </span>
    ),
  },
  {
    Header: 'User count',
    accessor: 'userCount',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
];
