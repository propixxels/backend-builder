import { DataType } from './types';

export interface DataTypeDefinition {
  id: DataType;
  name: string;
  description: string;
  icon: string;
}

export const DATA_TYPES: DataTypeDefinition[] = [
  {
    id: 'text',
    name: 'Text',
    description: 'Short or long text strings',
    icon: 'T',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email address with validation',
    icon: '@',
  },
  {
    id: 'phone',
    name: 'Phone',
    description: 'Phone number',
    icon: '📞',
  },
  {
    id: 'number',
    name: 'Number',
    description: 'Integer or decimal numbers',
    icon: '#',
  },
  {
    id: 'currency',
    name: 'Currency',
    description: 'Monetary values',
    icon: '$',
  },
  {
    id: 'date',
    name: 'Date',
    description: 'Calendar date',
    icon: '📅',
  },
  {
    id: 'time',
    name: 'Time',
    description: 'Time of day',
    icon: '🕐',
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    description: 'Date and time combined',
    icon: '📆',
  },
  {
    id: 'boolean',
    name: 'Boolean',
    description: 'True or false value',
    icon: '✓',
  },
  {
    id: 'uuid',
    name: 'UUID',
    description: 'Unique identifier',
    icon: '🔑',
  },
  {
    id: 'url',
    name: 'URL',
    description: 'Web address',
    icon: '🔗',
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data object',
    icon: '{}',
  },
];
