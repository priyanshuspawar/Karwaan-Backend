import mongoose, { Document, Schema } from "mongoose";

const size = [
    '8"x12"',
    '12"x18"',
    '16"x24"',
    '20"x30"',
    '24"x36"'
]

interface CartItemInterface extends Document{
    productDetails: {
        id: string;
        quantity: number;
        size: '8"x12"' | '12"x18"' | '16"x24"' | '20"x30"' | '24"x36"'
    };
    userId: string;
    createdAt: string;
    updatedAt: string;
};

const CartItemSchema = new mongoose.Schema({
    productDetails: {
        id: {type: Schema.Types.ObjectId, ref: "Product", required: true},
        quantity: {type: Number, required: true},
        size: { type: String, enum: size, required: true },
    },
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});

const CartItem = mongoose.model<CartItemInterface>('CartItem', CartItemSchema);

export default CartItem;