import { Types } from "mongoose";
import Product from "../model/product";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";

type UpdateProductPayload = {
    userId: string;
    name: string;
    tags: string[];
    description: string;
    price: number;
    linkToMedia: string;
    isFreeToUse: boolean;
    productId: string;
}

type DeleteProductPayload = {
    productId: string;
    userId: string;
}

export class ProductServices {
    
    
    static async getAllProducts () {
        try {
            const products = await Product.find();
            
            return new ResponseData("success", 200, "Success", products);
        } catch (error) {
            throw error;
        }
    }

    static async getSingleProduct (payload: string) {
        const product = await Product.findById(payload);

        if(!product){
            return new ResponseData("error", 400, "Product not found", null);
        }
        
        return new ResponseData("success", 200, "Success", product);
    }

    static async updateProduct (payload: UpdateProductPayload) {
        const {userId, name, tags, description, price, linkToMedia, isFreeToUse, productId} = payload;

        if(!userId || (!name && !tags && !description && !price && !linkToMedia)){
            return new ResponseData("error", 400, "Invalid payload", null);
        }

        const user = await User.findById(userId);
        
        if(!user){
            return new ResponseData("error", 400, "User not found", null);
        }

        if(user.role === "user"){
            return new ResponseData("error", 400, "You cannot access this resourse", null);
        }

        const product = await Product.findByIdAndUpdate(productId, {$set: {
            userId: userId,
            name: name,
            tags: tags,
            description: description,
            price: price,
          
        }}, {new: true});

        if(!product){
            return new ResponseData("error", 400, "Product not found", null);
        }
        
        return new ResponseData("success", 200, "Success", product);
    }

    static async deleteProduct (payload: DeleteProductPayload) {
        const {productId, userId} = payload;

        if(!userId){
            return new ResponseData("error", 400, "Invalid payload", null);
        }
        
        const product = await Product.findByIdAndDelete(productId);

        const user = await User.findById(userId);
        
        if(!user){
            return new ResponseData("error", 400, "User not found", null);
        }

        if(user.role === "user"){
            return new ResponseData("error", 400, "You cannot access this resourse", null);
        }

        if(!product){
            return new ResponseData("error", 400, "Product not found", null);
        }
        
        return new ResponseData("success", 200, "Success", null);
    }
}