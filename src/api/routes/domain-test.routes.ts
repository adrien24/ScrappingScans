import { Router } from "express";
import { domainTestController } from "../controllers/domain-test.controller";

const router = Router();

/**
 * POST /api/domain-test/find-working
 * Tester les extensions de domaine jusqu'à trouver un qui fonctionne
 * Body: { baseName?: string, timeout?: number }
 */
router.post("/find-working", (req, res) => {
  domainTestController.findWorkingDomain(req, res);
});

/**
 * GET /api/domain-test/check
 * Vérifier rapidement si un domaine a été trouvé
 */
router.get("/check", (req, res) => {
  domainTestController.checkResult(req, res);
});

export default router;
