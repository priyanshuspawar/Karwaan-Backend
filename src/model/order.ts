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
    userDetails:{email: string,clientName: string}
    status: "PAYMENT PENDING" | "PAYMENT COMPLETE" | "PAYMENT FAILED";
    amount: number;
    payment_id: string;
    shipping_details:{
        houseNumber: string;
        buildingName: string;
        country: string;
        state: string;
        city: string;
        street: string;
        contactNumber?: string;
        pin: string;
    }
    
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
        userDetails: {
            email: { type: Schema.Types.String, required: true},
            clientName: { type: Schema.Types.String, required: true}
        },
        status: { type: String, default: "PAYMENT PENDING", required: true },
        payment_id: { type: String, default: null },
        amount: { type: Number, required: true },
        shipping_details:{
            houseNumber: {type: String, required: true},
            buildingName: {type: String, required: false},
            street: {type: String, required: true},
            city: {type: String, required: true},
            state: {type: String, required: true},
            country: {type: String, required: true},
            pin: {type: String, required: true},
            contactNumber:{type:String},
        }
    },
    { timestamps: true }
);

const Order = mongoose.model<OrderInterface>("Order", OrderSchema);

export default Order;
