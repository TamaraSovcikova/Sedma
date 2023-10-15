export const getConfig = () => ({
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  wsPort: process.env.WS_PORT ? Number(process.env.WS_PORT) : 4500,
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
});
