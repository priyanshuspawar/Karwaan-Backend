import { Request, Response, request, } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { ProductServices } from "../services/ProductServices";
import Product from "../model/product";
import Order from "../model/order";
import User from "../model/user";
import { Types, isObjectIdOrHexString, isValidObjectId } from "mongoose";
import { ResponseData } from "../utils/ResponseData";
import { s3 } from "../server";
import { PaymentServices } from "../services/PaymentServices";
import crypto from 'crypto'


export const addProductNew = errorHandler(async (request:Request, response:Response)=>{
    let data: ResponseData;
    const { userId, name, tags, price, description,url } = request.body;
    
    if (!userId || !name || !tags || !description || !price || !url) {
        data = new ResponseData("error", 400, "Invalid payload", null);
        return response.status(data.statusCode).json(data);
    }

    const newProduct = new Product({
        userId: userId,
        name: name,
        tags: tags,
        price: price,
        description: description,
        url: url,
    });

    await newProduct.save();
    data = new ResponseData("success", 200, "Product added successfully", newProduct);
    return response.status(data.statusCode).json(data);

})

export const addProduct = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;
    const uploadedFiles = request.files;
    if (!uploadedFiles) {
        data = new ResponseData("error", 400, "Please upload a file to continue", null);
        return response.status(data.statusCode).json(data);
    }

    let file;
    for (let keys in uploadedFiles) {
        file = uploadedFiles[keys];
    }

    if (!file) {
        data = new ResponseData("error", 400, "Please upload a file to continue", null);
        return response.status(data.statusCode).json(data);
    }

    if (Array.isArray(file)) {
        data = new ResponseData("error", 400, "Please upload a single file at a time", null);
        return response.status(data.statusCode).json(data);
    }

    const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff", "image/webp"];

    if (!imageMimeTypes.includes(file.mimetype)) {
        data = new ResponseData("error", 400, "Invalid mime type of an image.", null);
        return response.status(data.statusCode).json(data);
    }

    const { userId, name, tags, price, description } = request.body;
    if (!userId || !name || !tags || !description || !price) {
        data = new ResponseData("error", 400, "Invalid payload", null);
        return response.status(data.statusCode).json(data);
    }

    const bucketUploadParams = {
        Bucket: "karwaan-bucket",
        Key: `${Date.now}_${file.name}`,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
    };

    const url = await s3.upload(bucketUploadParams).promise();

    const newProduct = new Product({
        userId: userId,
        name: name,
        tags: tags,
        price: price,
        description: description,
        url: url.Location,
    });

    await newProduct.save();
    data = new ResponseData("success", 200, "Product added successfully", newProduct);
    return response.status(data.statusCode).json(data);
});

export const getPresignedUrl = errorHandler(async(request:Request, response:Response)=>{
    const imageName = crypto.randomBytes(16).toString('hex');
    const params = ({
        Bucket: "karwaan-bucket",
        Key: imageName,
        Expires:3600,
        ACL: 'public-read',
    })
    const uploadUrl = await s3.getSignedUrlPromise("putObject",params)
    return response.status(200).json({url: uploadUrl})
})

export const updateProduct = errorHandler(async (request: Request, response: Response) => {
    let data;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const productId = request.params.id;
    const payload = { productId, ...request.body };

    data = await ProductServices.updateProduct(payload);
    return response.status(data.statusCode).json(data);
});
export const updateProductNew = errorHandler(async (request: Request, response: Response) => {
    let data;
    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const productId = request.params.id;
    const payload = { productId, ...request.body };

    data = await ProductServices.updateProduct(payload);
    return response.status(data.statusCode).json(data);
});

export const deleteProduct = errorHandler(async (request: Request, response: Response) => {
    let data;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const productId = request.params.id;
    const payload = { productId, ...request.body };
    data = await ProductServices.deleteProduct(payload);
    return response.status(data.statusCode).json(data);
});

export const getAllUsers = errorHandler(async (request: Request, response: Response) => {
    const users = await User.find();
    const data = new ResponseData("success", 200, "Success", users);
    return response.status(data.statusCode).json(data);
});

export const getAllAdmin = errorHandler(async (request: Request, response: Response) => {
    const users = await User.find({ role: "admin" });
    const data = new ResponseData("success", 200, "Success", users);
    return response.status(data.statusCode).json(data);
});

export const getDashboardData = errorHandler(async (request: Request, response: Response) => {
    const products = await Product.find();
    const users = await User.find();
    const orders = await Order.find({ status: "PAYMENT COMPELTE" });

    let totalRevenue = 0;
    let customersArray: string[] = [];
    for (let key in orders) {
        const order = orders[key];
        totalRevenue += order.amount;

        if (!customersArray.includes(order.userId)) {
            customersArray.push(order.userId);
        }
    }
    const responseObj = {
        products_count: products.length,
        users_count: users.length,
        orders_count: orders.length,
        total_revenue: totalRevenue,
        customers_count: customersArray.length,
    };

    const data = new ResponseData("success", 200, "Success", responseObj);
    return response.status(data.statusCode).json(data);
});

