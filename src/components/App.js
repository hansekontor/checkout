import React, { useState, Suspense, lazy } from 'react';
import 'antd/dist/antd.less';
import { Spin } from 'antd';
import { CashLoadingIcon, LoadingBlock } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '@assets/styles/theme';
// import Checkout from '@components/Send/Checkout';
const Checkout = lazy(() => import('./Send/Checkout'));
const NotFound = lazy(() => import('./NotFound'));
import CashTab from '@assets/cashtab_xec.png';
import './App.css';
import { WalletContext } from '@utils/context';
import { isValidStoredWallet } from '@utils/cashMethods';
import WalletLabel from '@components/Common/WalletLabel.js';
import {
    Route,
    Redirect,
    Switch,
    useLocation,
    useHistory,
} from 'react-router-dom';
// Easter egg imports not used in extension/src/components/App.js
import TabCash from '@assets/tabcash.png';
import ABC from '@assets/logo_topright.png';
// Biometric security import not used in extension/src/components/App.js
// import ProtectableComponentWrapper from './Authentication/ProtectableComponentWrapper';
import OnBoarding from '@components/OnBoarding/OnBoarding';


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

const Footer = styled.div`
    z-index: 2999;
    background-color: ${props => props.theme.footer.background};
    border-radius: 20px 20px 0 0;
    position: fixed;
    bottom: 0;
    width: 500px;
    box-shadow: 0px -34px 20px rgba(0, 0, 0, 0.02), 0px -15px 15px rgba(0, 0, 0, 0.03), 0px -4px 8px rgba(0, 0, 0, 0.03), 0px 0px 0px rgba(0, 0, 0, 0.03);
    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const NavButton = styled.button`
    :focus,
    :active {
        outline: none;
    }
    cursor: pointer;
    padding: 24px 12px 12px 12px;
    margin: 0 28px;
    @media (max-width: 475px) {
        margin: 0 20px;
    }
    @media (max-width: 420px) {
        margin: 0 12px;
    }
    @media (max-width: 350px) {
        margin: 0 8px;
    }
    background-color: ${props => props.theme.footer.background};
    border: none;
    font-size: 10.5px;
    font-weight: bold;
    .anticon {
        display: block;
        color: ${props => props.theme.footer.navIconInactive};
        font-size: 24px;
        margin-bottom: 6px;
    }
    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.primary};
        .anticon {
            color: ${props.theme.primary};
        }
  `}
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
    const ContextValue = React.useContext(WalletContext);
    const { wallet, previousWallet, loading } = ContextValue;
    const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);
    // If wallet is unmigrated, do not show page until it has migrated
    // An invalid wallet will be validated/populated after the next API call, ETA 10s
    const validWallet = isValidStoredWallet(wallet);
    const location = useLocation();
    const history = useHistory();

    const codeSplitLoader = <LoadingBlock>{CashLoadingIcon}</LoadingBlock>;

    const navRedirect = (key) => {
            window.history.replaceState(null, '', window.location.origin);
            history.push(`/${key}`)
    }

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Spin
                spinning={
                    loading || loadingUtxosAfterSend || (wallet && !validWallet)
                }
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
                            {/* <ProtectableComponentWrapper> */}
                            <WalletLabel name={wallet.name}></WalletLabel>
                                <Suspense fallback={codeSplitLoader}>
                                    <Switch>
                                        <Route path="/checkout">
                                            {(wallet && wallet.Path1899) ||
                                            (previousWallet && previousWallet.path1899) ? (
                                                <Checkout
                                                    {...window.xprops}
                                                />
                                            ) : (
                                                <OnBoarding />
                                            )}
                                        </Route>
                                        <Redirect exact from="/" to="/wallet" />
                                        <Route component={NotFound} />
                                    </Switch>
                                </Suspense>
                            {/* </ProtectableComponentWrapper> */}
                        </WalletCtn>
                    </WalletBody>
                </CustomApp>
            </Spin>
        </ThemeProvider>
    );
};

export default App;
