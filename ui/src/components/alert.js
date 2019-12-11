import React from 'react';
import { Icon } from 'evergreen-ui';

import theme from '../theme';
import { Column, Row, Text } from './core';

const getIcon = variant => {
  switch (variant) {
    case 'success':
      return 'endorsed';
    case 'error':
      return 'error';
    case 'info':
    default:
      return 'info-sign';
  }
};

const getColor = variant => {
  switch (variant) {
    case 'success':
      return theme.colors.green;
    case 'error':
      return theme.colors.red;
    case 'info':
    default:
      return theme.colors.primary;
  }
};

const Alert = ({ show, title, description, variant = 'info', children }) => {
  if (!show) {
    return null;
  }
  const color = getColor(variant);
  return (
    <Column
      bg="grays.0"
      border={0}
      borderColor={color}
      borderRadius={1}
      padding={4}
      marginBottom={5}
    >
      <Column marginBottom={4}>
        <Row marginBottom={2}>
          <Icon icon={getIcon(variant)} color={color} size={18} />
        </Row>
        <Text fontSize={4} fontWeight={4}>
          {title}
        </Text>
        {description && (
          <Text color="grays.10" marginTop={2}>
            {description}
          </Text>
        )}
      </Column>

      {children}
    </Column>
  );
};

export default Alert;
