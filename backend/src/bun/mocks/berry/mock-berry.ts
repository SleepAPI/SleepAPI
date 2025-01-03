import type { Berry } from 'sleepapi-common';

export function berry(attrs?: Partial<Berry>): Berry {
  return {
    name: 'Mock berry',
    type: 'Mock type',
    value: 0,
    ...attrs
  };
}
