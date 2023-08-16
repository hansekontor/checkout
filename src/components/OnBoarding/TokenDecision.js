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



const TokenDecision = ({
    passDecisionStatus 
}) => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet } = ContextValue;
    const { balances, tokens } = getWalletState(wallet);
    console.log("PaymentTypeDecision balances", balances);
    console.log("PaymentTypeDecision tokens", tokens);
    const [showQrCode, setShowQrCode] = useState(false);
    const [listenForTx, setListenForTx] = useState(false);

    const tokenId = "4075459e0ac841f234bc73fc4fe46fe5490be4ed98bc8ca3f9b898443a5a381a";
    const paymentTokens = tokens.filter(token => token.tokenId === tokenId);

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const useExistingTokens = () => {
        console.log("useExistingTokens")
        setShowQrCode(true);
        setListenForTx(true);
    }

    useEffect(async () => { // ?
        if (paymentTokens.length > 0) {
            passDecisionStatus(true);
        }
    }, [paymentTokens]);
        
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
    passDecisionStatus: PropTypes.func
};

export default TokenDecision;

