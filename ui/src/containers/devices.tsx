// @ts-nocheck

import React, { useEffect, useState, useMemo } from 'react';
import {
  TextDropdownButton,
  Menu,
  Position,
  Popover,
  // @ts-ignore
} from 'evergreen-ui';
import { useNavigation } from 'react-navi';

import api from '../api.js';
import { labelColors } from '../theme';
import Layout from '../components/layout';
import Card from '../components/card';
import Table from '../components/table';
import { Text, Button, Badge } from '../components/core';
import {
  DevicesFilter,
  Query,
  Filter,
  Condition,
} from '../components/DevicesFilter';
import { DevicesFilterButtons } from '../components/DevicesFilterButtons';
import { buildLabelColorMap, renderLabels } from '../helpers/labels';

// Runtime type safety
import * as deviceTypes from '../components/DevicesFilter-ti';
import { createCheckers } from 'ts-interface-checker';
const typeCheckers = createCheckers(deviceTypes.default);

const Params = {
  Filter: 'filter',
  Page: 'page',
  OrderedColumn: 'order_by',
  OrderDirection: 'order',
};

const Order = {
  ASC: 'asc',
  DESC: 'desc',
};

const Devices = ({ route }) => {
  const navigation = useNavigation();
  const [showFilterDialog, setShowFilterDialog] = useState();
  const [devices, setDevices] = useState(route.data.devices);
  const [filterQuery, setFilterQuery] = useState([]);
  const [page, setPage] = useState(0);
  const [orderedColumn, setOrderedColumn] = useState();
  const [order, setOrder] = useState();
  const [labelColorMap, setLabelColorMap] = useState({});

  const columns = useMemo(
    () => [
      {
        Header: 'Status',
        Cell: ({ row }) =>
          row.original.status === 'offline' ? (
            <Badge bg="whites.8">offline</Badge>
          ) : (
            <Badge bg="green">online</Badge>
          ),
        sortType: 'basic',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'IP Address',
        Cell: ({ row }) =>
          row.original.info.hasOwnProperty('ipAddress')
            ? row.original.info.ipAddress
            : '',
      },
      {
        Header: 'OS',
        Cell: ({ row }) =>
          row.original.info.hasOwnProperty('osRelease') &&
          row.original.info.osRelease.hasOwnProperty('prettyName')
            ? row.original.info.osRelease.prettyName
            : '-',
      },
      {
        Header: 'Labels',
        Cell: ({ row }) =>
          row.original.labels
            ? renderLabels(row.original.labels, labelColorMap)
            : null,
      },
    ],
    []
  );
  const tableData = useMemo(() => devices, [devices]);

  const fetchDevices = (queryString: string) => {
    return api
      .devices({ projectId: route.data.params.project, queryString })
      .then(({ data }) => {
        const labelColorMap = buildLabelColorMap(
          labelColorMap,
          labelColors,
          devices
        );
        setDevices(data);
        setLabelColorMap(labelColorMap);
      })
      .catch(console.log);
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
    queryDevices();
  };

  const addFilter = (filter: Filter) => {
    setPage(0);
    setShowFilterDialog(false);
    setFilterQuery([...filterQuery, filter]);
    queryDevices();
  };

  const clearFilters = () => {
    setPage(0);
    setFilterQuery([]);
    queryDevices();
  };

  const buildFiltersQuery = (): string[] =>
    [...Array.from(new Set(filterQuery))].map(
      filter =>
        `${Params.Filter}=${encodeURIComponent(btoa(JSON.stringify(filter)))}`
    );

  const parseQueryString = () => {
    return new Promise(resolve => {
      if (!window.location.search || window.location.search.length < 1) {
        resolve();
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
      setFilterQuery([...filterQuery, ...builtQuery]);
      resolve();
    });
  };

  const getIconForOrder = (order?: string) => {
    switch (order) {
      case Order.ASC:
        return 'arrow-up';
      case Order.DESC:
        return 'arrow-down';
      default:
        return 'caret-down';
    }
  };

  const renderOrderedTableHeader = (title: string, jsonName: string) => (
    <Popover
      position={Position.BOTTOM_LEFT}
      content={({ close }: any) => (
        <Menu>
          <Menu.OptionsGroup
            title="Order"
            options={[
              { label: 'Ascending', value: Order.ASC },
              { label: 'Descending', value: Order.DESC },
            ]}
            selected={orderedColumn === jsonName ? order : ''}
            onChange={(value: string) => {
              setOrderedColumn(jsonName);
              setOrder(value);
              queryDevices();

              // Close the popover when you select a value.
              close();
            }}
          />
        </Menu>
      )}
    >
      <TextDropdownButton
        icon={
          orderedColumn === jsonName ? getIconForOrder(order) : 'caret-down'
        }
        color="white"
      >
        {title}
      </TextDropdownButton>
    </Popover>
  );

  return (
    // @ts-ignore
    <Layout title="Devices">
      {/* 
  // @ts-ignore */}
      <Card
        title="Devices"
        size="full"
        actions={[
          ...(filterQuery.length
            ? [
                {
                  title: 'Clear Filters',
                  onClick: clearFilters,
                  variant: 'tertiary',
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
          <DevicesFilterButtons
            canRemoveFilter
            query={filterQuery}
            removeFilter={removeFilter}
          />
        )}
        <Table
          columns={columns}
          data={tableData}
          onRowSelect={({ name }) =>
            navigation.navigate(`/${route.data.params.project}/devices/${name}`)
          }
        />
      </Card>

      <DevicesFilter
        show={showFilterDialog}
        onClose={() => showFilterDialog(false)}
        onSubmit={addFilter}
      />
    </Layout>
  );
};

export default Devices;
