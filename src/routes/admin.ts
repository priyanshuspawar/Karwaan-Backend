import { Router } from "express";
import { addProduct, deleteProduct, getAllAdmin, getAllCustomer, getAllUsers, getDashboardData, getOrders, getRevenueGenerated, getSingleCustomer, getSingleOrder, getTopProducts, getWorstProducts, updateProduct } from "../controller/admin";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.route('/create-product').post(verifyToken, verifyAdmin, addProduct);
router.route('/update-product/:id').put(verifyToken, verifyAdmin, updateProduct);
router.route('/delete-product/:id').delete(verifyToken, verifyAdmin, deleteProduct);
router.route('/get-users').get(verifyToken, verifyAdmin, getAllUsers);
router.route('/get-admins').get(verifyToken, verifyAdmin, getAllAdmin);
router.route('/customer_details').get(verifyToken, verifyAdmin, getAllCustomer);
router.route('/customer_detail/:id').get(verifyToken, verifyAdmin, getSingleCustomer);
router.route('/revenue-generated').get(verifyToken, verifyAdmin, getRevenueGenerated);
router.route('/get-dashboard-data').get(verifyToken, verifyAdmin, getDashboardData);
router.route('/get-top-products').get(verifyToken, verifyAdmin, getTopProducts);
router.route('/get-worst-products').get(verifyToken, verifyAdmin, getWorstProducts);
router.route('/order').get(verifyToken, verifyAdmin, getOrders);
router.route('/order/:id').get(verifyToken, verifyAdmin, getSingleOrder);

export default router;