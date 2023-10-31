import React, { useState, Suspense, lazy } from 'react';
import 'antd/dist/antd.less';
import { CashLoadingIcon, LoadingBlock } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '@assets/styles/theme';
const Wallet = lazy(() => import('./Wallet/Wallet'));
const NotFound = lazy(() => import('./NotFound'));
import CashTab from '@assets/cashtab_xec.png';
import './App.css';
import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import ABC from '@assets/logo_topright.png';
import { Spin } from 'antd';


const GlobalStyle = createGlobalStyle`    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button, .ant-modal > button, .ant-modal-confirm-btns > button, .ant-modal-footer > button, #cropControlsConfirm {
        border-radius: 8px;
        background-color: ${props => props.theme.modals.buttons.background};
        color: ${props => props.theme.wallet.text.secondary};
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

    .selectedCurrencyOption {
        text-align: left;
        color: ${props => props.theme.wallet.text.secondary} !important;
        background-color: ${props => props.theme.contrast} !important;
    }
    .cashLoadingIcon {
        color: ${props => props.theme.primary} !important;
        font-size: 48px !important;
    }
    .selectedCurrencyOption:hover {
        color: ${props => props.theme.contrast} !important;
        background-color: ${props => props.theme.primary} !important;
    }
    #addrSwitch, #cropSwitch {
        .ant-switch-checked {
            background-color: white !important;
        }
    }
    #addrSwitch.ant-switch-checked, #cropSwitch.ant-switch-checked {
        background-image: ${props =>
            props.theme.buttons.primary.backgroundImage} !important;
    }

    .ant-slider-rail {
        background-color: ${props => props.theme.forms.border} !important;
    }
    .ant-slider-track {
        background-color: ${props => props.theme.primary} !important;
    }
`;

const CustomApp = styled.div`
    text-align: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: ${props => props.theme.app.background};
`;


export const WalletBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    background: #d5d5d5;
`;

export const WalletCtn = styled.div`
    position: relative;
    width: 500px;
    background-color: ${props => props.theme.footerBackground};
    min-height: 100vh;
    padding: 10px 30px 120px 30px;
    background: ${props => props.theme.wallet.background};
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.05);
    @media (max-width: 768px) {
        width: 100%;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
`;

export const HeaderCtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px 0 0px;
    margin-bottom: 20px;
    justify-content: flex-end;

    a {
        color: ${props => props.theme.wallet.text.secondary};

        :hover {
            color: ${props => props.theme.primary};
        }
    }

    @media (max-width: 768px) {
        a {
            font-size: 12px;
        }
        padding: 10px 0 20px;
    }
`;

export const CashTabLogo = styled.img`
    width: 55px;
    margin-left: 8px;
`;

// AbcLogo styled component not included in extension, replaced by open in new tab link
export const AbcLogo = styled.img`
    width: 70px;
`;

const App = () => {
    const codeSplitLoader = <LoadingBlock>{CashLoadingIcon}</LoadingBlock>;
    const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Spin
                spinning={loadingUtxosAfterSend}
                indicator={CashLoadingIcon}
                tip={typeof loadingUtxosAfterSend === "string" ? loadingUtxosAfterSend : ""}
            >
                <CustomApp>
                    <WalletBody>
                        <WalletCtn>
                            <HeaderCtn>
                                {/*Begin component not included in extension as replaced by open in tab link*/}
                                <a
                                    href="https://e.cash/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <AbcLogo src={ABC} alt="abc" />
                                </a>
                                <CashTabLogo src={CashTab} alt="cashtab" />
                                {/*Begin component not included in extension as replaced by open in tab link*/}
                            </HeaderCtn>
                                <Suspense fallback={codeSplitLoader}>
                                    <Switch>
                                        <Route path="/wallet">
                                            <Wallet 
                                                {...window.xprops}
                                                passLoadingStatus={setLoadingUtxosAfterSend}
                                            />
                                        </Route>
                                        <Redirect exact from="/" to="/wallet" />
                                        <Route component={NotFound} />
                                    </Switch>
                                </Suspense>
                        </WalletCtn>
                    </WalletBody>
                </CustomApp>
            </Spin>
        </ThemeProvider>
    );
};

export default App;
