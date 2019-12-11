import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Editor from '../../components/editor';
import Field from '../../components/field';
import { Row, Button, Form, Text } from '../../components/core';

const CreateRole = ({
  route: {
    data: { params },
  },
}) => {
  const { handleSubmit, register, setValue } = useForm();
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    try {
      await api.createRole({ projectId: params.project, data });
      navigation.navigate(`/${params.project}/iam/roles`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Role was not created.');
        console.log(error);
      }
    }
  };

  return (
    <Card title="Create Role">
      {backendError && (
        <Alert
          marginBottom={16}
          paddingTop={16}
          paddingBottom={16}
          intent="warning"
          title={backendError}
        />
      )}
      <Form onSubmit={handleSubmit(submit)}>
        <Field required autoFocus label="Name" name="name" ref={register} />

        <Field
          type="textarea"
          label="Description"
          name="description"
          ref={register}
        />

        <Field
          as={<Editor width="100%" height="160px" />}
          label="Config"
          name="config"
          register={register}
          setValue={setValue}
        />
        <Button title="Create" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/iam/roles`}
        />
      </Row>
    </Card>
  );
};

export default CreateRole;
