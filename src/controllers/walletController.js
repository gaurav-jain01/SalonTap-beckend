import express from "express";
import userModel from "../models/userModel.js";
import walletModel from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import WalletTransactionService from "../services/walletTransaction.service.js";


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
        const { amount } = req.body;
        const { id: userId } = req.user;

        const result = await WalletTransactionService.addMoney({
            userId,
            amount,
            category: "userWallet",
            action: "topup",
            message: "Wallet top-up successful",
            reference: { type: "wallet", id: "manual_topup" }
        });

        res.status(200).json({
            success: true,
            message: "Money added successfully",
            data: {
                balance: result.wallet.balance.available,
                currency: result.wallet.currency,
                transaction: result.transaction,
            },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deductMoney = async (req, res) => {
    try {
        const { amount } = req.body;
        const { id: userId } = req.user;

        const result = await WalletTransactionService.deductMoney({
            userId,
            amount,
            category: "userWallet",
            action: "payment",
            message: "Money deducted for service/payment",
            reference: { type: "wallet", id: "manual_deduct" }
        });

        res.status(200).json({
            success: true,
            message: "Money deducted successfully",
            data: {
                balance: result.wallet.balance.available,
                currency: result.wallet.currency,
                transaction: result.transaction,
            },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