export const getAllCustomer = errorHandler(async (request: Request, response: Response) => {
    const customers = await Order.aggregate([
        {
            $match: {
                status: "PAYMENT COMPLETED",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user_details",
            },
        },
        { $unwind: "$user_details" },
        {
            $project: {
                firstName: "$user_details.firstName",
                createdAt: "$user_details.createdAt",
                email: "$user_details.email",
                image: "$user_details.image",
                lastName: "$user_details.lastName",
                phoneNumber: "$user_details.phoneNumber",
                _id: "$user_details._id",
            },
        },
    ]);

    const data = new ResponseData("success", 200, "Success", customers);
    return response.status(data.statusCode).json(data);
});

export const getSingleCustomer = errorHandler(async (request: Request, response: Response) => {
    let data;

    if (!isObjectIdOrHexString(request.params.id)) {
        data = new ResponseData("error", 400, "Please enter a valid userId", null);
        return response.status(data.statusCode).json(data);
    }

    const userId = request.params.id;
    const user = await User.findById(userId);
    if (!user) {
        data = new ResponseData("error", 400, "User not found", null);
        return response.status(data.statusCode).json(data);
    }

    const orders = await Order.aggregate([
        { $match: { userId: userId } },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user_details",
            },
        },
        { $unwind: "$user_details" },
        {
            $project: {
                user_details: "$user_details",
            },
        },
    ]);
    data = new ResponseData("success", 200, "Success", orders);
    return response.status(data.statusCode).json(data);
});

export const getRevenueGenerated = errorHandler(async (request: Request, response: Response) => {
    let totalRevenue = 0;
    const orders = await Order.find({ status: "PAYMENT COMPLETED" });
    for (let key in orders) {
        const order = orders[key];
        totalRevenue += order.amount;
    }
    const data = new ResponseData("success", 200, "Success", { revenue_generated: totalRevenue });
    return response.status(data.statusCode).json(data);
});

export const getTopProducts = errorHandler(async (request: Request, response: Response) => {
    const result = await Order.aggregate([
        { $match: { status: "PAYMENT COMPLETED" } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
            $lookup: {
                // Use $lookup if you need to fetch data from another collection
                from: "products", // Change 'products' to the actual name of your products collection
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
                media: "$product.media",
                price: "$product.price",
                name: "$product.name",
                tags: "$product.tags",
                count: { $sum: 1 },
            },
        },
    ]);

    const topProducts = result.map((item) => {
        return {
            media: item.media,
            price: item.price,
            name: item.name,
            tags: item.tags,
            count: item.count,
        };
    });

    const data = new ResponseData("success", 200, "Success", topProducts);
    return response.status(data.statusCode).json(data);
});

export const getWorstProducts = errorHandler(async (Request: Request, response: Response) => {
    const result = await Order.aggregate([
        { $match: { status: "PAYMENT COMPLETED" } },
        { $unwind: "$products" },
        { $group: { _id: "$products", count: { $sum: 1 } } },
        { $limit: 3 },
    ]);

    const worstProducts = result.map(({ _id, count }) => {
        const { media, price } = _id; // Assuming _id has media and price properties

        return {
            productId: _id,
            media,
            price,
            count,
        };
    });

    const data = new ResponseData("success", 200, "Success", worstProducts);
    return response.status(data.statusCode).json(data);
});

export const getOrders = errorHandler(async (req: Request, res: Response) => {
    const orders = await Order.find({ status: "PAYMENT COMPLETE" }).sort({ createdAt: 1 });
    const data = new ResponseData("success", 200, "Success", orders);
    return res.status(data.statusCode).json(data);
});

export const getSingleOrder = errorHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) {
        const data = new ResponseData("error", 400, "Order id is a required feild.", null);
        return res.status(data.statusCode).json(data);
    }

    if (!isValidObjectId(orderId)) {
        const data = new ResponseData("error", 400, "Not valid object id", null);
        return res.status(data.statusCode).json(data);
    }

    const order = await Order.findById(orderId);
    if (!order) {
        const data = new ResponseData("error", 400, "Order not found.", null);
        return res.status(data.statusCode).json(data);
    }

    const obj: { [key: string]: any } = {};
    const userDetails = await User.findById(order.userId);
    const shippingDetails = await Order.findOne({_id:orderId,status:"PAYMENT COMPLETE"})
    if (!userDetails) {
        const data = new ResponseData("error", 400, "User not found.", null);
        return res.status(data.statusCode).json(data);
    }
    obj.userDetails = userDetails;
    obj.amount = order.amount;

    let responseArray: { [key: string]: any }[] = [];
    for (let i in order.products) {
        const orderedProduct = order.products[i];
        const product = await Product.findById(orderedProduct.productId);

        const responseObj: { [key: string]: any } = {};

        responseObj.productDetails = product;
        responseObj.quantity = orderedProduct.quantity;
        responseObj.size = orderedProduct.size;

            responseArray.push(responseObj);
    }
    
    obj.razorpay_paymentid = order.payment_id;
    obj.products = responseArray;
    obj.paymentStatus = order.status;
    obj.shippingDetails = shippingDetails?.shipping_details
    const data = new ResponseData("success", 200, "Success", obj);
    return res.status(data.statusCode).json(data);
});
