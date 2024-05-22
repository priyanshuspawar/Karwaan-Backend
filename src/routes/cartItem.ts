import { Router } from "express";
import { addItemToCart, emptyCart, getAllCartItems, removeItemFromCart, updateCartItemQuantity } from "../controller/cartItem";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.route('/').post(verifyToken, addItemToCart)

// here, this is cartItemId 
router.route('/:id')
    .delete(verifyToken, removeItemFromCart)
    .put(verifyToken, updateCartItemQuantity);

// here, this id is userId 
router
    .route('/:id')
    .get(verifyToken, getAllCartItems)

router.route('/empty-cart/:id').delete(verifyToken, emptyCart);
export default router;