
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

const ViewVoucherDialog = ({ voucher, fromAccount, toAccount, beneficiary, isOpen, onOpenChange }) => {
    if (!voucher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="glass-pane text-white">
                <DialogHeader>
                    <DialogTitle>Voucher Details</DialogTitle>
                    <DialogDescription>Transaction from {new Date(voucher.created_date).toLocaleDateString()}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-400">Beneficiary:</p>
                        <p>{voucher.beneficiaryName}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-400">Amount:</p>
                        <p>₹{parseFloat(voucher.amount).toFixed(2)}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-400">Type:</p>
                        <p className="capitalize">{voucher.voucher_type}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-400">Payment Method:</p>
                        <p className="capitalize">{voucher.payment_type}</p>
                    </div>
                    {voucher.payment_type === 'bank' && fromAccount && (
                         <div className="grid grid-cols-2 gap-2">
                            <p className="text-gray-400">From Account:</p>
                            <p>{fromAccount.bank_name} (...{fromAccount.account_number.slice(-4)})</p>
                        </div>
                    )}
                     {voucher.payment_type === 'bank' && toAccount && (
                         <div className="grid grid-cols-2 gap-2">
                            <p className="text-gray-400">To Account:</p>
                            <p>{toAccount.bank_name} (...{toAccount.account_number.slice(-4)})</p>
                        </div>
                    )}
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-400">Remarks:</p>
                        <p>{voucher.remarks || 'N/A'}</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewVoucherDialog;
