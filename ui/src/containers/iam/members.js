import React, { useMemo } from 'react';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Table from '../../components/table';

const Members = ({
  route: {
    data: { params, members },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(
    () => [
      { Header: 'Email', accessor: 'user.email' },
      {
        Header: 'Name',
        Cell: ({
          row: {
            original: {
              user: { firstName, lastName },
            },
          },
        }) => `${firstName} ${lastName}`,
      },
      {
        Header: 'Roles',
        Cell: ({
          row: {
            original: { roles },
          },
        }) => roles.map(({ name }) => name).join(', '),
      },
    ],
    []
  );
  const tableData = useMemo(() => members, [members]);

  return (
    <Card
      title="Members"
      size="xlarge"
      actions={[{ href: 'add', title: 'Add member' }]}
    >
      <Table
        columns={columns}
        data={tableData}
        onRowSelect={({ user }) => {
          navigation.navigate(`/${params.project}/iam/members/${user.id}`);
        }}
        placeholder="There are no Members."
      />
    </Card>
  );
};

export default Members;
