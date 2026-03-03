import express from "express";
import userModel from "../models/userModel.js";
import walletModel from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";


export const getWallet = async (req, res) => {
    try {
        const { id } = req.user;
        const wallet = await walletModel.findOne({ userId: id }).select("balance currency status -_id");
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Wallet fetched successfully",
            data: wallet,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addMoney = async (req, res) => {
    try {
        let { amount } = req.body;
        amount = Number(amount);
        const { id } = req.user;
        const wallet = await walletModel.findOne({ userId: id });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found",
            });
        }
        wallet.balance.available += amount;
        await wallet.save();
        res.status(200).json({
            success: true,
            message: "Money added successfully",
            data:{
                balance: wallet.balance.available,
                currency: wallet.currency,
                status: wallet.status,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deductMoney = async (req, res) => {
    try {
        let { amount } = req.body;
        amount = Number(amount);
        const { id } = req.user;
        const wallet = await walletModel.findOne({ userId: id });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found",
            });
        }
        wallet.balance.available -= amount;
        await wallet.save();
        res.status(200).json({
            success: true,
            message: "Money deducted successfully",
            data:{
                balance: wallet.balance.available,
                currency: wallet.currency,
                status: wallet.status,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

