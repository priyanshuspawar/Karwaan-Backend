import { NextFunction, Request, Response } from "express";
import { ResponseData } from "../utils/ResponseData";
import jwt from 'jsonwebtoken'
import User from "../model/user";

export const verifyCredentials = async (request: Request, response: Response, next: NextFunction) => {
    try {
        let data;
        const token = request.header('Authorization');

        if (!token) {
            data = new ResponseData("error", 403, "Unauthorized: Missing token", null);
            return response.status(data.statusCode).json(data);
        }

        jwt.verify(token, process.env.JWT_SECRET as string, async (error, userEmail: any) => {
            try {
                if (error) {
                    data = new ResponseData("error", 403, error.message, null);
                    return response.status(data.statusCode).json(data);
                }
    
                const user = await User.findOne({ email: userEmail.email });
    
                if (!user) {
                    data = new ResponseData("error", 403, "Unauthorized: Invalid token", null);
                    return response.status(data.statusCode).json(data);
                }
                
                if(!user.isEmailValid){
                    data = new ResponseData("error", 400, "Please verify your email before you continue.", null);
                    return response.status(data.statusCode).json(data);
                }
    
                if(!user.isPhoneNumberValid){
                    data = new ResponseData("error", 400, "Please verify your phone number before you continue.", null);
                    return response.status(data.statusCode).json(data);
                }
    
                next();
            } catch (error) {
                throw error;
            }
            
        });
    } catch (error) {
        next(error);
    }
}