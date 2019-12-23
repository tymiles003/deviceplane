import React from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { toaster } from 'evergreen-ui';
import * as yup from 'yup';

import api from '../api';
import utils from '../utils';
import validators from '../validators';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import Popup from '../components/popup';
import Alert from '../components/alert';
import { Text, Button, Form, Input, Label, Group } from '../components/core';

const validationSchema = yup.object().shape({
  name: validators.name.required(),
});

const ProjectSettings = ({
  route: {
    data: { params, project },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    validationSchema,
    defaultValues: {
      name: project.name,
    },
  });
  const navigation = useNavigation();
  const [showDeletePopup, setShowDeletePopup] = React.useState();
  const [confirmation, setConfirmation] = React.useState();
  const [backendError, setBackendError] = React.useState();

  const submit = async data => {
    try {
      await api.updateProject({ projectId: project.name, data });
      toaster.success('Project updated successfully.');
      navigation.navigate(`/${data.name}`);
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Project was not updated.');
      console.log(error);
    }
  };

  const submitDelete = async e => {
    e.preventDefault();
    setBackendError(null);
    try {
      await api.deleteProject({ projectId: project.name });
      toaster.success('Project deleted successfully.');
      navigation.navigate(`/projects`);
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Project was not deleted.');
      console.log(error);
    }
    setShowDeletePopup(false);
  };

  return (
    <Layout alignItems="center">
      <>
        <Card
          title="Project Settings"
          size="large"
          actions={[
            {
              title: 'Delete',
              variant: 'secondary',
              onClick: () => setShowDeletePopup(true),
            },
          ]}
        >
          <Alert
            show={backendError}
            variant="error"
            description={backendError}
          />
          <Form
            onSubmit={e => {
              setBackendError(null);
              handleSubmit(submit)(e);
            }}
          >
            <Field
              required
              label="Name"
              name="name"
              ref={register}
              errors={errors.name}
            />
            <Button type="submit" title="Update" disabled={!formState.dirty} />
          </Form>
        </Card>
        <Popup show={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
          <Card title="Delete Project" border>
            <Text marginBottom={4}>
              This action <strong>cannot</strong> be undone. This will
              permanently delete the <strong>{params.project}</strong> project.
              <p></p>Please type in the name of the project to confirm.
            </Text>
            <Form onSubmit={submitDelete}>
              <Group>
                <Label>Project Name</Label>
                <Input
                  onChange={e => setConfirmation(e.target.value)}
                  value={confirmation}
                />
              </Group>

              <Button
                type="submit"
                title="Delete Project"
                disabled={confirmation !== project.name}
              />
            </Form>
          </Card>
        </Popup>
      </>
    </Layout>
  );
};

export default ProjectSettings;
