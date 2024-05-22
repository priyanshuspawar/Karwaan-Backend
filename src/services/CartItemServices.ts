import { pipeline } from "nodemailer/lib/xoauth2";
import CartItem from "../model/cartItem";
import Product, { ProductInterface } from "../model/product";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";
import { Types } from "mongoose";
import { OrderServices } from "./OrderServices";

type AddItemToCartPayload = {
    productDetails: {
        id: string;
        quantity: number;
        size: string;
    };
    userId: string;
};

type RemoveItemFromCartPayload = {
    userId: string;
    cartItemId: string;
};

export class CartItemServices {
    static async addItemToCart(payload: AddItemToCartPayload) {
        let data;
        const { productDetails, userId } = payload;

        const validSizes = ['8"x12"', '12"x18"', '16"x24"', '20"x30"', '24"x36"'];

        const productLookup = await Product.findById(productDetails.id);
        if (!productLookup) {
            data = new ResponseData("error", 400, "Product not found ", null);
            return data;
        }

        if (!validSizes.includes(productDetails.size)) {
            data = new ResponseData("error", 400, "Invalid size.", null);
            return data;
        }

        const cartItem = await CartItem.findOne({ userId: userId, productId: productDetails.id });
        if (cartItem) {
            data = new ResponseData("success", 200, "Item is already in cart", cartItem);
            return data;
        }

        const user = await User.findById(userId);
        if (!user) {
            data = new ResponseData("error", 400, "User not found", null);
            return data;
        }

        const newCartItem = await CartItem.create({
            userId: userId,
            productDetails: productDetails,
        });

        data = new ResponseData("success", 200, "Item added to cart", newCartItem);
        return data;
    }

    static async removeItemFromCart(payload: RemoveItemFromCartPayload) {
        let data;
        const { userId, cartItemId } = payload;

        try {
            const user = await User.findById(userId);
            if (!user) {
                data = new ResponseData("error", 400, "User not found", null);
                return data;
            }

            const cartItem = await CartItem.findById(cartItemId);
            if (!cartItem) {
                data = new ResponseData("error", 400, "Cart Item not found", null);
                return data;
            }

            if (userId !== cartItem.userId.toString()) {
                data = new ResponseData("error", 400, "You cannot remove an item from someone else's cart", null);
                return data;
            }

            await cartItem.deleteOne();

            data = new ResponseData("success", 200, "Item removed from cart", { removedItem: cartItem });
            return data;
        } catch (error) {
            console.error("Error removing item from cart:", error);
            data = new ResponseData("error", 500, "Internal Server Error", null);
            return data;
        }
    }

    static async getAllCartItems(payload: string) {
        let data;
        const user = await User.findById(payload);

        if (!user) {
            data = new ResponseData("error", 400, "User not found", null);
            return data;
        }

        const cartItems = await CartItem.aggregate([
            {
                $match: { userId: payload },
            },
        ]);

        data = new ResponseData("success", 200, "Success", cartItems);
        return data;
    }

    static async emptyCart(payload: string) {
        let data;
        const user = await User.findById(payload);
        if (!user) {
            data = new ResponseData("error", 400, "User not found", null);
            return data;
        }

        const cartItems = await CartItem.deleteMany({ userId: payload });
        data = new ResponseData("success", 200, "You cart is now empty", null);
        return data;
    }

    static checkout = async (payload: string) => {
        let data;
        const cartItems = await CartItem.find({ userId: payload });
        if (cartItems.length === 0) {
            data = new ResponseData("error", 200, "You cart is empty", null);
            return data;
        }

        let products: {
            productId: string;
            quantity: number;
            size: '8"x12"' | '12"x18"' | '16"x24"' | '20"x30"' | '24"x36"';
        }[] = [];

        for (const key in cartItems) {
            const cartItem = cartItems[key];

            const product = await Product.findById(cartItem.productDetails.id);
            if (!product) {
                return new ResponseData("error", 400, "Product not found", null);
            }

            let obj: any = {};

            obj.productId = cartItem.productDetails.id;
            obj.quantity = cartItem.productDetails.quantity;
            obj.size = cartItem.productDetails.size;

            products.push(obj);
        }

        data = await OrderServices.createOrder({ userId: payload, products });
        return data;
    };
}
