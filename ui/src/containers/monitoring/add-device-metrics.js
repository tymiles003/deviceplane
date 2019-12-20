import React, { useState, useMemo } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import { toaster } from 'evergreen-ui';
import * as yup from 'yup';

import utils from '../../utils';
import api from '../../api';
import config from '../../config';
import theme from '../../theme';
import validators from '../../validators';
import Field from '../../components/field';
import Card from '../../components/card';
import Alert from '../../components/alert';
import DeviceLabel from '../../components/device-label';
import { buildLabelColorMap } from '../../helpers/labels';
import { getMetricLabel } from '../../helpers/metrics';
import {
  Row,
  Form,
  Button,
  Checkbox,
  Select,
  Text,
} from '../../components/core';

const properties = [
  {
    id: 'device',
    label: 'Include Device Tag',
  },
];

const metricsOptions = config.supportedDeviceMetrics.map(value => ({
  label: getMetricLabel(value),
  value,
}));

const AddDeviceMetrics = ({
  route: {
    data: { params, metrics, devices },
  },
}) => {
  const { register, handleSubmit, errors, setValue } = useForm({});
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();
  const [options, setOptions] = useState([]);
  const [labelColorMap, setLabelColorMap] = useState(
    buildLabelColorMap({}, theme.labelColors, metrics)
  );

  const labelsOptions = useMemo(() => {
    const uniqueLabels = devices.reduce(
      (labels, device) => [
        ...labels,
        ...Object.keys(device.labels).map(key => ({
          key,
          value: device.labels[key],
        })),
      ],
      []
    );

    return uniqueLabels.map(({ key, value }) => ({
      value: `${key}:${value}`,
      props: { label: { key, value, color: labelColorMap[key] } },
      Component: DeviceLabel,
    }));
  }, [devices]);

  const submit = async data => {
    try {
      await api.updateDeviceMetricsConfig({
        projectId: params.project,
        data: data.metrics.map(({ value }) => ({
          name: value,
          properties: Object.keys(data.properties),
          labels: data.labels || [],
        })),
      });
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Metrics were not added.');
      console.log(error);
    }

    if (!backendError) {
      toaster.success('Metrics added successfully.');
      navigation.navigate(`/${params.project}/monitoring/device`);
    }
  };

  return (
    <Card title="Add Device Metrics" size="xlarge">
      <Alert show={backendError} variant="error" description={backendError} />
      <Form
        onSubmit={e => {
          setBackendError(null);
          handleSubmit(submit)(e);
        }}
      >
        <Field
          required
          autoFocus
          label="Metrics"
          name="metrics"
          as={
            <Select
              multi
              options={metricsOptions}
              placeholder="Select metrics"
            />
          }
          setValue={setValue}
          register={register}
          errors={errors.metrics}
        />
        <Field
          label="Labels"
          name="labels"
          setValue={setValue}
          register={register}
          as={
            <Select
              multi
              options={labelsOptions}
              placeholder="Select labels"
              noOptionsMessage={() => (
                <Text>
                  There are no <strong>Labels</strong>.
                </Text>
              )}
            />
          }
          errors={errors.description}
        />
        {properties.map(property => (
          <Field
            group
            key={property.id}
            name={`properties[${property.id}]`}
            as={<Checkbox label={property.label} />}
            register={register}
            setValue={setValue}
          />
        ))}

        <Button title="Add" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="text"
          href={`/${params.project}/monitoring/device`}
        />
      </Row>
    </Card>
  );
};

export default AddDeviceMetrics;
