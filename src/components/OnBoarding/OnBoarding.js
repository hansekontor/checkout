import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import { Event } from '@utils/GoogleAnalytics';

const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { createWallet } = ContextValue;

    useEffect(() => {
        Event('Onboarding.js', 'Create Wallet', 'New');
        createWallet();
    }, []);

    return;
};

export default OnBoarding;
