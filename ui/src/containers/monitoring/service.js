import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from 'react-navi';
import { Tooltip, Icon } from 'evergreen-ui';

import storage from '../../storage';
import theme from '../../theme';
import Card from '../../components/card';
import Table from '../../components/table';
import Popup from '../../components/popup';
import DeviceLabel from '../../components/device-label';
import {
  Group,
  Button,
  Label,
  Row,
  Column,
  Text,
  Checkbox,
  Input,
  Select,
  Code,
} from '../../components/core';

const Service = ({
  route: {
    data: { params, applications, metrics },
  },
}) => {
  const [selectedService, setSelectedService] = useState(
    storage.get('selectedService', params.project)
  );
  const [metricToDelete, setMetricToDelete] = useState();

  const submitDelete = metric => {};

  const submit = () => {};

  useEffect(() => {
    storage.set('selectedService', selectedService, params.project);
  }, [selectedService]);

  const tableData = useMemo(() => metrics, [metrics]);

  const columns = useMemo(
    () => [
      {
        Header: 'Metric',
        Cell: ({ row: { original } }) => <Code>{original.name}</Code>,
      },
      {
        Header: 'Labels',
        Cell: ({ row: { original } }) =>
          original.labels.map(label => <DeviceLabel {...label} />),
      },
      {
        id: 'Device Tag',
        Header: (
          <Row alignItems="center">
            <Tooltip content="When selected a Datadog tag with the Device ID will be included.">
              <Icon icon="info-sign" size={10} color={theme.colors.primary} />
            </Tooltip>
            <Text marginLeft={1}>Device Tag</Text>
          </Row>
        ),
        Cell: ({ row: { original } }) => (
          <Checkbox value={original.deviceTag} />
        ),
        style: {
          flex: '0 0 125px',
          justifyContent: 'center',
        },
      },
      {
        Header: ' ',
        Cell: ({ row: { original } }) => {
          return (
            <Row>
              <Button
                title={
                  <Icon icon="edit" size={18} color={theme.colors.primary} />
                }
                variant="icon"
                href="edit-metrics"
              />
              <Button
                title={
                  <Icon icon="trash" size={18} color={theme.colors.white} />
                }
                variant="icon"
                marginLeft={4}
                onClick={() => setMetricToDelete(original)}
              />
            </Row>
          );
        },
        style: {
          flex: '0 0 150px',
          justifyContent: 'flex-end',
        },
      },
    ],
    []
  );
  const selectOptions = useMemo(
    () =>
      applications
        .reduce((list, app) => {
          if (app.latestRelease) {
            return [
              ...list,
              ...Object.keys(app.latestRelease.config).map(service => ({
                app,
                service,
              })),
            ];
          }
          return list;
        }, [])
        .map(({ app, service }) => ({
          label: `${app.name}/${service}`,
          value: `${app.name}/${service}`,
        })),
    [applications]
  );

  return (
    <>
      <Row marginBottom={4} width={9}>
        <Select
          onChange={setSelectedService}
          value={selectedService}
          options={selectOptions}
          placeholder="Select a Service"
          noOptionsMessage={() => (
            <Text>
              There are no <strong>Services</strong>.
            </Text>
          )}
        />
      </Row>
      <Card
        title="Service Metrics"
        size="full"
        actions={[{ title: 'Add Serice Metric', href: 'add-metric' }]}
        disabled={!selectedService}
      >
        <Table
          data={tableData}
          columns={columns}
          placeholder={
            <Text>
              There are no <strong>Service Metric Rules</strong>.
            </Text>
          }
        />
      </Card>
      <Popup show={!!metricToDelete}>
        <Card border title="Delete Service Metric" size="medium">
          <Text>
            You are about to delete the{' '}
            <strong>{metricToDelete && metricToDelete.name}</strong> metric.
          </Text>
          <Button marginTop={5} title="Delete" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default Service;
