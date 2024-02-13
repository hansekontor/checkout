import React, { useState, Suspense, lazy, useEffect } from 'react';
import 'antd/dist/antd.less';
import { CashLoadingIcon, LoadingBlock } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '../assets/styles/theme';
const Wallet = lazy(() => import('./Wallet/Wallet'));
const NotFound = lazy(() => import('./NotFound'));
import { LoaderCtn, Loader, LoadingAnimation, LoadingText } from '@components/Common/CustomLoader';
import './App.css';
import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

const GlobalStyle = createGlobalStyle`    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button, .ant-modal > button, .ant-modal-confirm-btns > button, .ant-modal-footer > button, #cropControlsConfirm {
        border-radius: 8px;
        background-color: ${props => props.theme.modals.buttons.background};
        color: ${props => props.theme.wallet.text.primary};
        font-weight: bold;
    }    
    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button:hover,.ant-modal-confirm-btns > button:hover, .ant-modal-footer > button:hover, #cropControlsConfirm:hover {
        color: ${props => props.theme.primary};
        transition: color 0.3s;
        background-color: ${props => props.theme.modals.buttons.background};
    }
    
    .ant-spin-text {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: bold;
        margin-top: 40px;
        font-size: 16px;
        color: ${props => props.theme.wallet.text.secondary};
    }
    .cashLoadingIcon {
        color: #000000 !important;
        font-size: 48px !important;
    }
`;
const CustomApp = styled.div`
    text-align: center;
    font-family: 'Inter-Medium', Helvetica;
    background-color: ${theme.app.background};
`;
export const WalletBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    top: 0;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    overlap: scroll;
    background: #f6f6f6;
    flex-direction: column;
`;
export const WalletCtn = styled.div`
    width: 480px;
    min-height: 100vh;
    height: fit-content;
    background-color: #f6f6f6;
    margin: 0;
    padding: 0;
    position: fixed;
    top: 0;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 0px;
    align-items: flex;

    @media (max-width: 480px) {
        width: 100%;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
`;



const App = () => {
    const codeSplitLoader = <LoadingBlock>{CashLoadingIcon}</LoadingBlock>;
    const [loadingStatus, passLoadingStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(async () => { 

        if (loadingStatus && !loading) 
            setLoading(true);
        else if (!loadingStatus && loading)
            setLoading(false);
        
    }, [loadingStatus]);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
                <CustomApp>
                    <WalletBody>
                        <WalletCtn>
                            <Suspense fallback={codeSplitLoader}>
                                {loading && 
                                    <>  
                                        <LoaderCtn>
                                            <Loader>
                                                <LoadingAnimation />
                                                <LoadingText>{typeof loadingStatus==='string' ? loadingStatus : ""}</LoadingText>
                                            </Loader>
                                        </LoaderCtn>
                                    </> 
                                } 
                                <Switch>
                                    <Route path="/wallet">
                                        <Wallet 
                                            {...window.xprops}
                                            passLoadingStatus={passLoadingStatus}
                                        />
                                    </Route>
                                    <Redirect exact from="/" to="/wallet" />
                                    <Route component={NotFound} />
                                </Switch>
                            </Suspense>
                        </WalletCtn>
                    </WalletBody>
                </CustomApp>
        </ThemeProvider>
    );
};

export default App;
