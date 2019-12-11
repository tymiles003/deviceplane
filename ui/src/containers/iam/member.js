import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import Card from '../../components/card';
import Popup from '../../components/popup';
import Field from '../../components/field';
import { Text, Button, Checkbox, Form, Label } from '../../components/core';

const Member = ({
  route: {
    data: { params, member, roles },
  },
}) => {
  const { register, handleSubmit, setValue, formState } = useForm({
    defaultValues: {
      roles: roles.reduce(
        (obj, role) => ({
          ...obj,
          [role.name]: !!member.roles.find(({ name }) => name === role.name),
        }),
        {}
      ),
    },
  });
  const [showRemovePopup, setShowRemovePopup] = useState();
  const navigation = useNavigation();

  const removeMember = async () => {
    try {
      await api.removeMember({
        projectId: params.project,
        userId: member.userId,
      });
      toaster.success('Successfully removed member.');
      navigation.navigate(`/${params.project}/iam/members`);
    } catch (error) {
      toaster.danger('Member was not removed.');
      console.log(error);
    }
  };

  const submit = async data => {
    let error = false;
    const roleArray = Object.keys(data.roles);
    for (let i = 0; i < roleArray.length; i++) {
      const role = roleArray[i];
      const roleChosen = data.roles[role];
      if (member.roles[role] !== roleChosen) {
        if (roleChosen) {
          try {
            await api.addMembershipRoleBindings({
              projectId: params.project,
              userId: member.userId,
              roleId: role,
            });
          } catch (e) {
            error = true;
            console.log(e);
          }
        } else {
          try {
            await api.removeMembershipRoleBindings({
              projectId: params.project,
              userId: member.userId,
              roleId: role,
            });
          } catch (e) {
            error = true;
            console.log(e);
          }
        }
      }
    }

    if (error) {
      toaster.danger(
        'Roles for the member were not updated properly. Please check the roles of the member.'
      );
    } else {
      navigation.navigate(`/${params.project}/iam/members`);
      toaster.success('Member updated successfully.');
    }
  };

  return (
    <>
      <Card
        title={`${member.user.firstName} ${member.user.lastName}`}
        subtitle={member.user.email}
        size="medium"
        actions={[
          {
            title: 'Remove',
            onClick: () => setShowRemovePopup(true),
            variant: 'secondary',
          },
        ]}
      >
        <Form onSubmit={handleSubmit(submit)}>
          <Label>Choose Individual Roles</Label>
          {roles.map(role => (
            <Field
              key={role.id}
              name={`roles[${role.name}]`}
              as={<Checkbox label={role.name} />}
              register={register}
              setValue={setValue}
            />
          ))}
          <Button title="Update" type="submit" disabled={!formState.dirty} />
        </Form>
      </Card>
      <Popup
        show={showRemovePopup}
        title="Remove Member"
        onClose={() => setShowRemovePopup(false)}
      >
        <Card title="Remove Member" border>
          <Text>
            You are about to remove the member (
            <strong>
              {member.user.firstName} {member.user.lastName}
            </strong>
            ) from the project.
          </Text>
          <Button marginTop={6} title="Remove" onClick={removeMember} />
        </Card>
      </Popup>
    </>
  );
};

export default Member;
