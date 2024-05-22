import { Router } from "express";
import User from './user';
import Product from './product';
import CartItem from './cartItem';
import Order from './order';
import Admin from './admin';
import Test from './test';
import Address from "./address";

const router = Router();

router.use('/api/v1/user', User);
router.use('/api/v1/product', Product);
router.use('/api/v1/cart-item', CartItem);
router.use('/api/v1/order', Order);
router.use('/api/v1/admin', Admin);
router.use('/api/v1/address', Address);
{/*
*
*
*
Please make sure to be cautious while using test endpoint. The endpoints are not for production and are purely for development purposes.
*
*
*
*/}
router.use('/api/v1/test', Test);

export default router;