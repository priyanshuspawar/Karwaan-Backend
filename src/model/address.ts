import mongoose, { Document, Schema } from "mongoose";

interface AddressInterface extends Document{
    userId: string,
    houseNumber: string,
    buildingName: string,
    street: string,
    city: string,
    state: string,
    country: string,
    pin: string,
    createdAt: string;
    updatedAt: string;
}

const AddressSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    houseNumber: {type: String, required: true},
    buildingName: {type: String, required: false},
    street: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    country: {type: String, required: true},
    pin: {type: String, required: true},
}, {timestamps: true});

const Address = mongoose.model<AddressInterface>('Address', AddressSchema);

export default Address;