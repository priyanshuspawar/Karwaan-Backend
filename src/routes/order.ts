import { Router } from "express";
import { checkout, createOrderNew, getOrderDetails, getMyOrders, getAllOrders, updateOrderPaymentStatus, verify } from "../controller/order";
import { verifyToken } from "../middleware/verifyToken";
import { verifyCredentials } from "../middleware/verifyCredentials";
import { verifyAddress } from "../middleware/verifyAddress";

const router = Router();
router.route("/verify").post(verify)
router.route("/getmyorders/:userid").get(getMyOrders)
router.route('/').post(verifyToken, verifyCredentials, verifyAddress, createOrderNew);
router.route("/:orderid").get(getOrderDetails)
// router.route('/:id').put(verifyToken, verifyCredentials, updateOrderPaymentStatus);
// THIS ID IS USER ID 
router.route('/checkout/:id').put(verifyToken, verifyCredentials, verifyAddress, checkout);
router.route('/all-orders/:id').get(verifyToken, verifyCredentials, getAllOrders);



// get order details

export default router;