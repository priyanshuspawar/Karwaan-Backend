import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import User from "../model/user";
import { ResponseData } from "../utils/ResponseData";
import Address from "../model/address";

export const addAddress = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;
    const userId = request.params.id;
    const {houseNumber, buildingName, country, street, city, state, pin} = request.body;
    if(!houseNumber || !buildingName ||!country || !street || !city || !state || !pin){
        data = new ResponseData("error", 400, "Invalid payload", null);
        return response.status(data.statusCode).json(data);
    }
    const user = await User.findById(userId);
    if(!user){
        data = new ResponseData("error", 400, "User not found", null);
        return response.status(data.statusCode).json(data);
    }
    const address = await Address.create({
        userId: userId,
        houseNumber: houseNumber,
        buildingName: buildingName,
        country:country,
        street: street,
        city: city,
        state: state,
        pin: pin
    });
    data = new ResponseData("success", 200, "Address saved", address);
    return response.status(data.statusCode).json(data);
});

export const updateAddress = errorHandler(async (request: Request, response: Response) => {
    let data: ResponseData;
    const addressId = request.params.id;
    const address = await Address.findById(addressId);
    if(!address){
        data = new ResponseData("error", 400, "Address not found", null);
        return response.status(data.statusCode).json(data);
    }
    const {houseNumber, buildingName, street, city, state, pin} = request.body;
    if(!houseNumber || !buildingName || !street || !city || !state || !pin){
        data = new ResponseData("error", 400, "Invalid payload", null);
        return response.status(data.statusCode).json(data);
    }
    await address.updateOne({
        houseNumber: houseNumber,
        buildingName: buildingName,
        street: street,
        city: city,
        state: state,
        pin: pin
    });
    await address.save();
    data = new ResponseData("success", 200, "Address updated", address);
    return response.status(data.statusCode).json(data);
});

export const getAddress = errorHandler(async (request :Request, response: Response) => {
    let data: ResponseData;
    const userId = request.params.id;
    const user = await User.findById(userId);
    if(!user){
        data = new ResponseData("error", 400, "User not found", null);
        return response.status(data.statusCode).json(data);
    }
    const address = await Address.find({userId: userId});
    if(!address){
        data = new ResponseData("error", 400, "Address not found", null);
        return response.status(data.statusCode).json(data);
    }
    data = new ResponseData("success", 200, "Success", address);
    return response.status(data.statusCode).json(data);
});

export const deleteAddress = errorHandler(async (request :Request, response: Response) => {
    let data: ResponseData;
    const addressId = request.params.id;
    const address = await Address.findById(addressId);
    if(!address){
        data = new ResponseData("error", 400, "Address not found", null);
        return response.status(data.statusCode).json(data);
    }
    await address.deleteOne();
    // await address.save();
    data = new ResponseData("success", 200, "Address deleted successfully", null);
    return response.status(data.statusCode).json(data);
})