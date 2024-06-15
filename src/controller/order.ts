import { Request, Response, request, response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { OrderServices } from "../services/OrderServices";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";
import Order, { validSizes } from "../model/order";
import CartItem from "../model/cartItem";
import { CartItemServices } from "../services/CartItemServices";
import Product from "../model/product";
import { razorPayInstance } from "../server";
import crypto from 'crypto';
type CreateOrderPayload = {
    userId: string;
    products: {
        productId: string;
        quantity: number;
        size: '8"x12"' | '12"x18"' | '16"x24"' | '20"x30"' | '24"x36"'
    }[];
    shipping_details:{
        houseNumber: string;
        buildingName: string;
        country: string;
        state: string;
        city: string;
        street: string;
        contactNumber: string;
        pin: string;
    };
}

const generatedSignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string
   ) => {
    const keySecret = process.env.RAZOR_PAY_SECRET_KEY;
    if (!keySecret) {
     throw new Error(
      'Razorpay key secret is not defined in environment variables.'
     );
    }
    const sig = crypto
     .createHmac('sha256', keySecret)
     .update(razorpayOrderId + '|' + razorpayPaymentId)
     .digest('hex');
    return sig;
   };



export const getMyOrders = errorHandler(async (request:Request,response:Response)=>{
    
})

export const createOrderNew = errorHandler(async (request: Request, response: Response)=>{
    // console.log("@@",request.body)
    // check items
    const {userId,products,shipping_details} = request.body as CreateOrderPayload;
    if (!userId || !products) {
        return new ResponseData("error", 400, "Invalid please try again", null);
    }

    if (products.length === 0) {
        return new ResponseData("error", 400, "You have selected no products", null);
    }

    const user = await User.findById(userId);

    if (!user) {
        return new ResponseData("error", 400, "User not found", null);
    }
    let totalAmount = 0
    for (let i in products) {
        const productPayload = products[i];
        if (!productPayload["productId"]) {
            return new ResponseData("error", 400, `Product id is missing at index ${i} products array.as`, null);
        }

        if (!productPayload["quantity"]) {
            return new ResponseData("error", 400, `Product quantity is missing at index ${i} in products array.`, null);
        }

        if (!productPayload["size"]) {
            return new ResponseData("error", 400, `Product size is missing at index ${i} in products array.`, null);
        }
        
        if(typeof productPayload["size"] !== 'string'){
            return new ResponseData("error", 400, `Product size is not a string at index ${i} in products array.`, null);
        }

        if (!validSizes.includes(productPayload.size as string)) {
            return new ResponseData("error", 400, `Invalid size at ${i} in products array.`, null);
        }

        const product = await Product.findById(productPayload.productId);
        if (!product) {
            return new ResponseData("error", 400, `Product not found for product id at index ${i} of the products array.`, null);
        }

        const pricePerSquareInch = product.price / 96;

        const prices = {
            '8"x12"': pricePerSquareInch * 8 * 12,
            '12"x18"': pricePerSquareInch * 12 * 18,
            '16"x24"': pricePerSquareInch * 16 * 24,
            '20"x30"': pricePerSquareInch * 20 * 30,
            '24"x36"': pricePerSquareInch * 24 * 36,
        };

        const price = prices[productPayload.size] * productPayload.quantity;
        totalAmount = totalAmount + price;
    }

    let newOrder = await Order.create({
        userId: userId,
        products: products,
        shipping_details:shipping_details,
        status: "PAYMENT PENDING",
        amount: totalAmount,
        url: null,
    });
    
    const responsepay = await razorPayInstance.orders.create({amount:totalAmount*100,currency: "INR",
        receipt: `rcpl${newOrder._id}`})
    
    return response.status(200).json({status:"success",orderid:newOrder._id.toString(),userDetails:{name:`${user.firstName} ${user.lastName}`,email:user.email},razorpayobj:responsepay});
})


export const getOrderDetails = errorHandler(async (request:Request,response:Response) => {
    // console.log(request.params)
    const {orderid} = request.params;
    if(!orderid){
        return new ResponseData("error", 401, "Order id not present", null);
    }
    const order = await Order.findOne({_id:orderid}).exec();
    if (!order || order.status!=="PAYMENT COMPLETE") {
        return new ResponseData("error", 400, "Order is not placed", null);
    }
    return response.status(200).json({orderData:{...order.toObject()}})
})

export const verify = errorHandler(async (request:Request, response:Response)=>{
    const {orderid,orderCreationId, razorpayPaymentId, razorpaySignature} = request.body;
    const order = await Order.findById(orderid);
    if (!order) {
        return new ResponseData("error", 400, "Order not found", null);
    }
    
    const signature = generatedSignature(orderCreationId, razorpayPaymentId);
    if (signature !== razorpaySignature) {
     return response.status(400).json(
      { message: 'payment verification failed', isOk: false },
     );
     }
     
    await CartItem.deleteMany({ userId: order?.userId });
    order.status="PAYMENT COMPLETE"
    order.payment_id=razorpayPaymentId.toString()
    await order.save()
    return response.status(200).json({message:"Payment verification sucess", isOk: true});

})
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