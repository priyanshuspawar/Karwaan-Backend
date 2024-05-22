import CartItem from "../model/cartItem";
import Order, { validSizes } from "../model/order";
import Product, { ProductInterface } from "../model/product";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";
import { PaymentServices } from "./PaymentServices";
import { Types } from "mongoose";

type CreateOrderPayload = {
    userId: string;
    products: {
        productId: string;
        quantity: number;
        size: '8"x12"' | '12"x18"' | '16"x24"' | '20"x30"' | '24"x36"'
    }[];
};

export class OrderServices {
    static async createOrder(payload: CreateOrderPayload) {
        const { userId, products } = payload;

        if (!userId || !products) {
            return new ResponseData("error", 400, "Invalid payload", null);
        }

        if (products.length === 0) {
            return new ResponseData("error", 400, "You have selected no products", null);
        }

        const user = await User.findById(userId);

        if (!user) {
            return new ResponseData("error", 400, "User not found", null);
        }

        let totalAmount = 0;
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
            status: "PAYMENT PENDING",
            amount: totalAmount,
            url: null,
        });

        const razorpayPayment = await PaymentServices.createPaymentLink(totalAmount, newOrder?._id);
        if (!razorpayPayment) {
            return new ResponseData("error", 400, "There was an error while making a payment please try again", null);
        }

        await newOrder.updateOne({
            payment_id: razorpayPayment?.id,
        });

        await newOrder.save();

        const returnData = {
            order_details: newOrder,
            payment_details: razorpayPayment,
        };

        return new ResponseData("success", 200, "Order generated", returnData);
    }

    static updateOrderStatus = async (order_id: string) => {
        const order = await Order.findById(order_id);
        if (!order) {
            return new ResponseData("error", 400, "Order not found", null);
        }

        const payment = await PaymentServices.fetchStandardPaymentLinkById(order.payment_id);
        if (!payment) {
            return new ResponseData("error", 400, "No payment details were found", null);
        }

        let updatedOrder;
        if (payment.amount === payment.amount_paid) {
            updatedOrder = await Order.findByIdAndUpdate(
                order_id,
                {
                    $set: { status: "PAYMENT COMPLETE" },
                },
                { new: true }
            );

            let productMetadatas: any = [];
            const productIds = order.products;
            productIds.map(async (productId) => {
                // const productMetaData = await ProductMetaData.findOne({productId: productId});
                // productMetadatas = [...productMetadatas, productMetaData];
            });

            await CartItem.deleteMany({ userId: order?.userId });

            return new ResponseData("success", 200, "Success", { order_details: updatedOrder, product_metadata: productMetadatas });
        } else {
            updatedOrder = await Order.findByIdAndUpdate(
                order_id,
                {
                    $set: { status: "PAYMENT FAILED" },
                },
                { new: true }
            );
            return new ResponseData("success", 200, "Payment has failed", { order_details: updatedOrder });
        }
    };
}
