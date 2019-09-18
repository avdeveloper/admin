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
    Header: 'Full Name',
    accessor: 'fullName',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Email',
    accessor: 'email',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Phone',
    accessor: 'phone',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: row => (Number(row.value) === 1 ? 'Active' : 'Suspended'),
  },
  {
    Header: 'Role',
    accessor: 'role',
    Cell: row => (Number(row.value) === 0 ? 'User' : 'Admin'),
  },
  {
    Header: 'Groups',
    accessor: 'groups',
    Cell: (row) => { if (row.value) return row.value.join(','); return '-'; },
  },
  {
    Header: 'Notes',
    accessor: 'notes',
    Cell: (row) => { if (row.value) return row.value; return '-'; },
  },
];
