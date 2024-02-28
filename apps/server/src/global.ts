export const getConfig = () => ({
  // Getting client URL from environment variable, defaulting to 'http://localhost:4200' if not provided
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  // Getting port number from environment variable, defaulting to 3000 if not provided
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
});
