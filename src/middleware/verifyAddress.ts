import { NextFunction, Request, Response } from "express";
import { ResponseData } from "../utils/ResponseData";
import jwt from 'jsonwebtoken';
import User from "../model/user";
import Address from "../model/address";

interface jwt_payload{
    email: string;

}
export const verifyAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let data;
        const token = req.headers.authorization;

        if (!token) {
            data = new ResponseData("error", 403, "Unauthorized: Missing token", null);
            return res.status(data.statusCode).json(data);
        }

        const jwt_payload:jwt_payload|any = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await User.findOne({ email: jwt_payload?.email });

        if (!user) {
            data = new ResponseData("error", 403, "Unauthorized: Invalid User", null);
            return res.status(data.statusCode).json(data);
        }

        
        const address = await Address.findOne({userId: user._id});
        if(!address){
            data = new ResponseData("error", 402, "Please Add an Address", null);
            return res.status(data.statusCode).json(data);
        }
        next()

    } catch (error: any) {
        const data = new ResponseData("error", 500, error.message, null);
        return res.status(data.statusCode).json(data);
    }
}