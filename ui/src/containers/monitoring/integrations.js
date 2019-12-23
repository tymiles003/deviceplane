import React, { useState } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { useNavigation } from 'react-navi';

import { Form, Button } from '../../components/core';
import Card from '../../components/card';
import Alert from '../../components/alert';
import Field from '../../components/field';
import api from '../../api';
import { toaster } from 'evergreen-ui';
import utils from '../../utils';

const validationSchema = yup.object().shape({
  datadogApiKey: yup.string(),
});

const Integrations = ({
  route: {
    data: { params, project },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    validationSchema,
    defaultValues: {
      datadogApiKey: project.datadogApiKey,
    },
  });
  const [backendError, setBackendError] = useState();
  const navigation = useNavigation();

  const submit = async data => {
    try {
      await api.updateProject({
        projectId: params.project,
        data: { name: params.project, ...data },
      });
      toaster.success('Integrations successfully updated.');
      if (!project.datadogApiKey) {
        navigation.navigate(`/${params.project}/monitoring/device`);
      }
      navigation.refresh();
    } catch (error) {
      const message = utils.parseError(error);
      setBackendError(message);
      toaster.danger('Integrations not successfully updated.');
      console.log(error);
    }
  };

  return (
    <Card title="Integrations">
      <Alert show={backendError} variant="error" description={backendError} />
      <Form
        onSubmit={e => {
          setBackendError(null);
          handleSubmit(submit)(e);
        }}
      >
        <Field
          label="Datadog API Key"
          name="datadogApiKey"
          ref={register}
          errors={errors.datadogApiKey}
        />
        <Button type="submit" title="Update" disabled={!formState.dirty} />
      </Form>
    </Card>
  );
};

export default Integrations;
