import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useGlobalSearch from '../hooks/useGlobalSearch';

const createSearchResponse = (results) => ({
  json: () =>
    Promise.resolve({
      results,
      facets: {},
      suggestions: [],
    }),
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps a slower stale response from overwriting a newer search response', async () => {
    let resolveFirstSearch;
    let resolveSecondSearch;

    const firstSearch = new Promise((resolve) => {
      resolveFirstSearch = resolve;
    });
    const secondSearch = new Promise((resolve) => {
      resolveSecondSearch = resolve;
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(firstSearch)
      .mockReturnValueOnce(secondSearch);

    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('old');
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.setQuery('new');
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();

    await act(async () => {
      resolveSecondSearch(createSearchResponse([{ id: 'new-result' }]));
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([{ id: 'new-result' }]);
    });

    await act(async () => {
      resolveFirstSearch(createSearchResponse([{ id: 'old-result' }]));
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([{ id: 'new-result' }]);
    });
  });
});
