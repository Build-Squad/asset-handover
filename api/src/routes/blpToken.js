import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

function initBlpTokenRouter(BlpTokenService) {
  const router = express.Router();

  router.post(
    '/asset-handover/blp/mint',
    [
      body('fees', 'Enter a valid fee in decimal format.')
        .trim()
        .isFloat(),
    ],
    validateRequest,
    async (req, res) => {
      const amount = parseFloat(req.body).toFixed(8);
      console.log('body: ' + JSON.stringify(req.body));
      const tx = await BlpTokenService.mint(amount);
      return res.send({
        transaction: tx,
      });
    }
  );

  router.get(
    '/asset-handover/blp/:address',
    [
      param('address', 'Enter a valid Flow address.')
        .trim()
        .isLength({ min: 18, max: 18 })
        .isAlphanumeric(),
    ],
    validateRequest,
    async (req, res) => {
      const accountBalance = await BlpTokenService.getAccountBalance(
        req.params.address
      );
      return res.status(200).send({ accountBalance });
    }
  );

  return router;
}

export default initBlpTokenRouter;
