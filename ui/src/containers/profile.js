import React, { useState } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { useCurrentRoute } from 'react-navi';
import { toaster } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Field from '../components/field';
import Alert from '../components/alert';
import { Form, Button } from '../components/core';

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required()
    .max(64),
  lastName: yup
    .string()
    .required()
    .max(64),
  company: yup.string().max(64),
});

const Profile = ({ close }) => {
  const {
    data: {
      context: { currentUser, setCurrentUser },
    },
  } = useCurrentRoute();
  const { register, handleSubmit, formState, errors } = useForm({
    validationSchema,
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      company: currentUser.company,
    },
  });
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    try {
      await api.updateUser(data);
      setCurrentUser({ ...currentUser, ...data });
      toaster.success('Profile updated successfully.');
      close();
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Profile was not updated.');
      console.log(error);
    }
  };

  return (
    <Card title="Profile" border>
      <Alert show={backendError} variant="error" description={backendError} />
      <Form
        onSubmit={e => {
          setBackendError(null);
          handleSubmit(submit)(e);
        }}
      >
        <Field
          required
          label="First Name"
          name="firstName"
          ref={register}
          errors={errors.firstName}
        />
        <Field
          required
          label="Last Name"
          name="lastName"
          ref={register}
          errors={errors.lastName}
        />
        <Field
          label="Company"
          name="company"
          ref={register}
          errors={errors.company}
        />
        <Button title="Update" type="submit" disabled={!formState.dirty} />
      </Form>
    </Card>
  );
};

export default Profile;
