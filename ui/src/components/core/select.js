import React from 'react';
import ReactSelect, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import theme from '../../theme';
import DeviceLabel from '../device-label';

const styles = {
  container: () => ({
    display: 'flex',
    flex: 1,
    position: 'relative',
  }),
  option: (provided, { isFocused, isSelected }) => ({
    transition: 'background-color 150ms',
    backgroundColor: isFocused
      ? theme.colors.grays[1]
      : isSelected
      ? theme.colors.black
      : theme.colors.grays[0],
    cursor: isSelected ? 'default' : 'pointer',
    color: theme.colors.white,
    padding: 8,
    ':hover': {
      backgroundColor: isSelected ? theme.colors.black : theme.colors.grays[1],
    },
  }),
  menu: provided => ({
    ...provided,
    marginTop: '4px',
    backgroundColor: theme.colors.grays[0],
    borderRadius: `${theme.radii[1]}px`,
    border: `1px solid ${theme.colors.white}`,
  }),
  control: () => ({
    // none of react-select's styles are passed to <Control />
    display: 'flex',
    flex: 1,
    padding: 0,
    backgroundColor: theme.colors.grays[0],
    border: `1px solid ${theme.colors.white}`,
    borderRadius: `${theme.radii[1]}px`,
  }),
  input: () => ({
    fontSize: theme.fontSizes[2],
    color: theme.colors.grays[10],
  }),
  multiValue: provided => {
    return {
      ...provided,
      color: theme.colors.black,
      backgroundColor: theme.colors.white,
    };
  },
  multiValueRemove: provided => {
    return {
      ...provided,
      ':hover': {
        color: theme.colors.black,
        backgroundColor: theme.colors.red,
      },
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      color: theme.colors.black,
      backgroundColor: theme.colors.white,
    };
  },
  singleValue: provided => {
    return { ...provided, color: theme.colors.grays[10] };
  },
};

const Option = ({ children, ...props }) => {
  if (props.data.Component) {
    return (
      <components.Option {...props}>
        <props.data.Component {...props.data.props} />
      </components.Option>
    );
  }
  return <components.Option {...props}>{children}</components.Option>;
};

const SingleValue = ({ children, ...props }) => {
  if (props.data.Component) {
    return (
      <components.SingleValue {...props}>
        <props.data.Component {...props.data.props} />
      </components.SingleValue>
    );
  }
  return <components.SingleValue {...props}>{children}</components.SingleValue>;
};
const MultiValueLabel = ({ children, ...props }) => {
  if (props.data.Component) {
    return (
      <components.MultiValueLabel {...props}>
        <props.data.Component {...props.data.props} />
      </components.MultiValueLabel>
    );
  }
  return <components.MultiValue {...props}>{children}</components.MultiValue>;
};

const Select = ({ searchable, multi, disabled, creatable, ...props }) => {
  if (creatable) {
    return <CreatableSelect styles={styles} {...props} />;
  }
  return (
    <ReactSelect
      styles={styles}
      isSearchable={searchable}
      isDisabled={disabled}
      isMulti={multi}
      components={{ Option, MultiValueLabel, SingleValue }}
      closeMenuOnSelect={multi ? false : true}
      {...props}
    />
  );
};

export default Select;
