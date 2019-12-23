import React, { useMemo } from 'react';
import moment from 'moment';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Table from '../../components/table';
import { Text } from '../../components/core';

const ReleasedBy = ({ release }) => {
  if (release) {
    if (release.createdByUser) {
      return `${release.createdByUser.firstName} ${release.createdByUser.lastName}`;
    } else if (release.createdByServiceAccount) {
      return release.createdByServiceAccount.name;
    }
  }
  return '-';
};

const Releases = ({
  route: {
    data: { params, application, releases },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(
    () => [
      { Header: 'Release ID', accessor: 'id', style: { flex: 2 } },
      {
        Header: 'Released by',
        Cell: ({ row: { original } }) => (
          <Text>
            <ReleasedBy release={original} />
          </Text>
        ),
      },
      {
        Header: 'Started',
        Cell: ({
          row: {
            original: { createdAt },
          },
        }) => <Text>{moment(createdAt).fromNow()}</Text>,
      },
      {
        Header: 'Device count',
        accessor: 'deviceCounts.allCount',
      },
    ],
    []
  );
  const tableData = useMemo(() => releases, [releases]);

  return (
    <Card
      title="Releases"
      size="full"
      actions={[
        {
          title: 'Create Release',
          href: `/${params.project}/applications/${application.name}/releases/create`,
        },
      ]}
    >
      <Table
        columns={columns}
        data={tableData}
        onRowSelect={({ id }) =>
          navigation.navigate(
            `/${params.project}/applications/${application.name}/releases/${id}`
          )
        }
        placeholder={
          <Text>
            There are no <strong>Releases</strong>.
          </Text>
        }
      />
    </Card>
  );
};

export default Releases;
