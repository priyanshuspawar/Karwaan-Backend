import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { CartItemServices } from "../services/CartItemServices";
import { Types, isObjectIdOrHexString } from "mongoose";
import { ResponseData } from "../utils/ResponseData";
import CartItem from "../model/cartItem";
import Product from "../model/product";

export const addItemToCart = errorHandler(async (request: Request, response: Response) => {
    const data = await CartItemServices.addItemToCart(request.body);

    return response.status(data.statusCode).json(data);
});

export const removeItemFromCart = errorHandler(async (request: Request, response: Response) => {
    let data;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const payload = { cartItemId: request.params.id, ...request.body };
    data = await CartItemServices.removeItemFromCart(payload);

    return response.status(data.statusCode).json(data);
});

export const getAllCartItems = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const userId = request.params.id;
    const items = await CartItem.find({ 
        userId: userId, 
        'productDetails.quantity': { $gt: 0 } 
    });
    let responseArray: { [key: string]: any }[] = [];
    for (let i in items) {
        const cartItem = items[i];
        const product = await Product.findById(cartItem.productDetails.id);

        const responseObj: { [key: string]: any } = {};

        responseObj.productDetails = product;
        responseObj.quantity = cartItem.productDetails.quantity;
        responseObj.userId = cartItem.userId;
        responseObj.size = cartItem.productDetails.size;
            responseObj._id = cartItem._id;

            responseArray.push(responseObj);
    }

    data = new ResponseData("success", 200, "Success", responseArray);
    return response.status(data.statusCode).json(data);
});

export const emptyCart = errorHandler(async (request: Request, response: Response) => {
    const userId = request.params.id;
    const data = await CartItemServices.emptyCart(userId);
    return response.status(data.statusCode).json(data);
});

export const updateCartItemQuantity = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;
    const cartItemId = request.params.id;

    const { quantity } = request.body;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid cart item id.", null);
        return response.status(data.statusCode).json(data);
    }

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
        data = new ResponseData("error", 400, "CartItem not found", null);
        return response.status(data.statusCode).json(data);
    }

    cartItem.productDetails.quantity = quantity; // Update the quantity field
    await cartItem.save(); // Save the updated cart item to MongoDB
    // if (quantity <= 0) {
    //     await cartItem.deleteOne();
    //     return response.status(200).json({ message: 'Item has been removed from your cart.' });
    // }

    data = new ResponseData("success", 200, "Cart Item updated successfully.", null);
    return response.status(data.statusCode).json(data);

});
