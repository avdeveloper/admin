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
    Header: 'Status',
    accessor: 'Status',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
    width: 65,
  },
  {
    Header: 'Date Crated',
    accessor: 'DateCreated',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Data Published',
    accessor: 'DatePublished',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Icon',
    accessor: 'Icon',
    Cell: row => <img alt="form-icon" height={34} src={row.value} title={row.icon} />,
    width: 45,
  },
  {
    Header: 'Group',
    accessor: 'Group',
    Cell: (row) => { if (row.value) return row.value.join(','); return '-'; },
  },
  {
    Header: 'Formio Get Endpoint',
    accessor: 'formEndpoint',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Unique Users',
    accessor: 'unique_users',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Submissions',
    accessor: 'submissions',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Categories',
    accessor: 'categories',
    Cell: (row) => { if (row.value) return row.value.join(); return '-'; },

  },
];
