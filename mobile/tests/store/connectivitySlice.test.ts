import connectivityReducer, { setOnline } from '../../src/store/slices/connectivitySlice';

describe('connectivitySlice', () => {
  it('should set online flag', () => {
    const initial = { isOnline: false };
    const next = connectivityReducer(initial, setOnline(true));
    expect(next.isOnline).toBe(true);
  });
});
