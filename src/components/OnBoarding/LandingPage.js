import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { WalletContext } from '@utils/context';
import { getWalletState } from '@utils/cashMethods';
import PropTypes from 'prop-types';
import { StyledCollapse } from '@components/Common/StyledCollapse';
import { Collapse } from 'antd';
import styled from "styled-components";
const { Panel } = Collapse;
import {
	Heading,
    Overlay,
    OverlayContent,
} from "../../assets/styles/checkout.styles";
import { QRCode } from '@components/Common/QRCode';
import PrimaryButton from '@components/Common/PrimaryButton';
import { BlackBox } from './BlackBox';
import Footer from '@components/Common/Footer';


const LandingWrapper = styled.div`
    background-color: #f6f6f6;
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    width: inherit;
`;

const ButtonWrapper = styled.div`
    row-gap: 18px;
    position: relative;
    width: 85%;
    align-content: start;
    margin-top: 40px;
    left: 0;
`;

const UseExisting = styled.a`
    left: 0;
    position: absolute;  
`;

const LandingPage = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet } = ContextValue;
    const { tokens } = getWalletState(wallet);

    const [showQrCode, setShowQrCode] = useState(false);
    const [listenForTx, setListenForTx] = useState(false);

    const history = useHistory();
    
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const useExistingTokens = () => {
        setShowQrCode(true);
        setListenForTx(true);
    }

    useEffect(async () => { 
        if (tokens.length > 0 && listenForTx) {
            console.log("token useEffect hook")
            forwardToSendBip70();
        }
    }, [tokens]);
        
    const forwardToSendBip70 = () => {
        return history.push("/wallet/sendBip70");
    }

    return (
        <>       
            {showQrCode && 
                <Overlay>
                    <OverlayContent>
                        <Heading>Send Tokens to this address at your own risk:</Heading>
                        <StyledCollapse>
                            <Panel header="Back up your checkout seed phrase" key="1">
                                <p className="notranslate">
                                    {wallet && wallet.mnemonic ? wallet.mnemonic : ""}
                                </p>
                            </Panel>
                        </StyledCollapse>
                        <QRCode address={wallet.Path1899.slpAddress} />
                        <p>Wait a few seconds for your tokens to arrive and you will be redirected...</p>
                        <PrimaryButton onClick={() => setShowQrCode(false)}>Ok</PrimaryButton>
                    </OverlayContent>
                </Overlay>                
            }            
            <LandingWrapper>


                <BlackBox />
                <ButtonWrapper>
                    <PrimaryButton onClick={() => forwardToSendBip70()}>
                        Proceed to Checkout
                    </PrimaryButton>
                    <UseExisting onClick={() => useExistingTokens()}>Use existing Tokens in Payment</UseExisting>
                </ButtonWrapper>

            </LandingWrapper>
            <Footer />
        </>
    )
};

LandingPage.propTypes = {
    passDecision: PropTypes.func
};

export default LandingPage;

