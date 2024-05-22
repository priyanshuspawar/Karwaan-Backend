import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { ResponseData } from "../utils/ResponseData";

export const verifyToken = (request: Request, response: Response, next: NextFunction) => {
  let data;
  const token = request.header('Authorization');

  if (!token) {
    data = new ResponseData("error", 403, "Unauthorized: Missing token", null);
    return response.status(data.statusCode).json(data);
  }
  
  jwt.verify(token, process.env.JWT_SECRET as string, (error) => {
    try {
      if(error){
        data = new ResponseData("error", 403,"Something went wrong please sign in again" , null);
        return response.status(data.statusCode).json(data);
      }
      
      next();
    } catch (error: any) {
      data = new ResponseData("error", 403, "Something went wrong please sign in again", null);
      return response.status(data.statusCode).json(data);
    }
  });
}
