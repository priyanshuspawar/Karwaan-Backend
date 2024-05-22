import mongoose, { Document, Schema } from "mongoose";

export const validSizes = ['8"x12"', '12"x18"', '16"x24"', '20"x30"', '24"x36"'];

type Products = {
    productId: string;
    quantity: string;
    size: '8"x12"' | '12"x18"' | '16"x24"' | '20"x30"' | '24"x36"';
};

interface OrderInterface extends Document {
    products: Products[];
    userId: string;
    status: "PAYMENT PENDING" | "PAYMENT COMPLETE" | "PAYMENT FAILED";
    amount: number;
    payment_id: string;
}

const OrderSchema = new mongoose.Schema(
    {
        products: [
            {
                productId: { type: Schema.Types.ObjectId, required: true },
                quantity: { type: Number, required: true },
                size: { type: String, enum: validSizes, required: true },
            },
        ],
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, default: "PAYMENT PENDING", required: true },
        payment_id: { type: String, default: null },
        amount: { type: Number, required: true },
    },
    { timestamps: true }
);

const Order = mongoose.model<OrderInterface>("Order", OrderSchema);

export default Order;
