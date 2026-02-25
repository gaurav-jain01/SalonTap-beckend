import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    main_text: { type: String },
    secondary_text: { type: String },
    place_id: { type: String, required: false },
    latitude: { type: Number },
    longitude: { type: Number },
    houseNumber: { type: String, required: false, default: '' },
    label: { type: String, required: false, default: '' },
    isLocationsFilled: { type: Boolean, default: false },

}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;
