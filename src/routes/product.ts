import { Router } from "express";
import { getAllProducts, getSingleProduct } from "../controller/product";

const router = Router();

router.route('/').get(getAllProducts);
router.route('/:id').get(getSingleProduct);

export default router;