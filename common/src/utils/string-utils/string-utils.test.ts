import { describe, expect, it } from 'vitest';
import { capitalize } from './string-utils';

describe('capitalize', () => {
  it('shall capitalize a word', () => {
    expect(capitalize('cAPitALIze')).toEqual('Capitalize');
  });
});
