import axios from "axios";
import { razorPayInstance } from "../server";
import { UserServices } from "./UserServices";
import Order from "../model/order";
import User from "../model/user";
import Logger from "../utils/Logger";
import { Types } from "mongoose";

export class PaymentServices {
    static createPaymentLink = async (amount: number, order_id: string) => {
        try { 
            const expire = UserServices.getExpireTime();

            const order = await Order.findById(order_id);
            if(!order){
                Logger.error("Order not found");
                return null;
            }

            const user = await User.findById(order.userId);
            if(!user){
                Logger.error("User not found")
                return null;
            }

            const payment = await razorPayInstance.paymentLink.create({
                amount: amount * 100,
                currency: 'INR',
                accept_partial: false,
                expire_by: expire,
                reference_id: order_id,
                description: `Payment for order id ${order_id}`,
                customer: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user.email,
                    // contact: user.phoneNumber
                },
                notify: {
                    sms: true,
                    email: true
                },
                reminder_enable: true,
                callback_url: `https://www.karwaanfilms.com/order/payment_status/${order_id}`,
                callback_method: "get"
            }).catch((error) => {
                console.log(error);
            })
            
            return payment;
        } catch (error) {
            console.log(error);
        }
    } 

    static fetchStandardPaymentLinkById = async (payment_id: string) => {
        try {
            const payment = await razorPayInstance.paymentLink.fetch(payment_id);
            return payment;
        } catch (error) {
            console.log(error);
            throw error
        }
    }
}
