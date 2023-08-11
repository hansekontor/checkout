import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { getWalletState } from '@utils/cashMethods';
import PropTypes from 'prop-types';
import PrimaryButton from '@components/Common/PrimaryButton';
import { StyledCollapse } from '@components/Common/StyledCollapse';
import { Collapse } from 'antd';
const { Panel } = Collapse;
import {
	Heading,
    AgreeOverlay,
    AgreeModal,
} from "../../assets/styles/checkout.styles";
import { QRCode } from '@components/Common/QRCode';
import BigNumber from 'bignumber.js';
// import { useHistory } from 'react-router-dom';
// const { push } = useHistory();
import { getPaymentRequest } from '../../utils/bip70';



const TokenDecision = ({
    prInfoFromUrl,
    passDecisionStatus 
}) => {
    console.log("Onboarding paymentRequest", prInfoFromUrl);
    const ContextValue = React.useContext(WalletContext);
    const { wallet } = ContextValue;
    const { balances, tokens } = getWalletState(wallet);
    console.log("PaymentTypeDecision balances", balances);
    console.log("PaymentTypeDecision tokens", tokens);
    const [showQrCode, setShowQrCode] = useState(false);
    const [listenForTx, setListenForTx] = useState(false);
    const [isFinalBalance, setFinalBalance] = useState(false);

    const tokenId = "4075459e0ac841f234bc73fc4fe46fe5490be4ed98bc8ca3f9b898443a5a381a";
    const paymentTokens = tokens.filter(token => token.tokenId === tokenId);

    const amountArray = prInfoFromUrl.paymentDetails.merchantDataJson.ipn_body.amount1;
    const purchaseTokenAmount = amountArray.reduce((acc, amount) => acc + Number(amount), 0);
    // const feeAmount = (.50 + (purchaseTokenAmount * .06)).toFixed(2); // Add 50 cent fixed fee to 6% percentage
    // const totalAmount = (Number(purchaseTokenAmount) + Number(feeAmount)).toFixed(2);

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const useExistingTokens = () => {
        console.log("useExistingTokens")
        setShowQrCode(true);
        setListenForTx(true);
    }

    useEffect(async () => { // ?
        if (isFinalBalance) {
            passDecisionStatus(true);
        }
    }, []);
        
    return (
        <>
            {listenForTx ? (                
                <>
                    <PrimaryButton onClick={() => passDecisionStatus(true)}>Proceed with current balance</PrimaryButton>
                    <PrimaryButton onClick={() => setShowQrCode(true)}>Show QR Code again</PrimaryButton>
                    <p>Waiting to receive Tokens...</p>
                </>

            ) : (
                <>              
                    <PrimaryButton onClick={() => passDecisionStatus(true)}>Fiat Only Payment</PrimaryButton>
                    <PrimaryButton onClick={() => useExistingTokens()}>Use existing Tokens in Payment</PrimaryButton>
                </>
            )}


            {showQrCode &&
                <AgreeOverlay>
                    <AgreeModal>
                        <Heading>Send Tokens to the checkout address:</Heading>
                        <p>You send Tokens to this address at your own risk.</p>
                        <p>Invoice amount: ${purchaseTokenAmount}</p>
                        <StyledCollapse>
                            <Panel header="Click to back up your checkout seed phrase" key="1">
                                <p className="notranslate">
                                    {wallet && wallet.mnemonic ? wallet.mnemonic : ''}
                                </p>
                            </Panel>
                        </StyledCollapse>
                        <QRCode address={wallet.Path1899.slpAddress}></QRCode>
                        <PrimaryButton onClick={() => setShowQrCode(false)}>Ok</PrimaryButton>
                    </AgreeModal>
                </AgreeOverlay>}
        </>
    )
};

TokenDecision.propTypes = {
    prInfoFromUrl: PropTypes.object,
    passDecisionStatus: PropTypes.func
};

export default TokenDecision;

