import { Router, type IRouter } from "express";
import healthRouter from "./health";
import relcowRouter from "./relcow";

const router: IRouter = Router();

router.use(healthRouter);
router.use(relcowRouter);

export default router;
