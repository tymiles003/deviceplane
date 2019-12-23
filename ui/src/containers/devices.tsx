// @ts-nocheck

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigation } from 'react-navi';

import api from '../api';
import { labelColors } from '../theme';
import Layout from '../components/layout';
import Card from '../components/card';
import Table from '../components/table';
import { Row, Badge, Text } from '../components/core';
import {
  DevicesFilter,
  Query,
  Filter,
  Condition,
  OperatorIs,
  LabelValueCondition,
} from '../components/DevicesFilter';
import { DevicesFilterButtons } from '../components/DevicesFilterButtons';
import DeviceStatus from '../components/device-status';
import { buildLabelColorMap, renderLabels } from '../helpers/labels';

// Runtime type safety
import * as deviceTypes from '../components/DevicesFilter-ti';
import { createCheckers } from 'ts-interface-checker';
import storage from '../storage';
import utils from '../utils';
const typeCheckers = createCheckers(deviceTypes.default);

const Params = {
  Filter: 'filter',
  Page: 'page',
  OrderedColumn: 'order_by',
  OrderDirection: 'order',
};

const Devices = ({ route }) => {
  const navigation = useNavigation();
  const [showFilterDialog, setShowFilterDialog] = useState();
  const [devices, setDevices] = useState(route.data.devices);
  const [filterQuery, setFilterQuery] = useState(
    storage.get('devicesFilter', route.data.params.project) || []
  );
  const [page, setPage] = useState(0);
  const [orderedColumn, setOrderedColumn] = useState();
  const [order, setOrder] = useState();
  const [labelColorMap, setLabelColorMap] = useState(
    buildLabelColorMap({}, labelColors, devices)
  );
  const [filterToEdit, setFilterToEdit] = useState(null);

  useEffect(() => {
    parseQueryString();
  }, []);

  useEffect(() => {
    queryDevices();
    storage.set('devicesFilter', filterQuery, route.data.params.project);
  }, [filterQuery]);

  const addLabelFilter = useCallback(
    (key, value) => {
      const labelFilter = [
        {
          type: LabelValueCondition,
          params: {
            key,
            operator: OperatorIs,
            value,
          },
        },
      ];
      if (!filterQuery.find(filter => utils.deepEqual(filter, labelFilter))) {
        setFilterQuery(filterQuery => [...filterQuery, labelFilter]);
      }
    },
    [filterQuery]
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Status',
        Cell: ({ row }) => <DeviceStatus status={row.original.status} />,
        sortType: 'basic',
        style: {
          flex: '0 0 100px',
        },
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'IP Address',
        Cell: ({ row }) => (
          <Text>
            {row.original.info.hasOwnProperty('ipAddress')
              ? row.original.info.ipAddress
              : ''}
          </Text>
        ),
        style: {
          flex: '0 0 150px',
        },
      },
      {
        Header: 'OS',
        Cell: ({ row }) => (
          <Text>
            {row.original.info.hasOwnProperty('osRelease') &&
            row.original.info.osRelease.hasOwnProperty('prettyName')
              ? row.original.info.osRelease.prettyName
              : '-'}
          </Text>
        ),
      },
      {
        Header: 'Labels',
        Cell: ({ row }) =>
          row.original.labels
            ? renderLabels(row.original.labels, labelColorMap, addLabelFilter)
            : null,
        style: {
          flex: 2,
          overflow: 'hidden',
        },
      },
    ],
    [filterQuery]
  );
  const tableData = useMemo(() => devices, [devices]);

  const fetchDevices = async (queryString: string) => {
    try {
      const { data } = await api.devices({
        projectId: route.data.params.project,
        queryString,
      });
      setDevices(data);
      setLabelColorMap(buildLabelColorMap(labelColorMap, labelColors, data));
    } catch (error) {
      console.log(error);
    }
  };

  const queryDevices = () => {
    var query: string[] = [];

    query.push(`${Params.Page}=${page}`);
    if (orderedColumn) {
      query.push(`${Params.OrderedColumn}=${orderedColumn}`);
    }
    if (order) {
      query.push(`${Params.OrderDirection}=${order}`);
    }
    query.push(...buildFiltersQuery());

    const queryString = '?' + query.join('&');
    window.history.pushState(
      '',
      '',
      query.length ? queryString : window.location.pathname
    );
    fetchDevices(queryString);
  };

  const removeFilter = (index: number) => {
    setPage(0);
    setFilterQuery(filterQuery.filter((_, i) => i !== index));
  };

  const addFilter = (filter: Filter) => {
    setPage(0);
    setShowFilterDialog(false);
    if (filterToEdit !== null) {
      setFilterQuery(filterQuery =>
        filterQuery.map((f, index) => (index === filterToEdit ? filter : f))
      );
    } else {
      setFilterQuery(filterQuery => [...filterQuery, filter]);
    }
    setFilterToEdit(null);
  };

  const clearFilters = () => {
    setPage(0);
    setFilterQuery([]);
  };

  const buildFiltersQuery = (): string[] =>
    [...Array.from(new Set(filterQuery))].map(
      filter =>
        `${Params.Filter}=${encodeURIComponent(btoa(JSON.stringify(filter)))}`
    );

  const parseQueryString = () => {
    if (!window.location.search || window.location.search.length < 1) {
      return;
    }

    var builtQuery: Query = [];
    var page = 0;
    var orderedColumn = undefined;
    var order = undefined;

    let queryParams = window.location.search.substr(1).split('&');
    queryParams.forEach(queryParam => {
      const parts = queryParam.split('=');
      if (parts.length < 2) {
        return;
      }

      switch (parts[0]) {
        case Params.Filter: {
          let encodedFilter = parts[1];
          if (encodedFilter) {
            try {
              const filter = JSON.parse(
                atob(decodeURIComponent(encodedFilter))
              );

              const validFilter = filter.filter((c: Condition) => {
                return typeCheckers['Condition'].strictTest(c);
              });

              if (validFilter.length) {
                builtQuery.push(validFilter);
              }
            } catch (e) {
              console.log('Error parsing filters:', e);
            }
          }
          break;
        }
        case Params.Page: {
          let p = Number(parts[1]);
          if (!isNaN(p)) {
            page = p;
          }
          break;
        }
        case Params.OrderedColumn: {
          let p = parts[1];
          if (p) {
            orderedColumn = p;
          }
          break;
        }
        case Params.OrderDirection: {
          let p = parts[1];
          if (p) {
            order = p;
          }
          break;
        }
      }
    });
    setPage(page);
    setOrderedColumn(orderedColumn);
    setOrder(order);
    setFilterQuery(builtQuery);
  };

  return (
    <Layout title="Devices">
      <Card
        title="Devices"
        size="full"
        actions={[
          ...(filterQuery.length
            ? [
                {
                  title: 'Clear Filters',
                  onClick: clearFilters,
                  variant: 'text',
                },
              ]
            : []),
          {
            title: 'Add Filter',
            variant: 'secondary',
            onClick: () => setShowFilterDialog(true),
          },
          {
            title: 'Register Device',
            href: `/${route.data.params.project}/devices/register`,
          },
        ]}
      >
        {filterQuery.length > 0 && (
          <Row marginBottom={4}>
            <DevicesFilterButtons
              canRemoveFilter
              query={filterQuery}
              removeFilter={removeFilter}
              onEdit={index => {
                setFilterToEdit(index);
                setShowFilterDialog(true);
              }}
            />
          </Row>
        )}
        <Table
          columns={columns}
          data={tableData}
          onRowSelect={({ name }) =>
            navigation.navigate(`/${route.data.params.project}/devices/${name}`)
          }
          placeholder={
            <Text>
              There are no <strong>Devices</strong>.
            </Text>
          }
        />
      </Card>

      {showFilterDialog && (
        <DevicesFilter
          filter={filterToEdit !== null && filterQuery[filterToEdit]}
          onClose={() => {
            setShowFilterDialog(false);
            setFilterToEdit(null);
          }}
          onSubmit={addFilter}
        />
      )}
    </Layout>
  );
};

export default Devices;
