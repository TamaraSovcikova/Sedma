export const getConfig = () => ({
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
});
