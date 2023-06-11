import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

function initDomainsTokenRouter(DomainsTokenService) {
  const router = express.Router();

  router.post(
    '/asset-handover/domains/mint',
    [
      body('name', 'Enter a valid string.').exists({
        checkFalsy: true,
      }),
      body('duration', 'Enter a valid duration in decimal format.')
        .trim()
        .isFloat(),
    ],
    validateRequest,
    async (req, res) => {
      const { name, duration } = req.body;
      console.log('body: ' + JSON.stringify(req.body));
      const tx = await DomainsTokenService.mint(
        name,
        parseFloat(duration).toFixed(8)
      );
      return res.send({
        transaction: tx,
      });
    }
  );

  router.get(
    '/asset-handover/domains/accountCollection/:address',
    [
      param('address', 'Enter a valid Flow address.')
        .trim()
        .isLength({ min: 18, max: 18 })
        .isAlphanumeric(),
    ],
    validateRequest,
    async (req, res) => {
      const accountCollection =
        await DomainsTokenService.getAccountCollection(
          req.params.address
        );
      return res.status(200).send({ accountCollection });
    }
  );

  return router;
}

export default initDomainsTokenRouter;
