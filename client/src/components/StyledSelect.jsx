import React from 'react';
import Select from 'react-select';

const StyledSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option...", 
  isSearchable = true,
  isClearable = false,
  isLoading = false,
  isMulti = false,
  noOptionsMessage = () => "No options available",
  ...props 
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      borderWidth: '1px',
      borderRadius: '8px',
      boxShadow: state.isFocused 
        ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
        : 'none',
      backgroundColor: state.isFocused ? '#FFFFFF' : '#F9FAFB',
      '&:hover': {
        borderColor: '#6B7280',
        backgroundColor: '#FFFFFF'
      },
      transition: 'all 0.2s ease-in-out'
    }),
    
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3B82F6' 
        : state.isFocused 
          ? '#EFF6FF' 
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: state.isSelected ? '500' : '400',
      '&:active': {
        backgroundColor: state.isSelected ? '#2563EB' : '#DBEAFE'
      }
    }),
    
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF',
      fontSize: '14px'
    }),
    
    singleValue: (provided) => ({
      ...provided,
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500'
    }),
    
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#EFF6FF',
      borderRadius: '6px'
    }),
    
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1E40AF',
      fontSize: '13px',
      fontWeight: '500'
    }),
    
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#6B7280',
      '&:hover': {
        backgroundColor: '#DC2626',
        color: 'white'
      }
    }),
    
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #E5E7EB',
      overflow: 'hidden'
    }),
    
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '200px'
    }),
    
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#E5E7EB'
    }),
    
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? '#3B82F6' : '#6B7280',
      '&:hover': {
        color: '#3B82F6'
      },
      transition: 'all 0.2s ease-in-out',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
    }),
    
    clearIndicator: (provided) => ({
      ...provided,
      color: '#6B7280',
      '&:hover': {
        color: '#DC2626'
      }
    }),
    
    loadingIndicator: (provided) => ({
      ...provided,
      color: '#3B82F6'
    }),
    
    noOptionsMessage: (provided) => ({
      ...provided,
      color: '#6B7280',
      fontSize: '14px',
      padding: '12px 16px'
    })
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isLoading={isLoading}
      isMulti={isMulti}
      noOptionsMessage={noOptionsMessage}
      styles={customStyles}
      className="react-select-container"
      classNamePrefix="react-select"
      {...props}
    />
  );
};

export default StyledSelect;
