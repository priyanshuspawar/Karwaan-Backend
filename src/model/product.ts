import mongoose, { Document, Schema, Types } from "mongoose";

export interface ProductInterface extends Document{
    userId: string;
    name: string;
    tags: string[];
    description: string;
    price: number;
    url: string;
    createdAt: string;
    updatedAt: string;
}

const ProductSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    tags: { type: Array, default: [] },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, default: null },
}, { timestamps: true });

const Product = mongoose.model<ProductInterface>('Product', ProductSchema);

export default Product;