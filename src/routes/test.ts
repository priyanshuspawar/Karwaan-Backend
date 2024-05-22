import { Router } from "express";
import { deleteDatabase } from "../controller/test";

const router = Router();

{/*
*
*
*
Please make sure to be cautious while using these endpoints. The endpoints are not for production and are purely for development purposes.
*
*
*
*/}

router.route('/delete').delete(deleteDatabase);

export default router;