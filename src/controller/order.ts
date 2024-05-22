import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { OrderServices } from "../services/OrderServices";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";
import Order from "../model/order";
import CartItem from "../model/cartItem";
import { CartItemServices } from "../services/CartItemServices";

export const createOrder = errorHandler(async (request:Request, response: Response) => {
    const data = await OrderServices.createOrder(request.body);
    return response.status(data.statusCode).json(data);
});

export const updateOrderPaymentStatus = errorHandler(async (request: Request, response: Response) => {
    const data = await OrderServices.updateOrderStatus(request.params.id);
    return response.status(data.statusCode).json(data);
});

export const getAllOrders = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;
    const userId = request.params.id;
    const user = await User.findById(userId);
    if(!user){
        data = new ResponseData("error", 400, "User not found", null);
        return response.status(data.statusCode).json(data);
    }
    
    const orders = await Order.find({userId: userId, status:"PAYMENT COMPLETED"});
    data = new ResponseData("success", 200, "Success", orders);
    return response.status(data.statusCode).json(data);
});

export const checkout = errorHandler(async (request: Request, response: Response) => {
    const data = await CartItemServices.checkout(request.params.id);
    return response.status(data.statusCode).json(data);
});