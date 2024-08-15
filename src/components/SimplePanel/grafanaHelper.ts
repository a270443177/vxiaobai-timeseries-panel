import type { Field, DisplayValue } from '@grafana/data';
import { FieldType } from '@grafana/data';
import mean from 'lodash';

export const getValueField = (field: Field): boolean => field.type === FieldType.number;

export const getMeanValue = (valueField: Field): number => {
  return valueField.state?.calcs?.mean ?? mean(valueField.values.toArray());
};

export const formatDisplayValue = (displayValue: DisplayValue): string => {
  return displayValue.text + (displayValue.suffix ?? '');
};