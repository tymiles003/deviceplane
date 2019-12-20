import React from 'react';

import { Badge } from './core';

const DeviceStatus = ({ status }) => {
  switch (status) {
    case 'online':
      return (
        <Badge color="green" borderColor="green">
          online
        </Badge>
      );
    case 'offline':
    default:
      return (
        <Badge color="red" borderColor="red">
          offline
        </Badge>
      );
  }
};

export default DeviceStatus;
