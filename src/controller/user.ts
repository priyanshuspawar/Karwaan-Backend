import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { UserServices } from "../services/UserServices";

export const signup = errorHandler(async(request: Request, response: Response) => {
    const data = await UserServices.registerUser(request.body);
    return response.status(data.statusCode).json(data);
});

export const signin = errorHandler(async(request: Request, response: Response) => {
    const data = await UserServices.loginUser(request.body);    
    return response.status(data.statusCode).json(data);
});

export const signout = errorHandler(async (request: Request, response: Response) => {
    const data = await UserServices.logoutUser(request.body.token);
    return response.status(data.statusCode).json(data);
});

export const sendVerificationEmail = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.storeTokenForEmailVerification(request.body);
    return response.status(data.statusCode).json(data);
});

export const verifyEmail = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.validateVerifyEmailToken(request.body);
    
    return response.status(data.statusCode).json(data);
});

export const forgotPassword = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.forgotPassword(request.body);
    
    return response.status(data.statusCode).json(data);
});

export const resetPassword = errorHandler(async(request: Request, response: Response) =>{
    const payload = { ...request.body,...request.params}
    const data = await UserServices.resetPassword(payload);
    
    return response.status(data.statusCode).json(data);
});

export const sendPhoneNumberVerificationOTP = errorHandler(async (request: Request, response: Response) => {
    const data = await UserServices.sendPhoneNumberVerificationOTP(request.body)
})

export const getUser = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.getUser(request.params.id);
    return response.status(data.statusCode).json(data);
});

export const updateUser = errorHandler(async(request: Request, response: Response) =>{
    const payload = {...request.params, ...request.body}
    const data = await UserServices.updateUser(payload);
    return response.status(data.statusCode).json(data);
});

export const deleteUser = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.deleteUser(request.params.id);
    return response.status(data.statusCode).json(data);
});

export const validateOtp = errorHandler(async(request: Request, response: Response) =>{
    const data = await UserServices.validateOtp(request.body.otp, request.params.id);
    return response.status(data.statusCode).json(data);
});

export const changePassword = errorHandler(async (request: Request, response: Response) => {
    const data = await UserServices.changePassword({...request.body, _id: request.params.id});
    return response.status(data.statusCode).json(data);
})

