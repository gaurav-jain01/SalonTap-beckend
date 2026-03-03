import Transaction from "../models/transactionModel.js";

export const createTransaction = async (userId, amount, type, balance, currency, status) => {
    const transaction = new Transaction({
        userId,
        amount,
        type,
        balance,
        currency,
        status,
    });
    await transaction.save();
    return transaction;
};