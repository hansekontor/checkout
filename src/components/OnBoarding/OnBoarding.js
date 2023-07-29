import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { Input, Form, Modal, Spin } from 'antd';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import {
    ExclamationCircleOutlined,
    PlusSquareOutlined,
    ImportOutlined,
    LockOutlined,
} from '@ant-design/icons';
import PrimaryButton, {
    SecondaryButton,
    SmartButton,
} from '@components/Common/PrimaryButton';
import { currency } from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';

export const WelcomeText = styled.p`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin-bottom: 60px;
    text-align: left;
`;

export const WelcomeLink = styled.a`
    text-decoration: underline;
    color: ${props => props.theme.primary};
`;

const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { createWallet } = ContextValue;

    useEffect(() => {
        Event('Onboarding.js', 'Create Wallet', 'New');
        createWallet();
    }, []);

    return (
        <>
            <WelcomeText>
                Creating new wallet. Please wait.
            </WelcomeText>
        </>
    );
};

export default OnBoarding;
