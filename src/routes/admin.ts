import { Router } from "express";
import { addProduct, deleteProduct, getAllAdmin,getPresignedUrl,addProductNew ,getAllCustomer, getAllUsers, getDashboardData, getOrders, getRevenueGenerated, getSingleCustomer, getSingleOrder, getTopProducts, getWorstProducts, updateProductNew } from "../controller/admin";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();
// todo: implement middleware in this getS3
router.route('/getS3').get(getPresignedUrl);
router.route('/create-product').post(verifyToken, verifyAdmin, addProductNew);
router.route('/update-product/:id').put(verifyToken, verifyAdmin, updateProductNew);
router.route('/delete-product/:id').delete(verifyToken, verifyAdmin, deleteProduct);
router.route('/get-users').get(verifyToken, verifyAdmin, getAllUsers);
router.route('/get-admins').get(verifyToken, verifyAdmin, getAllAdmin);
router.route('/customer_details').get(verifyToken, verifyAdmin, getAllCustomer);
router.route('/customer_detail/:id').get(verifyToken, verifyAdmin, getSingleCustomer);
router.route('/revenue-generated').get(verifyToken, verifyAdmin, getRevenueGenerated);
router.route('/get-dashboard-data').get(verifyToken, verifyAdmin, getDashboardData);
router.route('/get-top-products').get(verifyToken, verifyAdmin, getTopProducts);
router.route('/get-worst-products').get(verifyToken, verifyAdmin, getWorstProducts);
router.route('/order').get(getOrders);
router.route('/order/:id').get(getSingleOrder);

export default router;