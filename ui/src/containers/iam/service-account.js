import React, { useState, useMemo, useEffect } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster, Checkbox, Code } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Dialog from '../../components/dialog';
import Table from '../../components/table';
import { Text, Row, Button, Form, Heading } from '../../components/core';

const createRoleBindings = (serviceAccount, allRoles) => {
  let roleBindings = [];
  if (serviceAccount !== null) {
    for (let i = 0; i < allRoles.length; i++) {
      let hasRole = false;
      if (serviceAccount.roles && serviceAccount.roles.length > 0) {
        for (let j = 0; j < serviceAccount.roles.length; j++) {
          if (allRoles[i].id === serviceAccount.roles[j].id) {
            hasRole = true;
            break;
          }
        }
      }
      roleBindings.push({
        id: allRoles[i].id,
        name: allRoles[i].name,
        hasRoleBinding: hasRole,
      });
    }
  }
  return roleBindings;
};

const ServiceAccount = ({
  route: {
    data: { params, serviceAccount, roles },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    defaultValues: {
      name: serviceAccount.name,
      description: serviceAccount.description,
    },
  });
  const navigation = useNavigation();
  const [roleBindings, setRoleBindings] = useState(
    createRoleBindings(serviceAccount, roles)
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState();

  const handleUpdateRoles = event => {
    let newRoleBindings = [];
    let hasRole = false;
    for (let i = 0; i < roleBindings.length; i++) {
      hasRole = roleBindings[i].hasRoleBinding;
      if (roleBindings[i].id === event.target.id) {
        hasRole = event.target.checked;
      }
      newRoleBindings.push({
        id: roleBindings[i].id,
        name: roleBindings[i].name,
        hasRoleBinding: hasRole,
      });
    }
    setRoleBindings(newRoleBindings);
  };

  const addRole = async roleId => {
    try {
      await api.addServiceAccountRoleBindings({
        projectId: params.project,
        serviceId: serviceAccount.id,
        roleId,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  };

  const removeRole = async roleId => {
    try {
      await api.removeServiceAccountRoleBindings({
        projectId: params.project,
        serviceId: serviceAccount.id,
        roleId,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  };

  const submit = async data => {
    let noError = true;

    try {
      await api.updateServiceAccount({
        projectId: params.project,
        serviceId: serviceAccount.id,
        data,
      });
    } catch (error) {
      noError = false;
      console.log(error);
    }

    const updatedRoleBindings = this.state.roleBindings;
    const currentRoles = this.state.serviceAccount.roles;
    let addRoleBindings = [];
    let removeRoleBindings = [];

    for (let i = 0; i < updatedRoleBindings.length; i++) {
      let addRole = false;
      let removeRole = false;
      // add role binding to service account
      if (updatedRoleBindings[i].hasRoleBinding) {
        addRole = true;
      }
      //check if role binding already exists on service account
      if (currentRoles && currentRoles.length > 0) {
        for (var j = 0; j < currentRoles.length; j++) {
          if (updatedRoleBindings[i].id === currentRoles[j].id) {
            if (updatedRoleBindings[i].hasRoleBinding) {
              //if role binding already exists on service account, do not re-add role to service account
              addRole = false;
              break;
            } else {
              //if role binding already exists on service account, remove the role binding
              removeRole = true;
              break;
            }
          }
        }
      }
      if (addRole) {
        addRoleBindings.push(updatedRoleBindings[i]);
      }
      if (removeRole) {
        removeRoleBindings.push(updatedRoleBindings[i]);
      }
    }

    for (let k = 0; k < addRoleBindings.length; k++) {
      const roleId = addRoleBindings[k].id;
      if (noError) {
        noError = await addRole(roleId);
      }
    }

    for (let l = 0; l < removeRoleBindings.length; l++) {
      const roleId = removeRoleBindings[l].id;
      if (noError) {
        noError = await removeRole(roleId);
      }
    }

    if (noError) {
      toaster.success('Service account updated successfully.');
    } else {
      toaster.danger('Service account was not updated.');
    }
  };

  const submitDelete = async () => {
    try {
      await api.deleteServiceAccount({
        projectId: params.project,
        serviceId: serviceAccount.id,
      });
      toaster.success('Successfully deleted service account.');
      navigation.navigate(`/${params.project}/iam/service-accounts`);
    } catch (error) {
      toaster.danger('Service account was not deleted.');
      console.log(error);
    }
    showDeleteDialog(false);
  };

  return (
    <Card title={serviceAccount.name} size="large">
      <Form onSubmit={handleSubmit(submit)}>
        <Field label="Name" name="name" ref={register} errors={errors.name} />
        <Field
          type="textarea"
          label="Description"
          name="description"
          ref={register}
          errors={errors.description}
        />
        <Text fontSize={2} marginBottom={2}>
          Choose Individual Roles
        </Text>
        {roleBindings.map(role => (
          <Checkbox
            key={role.id}
            id={role.id}
            label={role.name}
            checked={role.hasRoleBinding}
            onChange={handleUpdateRoles}
          />
        ))}
        <Button
          title="Update Service Account"
          type="submit"
          marginTop={4}
          disabled={!formState.dirty}
        />
        <Row marginTop={4}>
          <Button
            title="Delete Service Account"
            variant="tertiary"
            onClick={() => setShowDeleteDialog(true)}
          />
        </Row>
      </Form>
      <ServiceAccountAccessKeys
        projectId={params.project}
        serviceAccount={serviceAccount}
      />

      <Dialog
        show={showDeleteDialog}
        title="Delete Service Account"
        onClose={() => setShowDeleteDialog(false)}
      >
        <Card title="Delete Service Account">
          <Text>
            You are about to delete the <strong>{serviceAccount.name}</strong>{' '}
            service account.
          </Text>
          <Button title="Delete Service Account" onClick={submitDelete} />
          <Row marginTop={4}>
            <Button title="Cancel" variant="tertiary" />
          </Row>
        </Card>
      </Dialog>
    </Card>
  );
};

export default ServiceAccount;

const ServiceAccountAccessKeys = ({ projectId, serviceAccount }) => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [showAccessKeyCreated, setShowAccessKeyCreated] = useState();
  const [backendError, setBackendError] = useState();

  const columns = useMemo(
    () => [
      { Header: 'Access Key ID', accessor: 'id' },
      {
        Header: 'Created At',
        accessor: 'createdAt',
      },
      {
        Header: ' ',
        Cell: ({ row }) => (
          <Button
            title="Delete Access Key"
            onClick={() => deleteAccessKey(row.original.id)}
          />
        ),
      },
    ],
    []
  );
  const tableData = useMemo(() => accessKeys, [accessKeys]);

  const fetchAccessKeys = async () => {
    try {
      const response = await api.serviceAccountAccessKeys({
        projectId,
        serviceId: serviceAccount.id,
      });
      setAccessKeys(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAccessKeys();
  }, []);

  const createAccessKey = async () => {
    setBackendError(null);
    try {
      const response = await api.createServiceAccountAccessKey({
        projectId,
        serviceId: serviceAccount.id,
      });
      setNewAccessKey(response.data.value);
      setShowAccessKeyCreated(true);
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Access key was not created successfully.');
        console.log(error);
      }
    }
  };

  const deleteAccessKey = async id => {
    setBackendError(null);
    try {
      await api.deleteServiceAccountAccessKey({
        projectId,
        serviceId: serviceAccount.id,
        accessKeyId: id,
      });
      toaster.success('Successfully deleted access key.');
      fetchAccessKeys();
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Access key was not deleted.');
        console.log(error);
      }
    }
  };

  const closeAccessKeyDialog = () => {
    showAccessKeyCreated(false);
    fetchAccessKeys();
  };

  return (
    <>
      <Row
        alignItems="flex-end"
        borderTop={0}
        borderColor="white"
        marginTop={4}
        justifyContent="space-between"
        paddingTop={4}
        marginBottom={2}
      >
        <Heading fontSize={4}>Access Keys</Heading>
        <Button title="Create Access Key" onClick={createAccessKey} />
      </Row>
      {backendError && (
        <Alert
          marginBottom={16}
          paddingTop={16}
          paddingBottom={16}
          intent="warning"
          title={backendError}
        />
      )}
      <Table columns={columns} data={tableData} />
      <Dialog
        show={showAccessKeyCreated}
        title="Access Key Created"
        onClose={closeAccessKeyDialog}
      >
        <Card title="Access Key Created" border>
          <Text fontWeight={3} marginBottom={2}>
            Access Key
          </Text>
          <Code>{newAccessKey}</Code>

          <Alert
            intent="warning"
            title="Save the info above! This is the only time you'll be able to use it."
          >
            {`If you lose it, you'll need to create a new access key.`}
          </Alert>
        </Card>
      </Dialog>
    </>
  );
};
