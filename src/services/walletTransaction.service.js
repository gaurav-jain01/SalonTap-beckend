// services/walletTransaction.service.js

import walletModel from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";

export default class WalletTransactionService {

    // 🔹 Add Money
    static async addMoney({
        userId,
        amount,
        category = "userWallet",
        action = "topup",
        reference = {},
        message = "Money added to wallet",
    }) {
        amount = Number(amount);
        if (amount <= 0) throw new Error("Invalid amount");

        const wallet = await walletModel.findOne({ userId });
        if (!wallet) throw new Error("Wallet not found");

        const beforeBalance = wallet.balance.available;

        wallet.balance.available += amount;
        await wallet.save();

        const afterBalance = wallet.balance.available;

        const transaction = await Transaction.create({
            userId,
            walletId: wallet._id,
            direction: "in",
            category,
            action,
            amount: { value: amount, currency: wallet.currency },
            balanceSnapshot: { before: beforeBalance, after: afterBalance },
            reference,
            status: "completed",
            remark: message,
        });

        return { wallet, transaction };
    }

    // 🔹 Deduct Money
    static async deductMoney({
        userId,
        amount,
        category = "userWallet",
        action = "payment",
        reference = {},
        message = "Amount deducted",
    }) {
        amount = Number(amount);
        if (amount <= 0) throw new Error("Invalid amount");

        const wallet = await walletModel.findOne({ userId });
        if (!wallet) throw new Error("Wallet not found");

        const beforeBalance = wallet.balance.available;

        if (beforeBalance < amount) throw new Error("Insufficient balance");

        wallet.balance.available -= amount;
        await wallet.save();

        const afterBalance = wallet.balance.available;

        const transaction = await Transaction.create({
            userId,
            walletId: wallet._id,
            direction: "out",
            category,
            action,
            amount: { value: amount, currency: wallet.currency },
            balanceSnapshot: { before: beforeBalance, after: afterBalance },
            reference,
            status: "completed",
            remark: message,
        });

        return { wallet, transaction };
    }
}