import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import User from "../model/user";
import Product from "../model/product";
import Order from "../model/order";
import CartItem from "../model/cartItem";
import { ResponseData } from "../utils/ResponseData";
import Address from "../model/address";

{/*
*
*
*
Please make sure to be cautious while using these endpoints. The endpoints are not for production and are purely for development purposes.
*
*
*
*/}

export const deleteDatabase = errorHandler(async (request: Request, response: Response) => {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await CartItem.deleteMany();
    await Address.deleteMany();

    const data = new ResponseData("success", 200, "Your database is now clear", null);
    return response.status(data.statusCode).json(data);
});
