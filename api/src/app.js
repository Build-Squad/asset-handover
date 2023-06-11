import pkg from 'body-parser';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import initAssetHandoverRouter from './routes/assetHandover.js';
import initBlpTokenRouter from './routes/blpToken.js';
import initDomainsTokenRouter from './routes/domainsToken.js';

const { json, urlencoded } = pkg;

const V1 = '/v1/';

// Init all
const initApp = (
  AssetHandoverService,
  BlpTokenService,
  DomainsTokenService
) => {
  const app = express();

  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(V1, initAssetHandoverRouter(AssetHandoverService));
  app.use(V1, initBlpTokenRouter(BlpTokenService));
  app.use(V1, initDomainsTokenRouter(DomainsTokenService));

  app.all('*', async (req, res) => {
    return res.sendStatus(404);
  });

  return app;
};

export default initApp;
