export const getConfig = () => ({
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  wsPort: Number(process.env.WS_PORT) ?? 4000,
  port: Number(process.env.PORT) ?? 3000,
});
