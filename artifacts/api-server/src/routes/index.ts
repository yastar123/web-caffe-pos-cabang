import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import branchesRouter from "./branches";
import usersRouter from "./users";
import menuRouter from "./menu";
import tablesRouter from "./tables";
import reservationsRouter from "./reservations";
import ordersRouter from "./orders";
import kitchenRouter from "./kitchen";
import paymentsRouter from "./payments";
import stockRouter from "./stock";
import customersRouter from "./customers";
import reportsRouter from "./reports";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(branchesRouter);
router.use(usersRouter);
router.use(menuRouter);
router.use(tablesRouter);
router.use(reservationsRouter);
router.use(ordersRouter);
router.use(kitchenRouter);
router.use(paymentsRouter);
router.use(stockRouter);
router.use(customersRouter);
router.use(reportsRouter);
router.use(uploadRouter);

export default router;
