import { toSeconds } from './time-utils';

describe('toSeconds', () => {
  it('shall convert 0:00:00 to 0', () => {
    expect(toSeconds(0, 0, 0)).toEqual(0);
  });
  it('shall convert half a minte to 30', () => {
    expect(toSeconds(0, 0, 30)).toEqual(30);
  });
  it('shall convert half an hour to 1800', () => {
    expect(toSeconds(0, 30, 0)).toEqual(1800);
  });
  it('shall convert two hours to 7200', () => {
    expect(toSeconds(2, 0, 0)).toEqual(7200);
  });
  it('shall convert 2:30:30 to 9030', () => {
    expect(toSeconds(2, 30, 30)).toEqual(9030);
  });
});
