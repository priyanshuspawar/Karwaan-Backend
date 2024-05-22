import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { ProductServices } from "../services/ProductServices";
import Product from "../model/product";
import { Types, isObjectIdOrHexString } from "mongoose";
import { ResponseData } from "../utils/ResponseData";

export const getAllProducts = errorHandler(async (request: Request, response: Response) => {
    const { type, tag, q: searchQuery } = request.query;
    let data: ResponseData;
    let products;

    const validateType = (type: string) => {
        if (type !== 'image' && type !== 'video') {
            data = new ResponseData("error", 400, `${type} is not a valid type`, null);
            response.status(data.statusCode).json(data);
        }
    };

    const validateTag = (tag: string) => {
        const validTags = ['landscape', 'cityscape', 'dark', 'people', 'uncategorized'];
        if (!validTags.includes(tag)) {
            data = new ResponseData("error", 400, `${tag} is not a valid tag.`, null);
            response.status(data.statusCode).json(data);
        }
    };

    let query: Record<string, any> = {};

    if (type) {
        validateType(type as string);
        query['media.type'] = type;
    }

    if (tag) {
        validateTag(tag as string);
        query.tags = { $in: [tag] };
    }

    if (searchQuery) {
        query.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
        ];
    }

    products = await Product.find(query);

    data = new ResponseData("success", 200, "Success", products);
    response.status(data.statusCode).json(data);
});



export const getSingleProduct = errorHandler(async (request: Request, response: Response) => {
    let data;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please upload a valid id", null);
        return response.status(data.statusCode).json(data);
    }

    const productId = request.params.id;
    data = await ProductServices.getSingleProduct(productId);
    return response.status(data.statusCode).json(data);
});