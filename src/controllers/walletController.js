import express from "express";
import userModel from "../models/userModel.js";
import walletModel from "../models/walletModel.js";
import transactionModel from "../models/transactionModel.js";


export const getWallet = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select("name email mobile gender profileImage createdAt isActive");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addMoney = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select("name email mobile gender profileImage createdAt isActive");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}