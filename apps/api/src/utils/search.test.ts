import { describe, expect, it } from 'vitest';
import { sanitiseSearch } from './search.js';

describe('sanitiseSearch', () => {
  it('removes PostgREST control characters', () => {
    expect(sanitiseSearch('Ada,(Okafor)%')).toBe('Ada  Okafor');
  });

  it('trims surrounding spaces', () => {
    expect(sanitiseSearch('  UI/2023/1042  ')).toBe('UI/2023/1042');
  });
});
