import React from 'react';
import styled from 'styled-components';
import PrimaryButton from '@components/Common/PrimaryButton';
import ReceiptSvg from '@assets/receipt_icon.svg';
import ProgressDots from '@components/Common/ProgressDots';
import Footer from '@components/Common/Footer';

const ReceiptCtn = styled.div`
    background-color: #f6f6f6;
    display: flex;
    align-items: center;
    min-height: 475px;
    position: fixed;
    top: 0;
    width: inherit;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
`; 
const ReceiptHeader = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 85%;
    margin-top: 10px;
`;
const ReceiptHeaderText = styled.div`
    align-items: center;
    display: flex;
    gap: 18px;
    position: relative;
    width: fit-content;
    color: #000000;
    font-family: "Inter-Medium", Helvetica;
    font-size: 16px;
    line-height: normal;
    position: relative;
`;
const ReceiptIcon = styled.img``;
const Divider = styled.div`
    width: 85%;
    height: 1px;
    background-color: #000000;
`;
const ReceiptContent = styled.div`
    align-items: flex-start;
    display: inline-flex;
    flex-direction: column;
    gap: 10px;
    width: 85%;
`;
const ReceiptItem = styled.div`
    align-items: flex-start;
    display: flex;
    flex: 0 0 auto;
    justify-content: space-between;
    position: relative;
    width: 100%;
`;
const ReceiptLabel = styled.div`
    color: #000000;
    font-family: "Inter-Regular", Helvetica;
    font-size:14px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 20px;
    position: relative;
    width: fit-content;
`;
const ReceiptValue = styled.div`
    color: #000000;
    font-family: "Inter-Regular", Helvetica;
    font-size:14px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 25px;
    position: relative;
    white-space: nowrap;
    width: fit-content;
`;
const Txid = styled.div`
    font-size: 14px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    margin-left: 50px;
    color: #000000;
    align-items: right;
`;
const Link = styled.a`
    text-decoration-line: underline;
`;
const ButtonCtn = styled.div`
    width: 85%;
`;
    
const Receipt = ({
    receiptDetails = {}
}) => {

    console.log("RECEIPT", receiptDetails);
    const {displayTicker, order_number, totalAmount, tokenAmount, 
        offer_name, merchant_name, invoice, time_broadcasted, tx_id } = receiptDetails;
    const receiptForCheckout = (order_number || totalAmount) ? true : false;
    const date = new Date(time_broadcasted);
    const dateString = date.toISOString()
    const displayDate = dateString.slice(0,19)
        .replace("T", " ")
        .replace("-", "/")
        .replace("-", "/");

    const handleReturnToMerchant = () => {
        window.close();
    }

    return (
        <>
            <ReceiptCtn>
                <ProgressDots progress={3} />
                <ReceiptHeader>
                    <ReceiptHeaderText>RECEIPT</ReceiptHeaderText>
                    <ReceiptIcon src={ReceiptSvg} />
                </ReceiptHeader>
                <Divider />
                <ReceiptContent>
  
                    {receiptForCheckout ? (
                        <>
                            <ReceiptItem>
                                <ReceiptLabel>Order Number</ReceiptLabel>
                                <ReceiptValue>#{order_number}</ReceiptValue>
                            </ReceiptItem> 
                            <ReceiptItem>
                                <ReceiptLabel>You bought an auth code for {tokenAmount} {displayTicker}</ReceiptLabel>
                                <ReceiptValue>${totalAmount}</ReceiptValue>
                            </ReceiptItem>                          
                        </>
                    ) : (
                        <ReceiptItem>
                            <ReceiptLabel>You sent a transaction with {tokenAmount} {displayTicker}</ReceiptLabel>                                
                        </ReceiptItem>                          
                    )}

                    <ReceiptItem>
                        <ReceiptLabel>Offer</ReceiptLabel>
                        <ReceiptValue>{offer_name}</ReceiptValue>
                    </ReceiptItem>
                    {/* <ReceiptItem>
                        <ReceiptLabel>Description</ReceiptLabel>
                        <ReceiptValue>OfferDescription</ReceiptValue>
                    </ReceiptItem> */}
                    <ReceiptItem>
                        <ReceiptLabel>Merchant</ReceiptLabel>
                        <ReceiptValue>{merchant_name}</ReceiptValue>
                    </ReceiptItem>
                    <ReceiptItem>
                        <ReceiptLabel>Invoice</ReceiptLabel>
                        <ReceiptValue>{invoice}</ReceiptValue>
                    </ReceiptItem>                
                    <ReceiptItem>
                        <ReceiptLabel>Transaction Completed</ReceiptLabel>
                        <ReceiptValue>{displayDate}</ReceiptValue>
                    </ReceiptItem>
                    <ReceiptItem>
                        <ReceiptLabel>Txid</ReceiptLabel>
                        <Txid><Link href={`https://explorer.cert.cash/tx/${tx_id}`}>{tx_id}</Link></Txid>
                    </ReceiptItem>                    
                </ReceiptContent>        
                <Divider />
                <ButtonCtn>
                    <PrimaryButton onClick={() => handleReturnToMerchant()}>Return to Merchant</PrimaryButton>       
                </ButtonCtn>
            </ReceiptCtn>
            <Footer />                
  
        </>

    )
}

export default Receipt;