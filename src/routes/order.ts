import { Router } from "express";
import { checkout, createOrder, getAllOrders, updateOrderPaymentStatus } from "../controller/order";
import { verifyToken } from "../middleware/verifyToken";
import { verifyCredentials } from "../middleware/verifyCredentials";
import { verifyAddress } from "../middleware/verifyAddress";

const router = Router();

router.route('/').post(verifyToken, verifyCredentials, verifyAddress, createOrder);
router.route('/:id').put(verifyToken, verifyCredentials, updateOrderPaymentStatus);
// THIS ID IS USER ID 
router.route('/checkout/:id').put(verifyToken, verifyCredentials, verifyAddress, checkout);
router.route('/all-orders/:id').get(verifyToken, verifyCredentials, getAllOrders);

export default router;