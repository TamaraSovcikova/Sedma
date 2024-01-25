export const getConfig = () => ({
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
});
//process. env means an enviromnet in the shell - if it doesnt exist -> local host
