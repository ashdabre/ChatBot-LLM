
// mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('falls back to offline canned response when backend fails', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 500,
    text: async () => 'Internal Server Error'
  });

  // import the function or component, call it and assert it returns the offline fallback
  // e.g. const { result } = renderHook(() => useYourGetAIResponseFunction());
  // await act(async () => { const r = await result.current('tell me about japan'); expect(r).toContain('Japan is an island nation') });
});
