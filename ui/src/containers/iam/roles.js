import React, { useMemo } from 'react';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Table from '../../components/table';

const Roles = ({
  route: {
    data: { params, roles },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(() => [{ Header: 'Name', accessor: 'name' }], []);
  const tableData = useMemo(() => roles, [roles]);

  return (
    <Card
      title="Roles"
      size="large"
      actions={[
        {
          href: `create`,
          title: 'Create role',
        },
      ]}
    >
      <Table
        columns={columns}
        data={tableData}
        onRowSelect={({ name }) =>
          navigation.navigate(`/${params.project}/iam/roles/${name}`)
        }
      />
    </Card>
  );
};

export default Roles;