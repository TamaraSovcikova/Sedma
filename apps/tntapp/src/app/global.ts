export const getGlobalApp = () => ({
  serverUrl: 'http://localhost:3000/api',
  tableUrl: (id: string) => `http://localhost:3000/table/${id}`,
});
