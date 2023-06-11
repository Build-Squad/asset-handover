import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

function initAssetHandoverRouter(AssetHandoverService) {
  const router = express.Router();

  router.post(
    '/asset-handover/lockUp/updateCreationFees',
    [
      body('fees', 'Enter a valid fee in decimal format.')
        .trim()
        .isFloat(),
    ],
    validateRequest,
    async (req, res) => {
      const fees = parseFloat(req.body).toFixed(8);
      console.log('body: ' + JSON.stringify(fees));
      const tx = await AssetHandoverService.updateCreationFees(fees);
      return res.send({
        transaction: tx,
      });
    }
  );

  router.post(
    '/asset-handover/lockUp/updateWithdrawFees',
    [
      body('fees', 'Enter a valid fee in decimal format.')
        .trim()
        .isFloat(),
    ],
    validateRequest,
    async (req, res) => {
      const fees = parseFloat(req.body).toFixed(8);
      console.log('body: ' + JSON.stringify(req.body));
      const tx = await AssetHandoverService.updateWithdrawFees(fees);
      return res.send({
        transaction: tx,
      });
    }
  );

  router.get(
    '/asset-handover/accountLockUp/:address',
    [
      param('address', 'Enter a valid Flow address.')
        .trim()
        .isLength({ min: 18, max: 18 })
        .isAlphanumeric(),
    ],
    validateRequest,
    async (req, res) => {
      const accountLockUp =
        await AssetHandoverService.getAccountLockUp(
          req.params.address
        );
      return res.status(200).send({ accountLockUp });
    }
  );

  router.get(
    '/asset-handover/fungibleTokenInfoMapping',
    async (req, res) => {
      const fungibleTokenInfoMapping =
        await AssetHandoverService.getFungibleTokenInfoMapping();
      return res.status(200).send({ fungibleTokenInfoMapping });
    }
  );

  router.get(
    '/asset-handover/nonFungibleTokenInfoMapping',
    async (req, res) => {
      const nonFungibleTokenInfoMapping =
        await AssetHandoverService.getNonFungibleTokenInfoMapping();
      return res.status(200).send({ nonFungibleTokenInfoMapping });
    }
  );

  router.get(
    '/asset-handover/LockUpsByRecipient/:address',
    [
      param('address', 'Enter a valid Flow address.')
        .trim()
        .isLength({ min: 18, max: 18 })
        .isAlphanumeric(),
    ],
    validateRequest,
    async (req, res) => {
      const lockUpsByRecipient =
        await AssetHandoverService.getLockUpsByRecipient(
          req.params.address
        );
      return res.status(200).send({ lockUpsByRecipient });
    }
  );

  return router;
}

export default initAssetHandoverRouter;
