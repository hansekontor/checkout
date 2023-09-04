import React, { useState, useEffect } from 'react';
import { WalletContext } from '@utils/context';



const OnBoarding = () => {
    const ContextValue = React.useContext(WalletContext);
    const { createWallet, wallet } = ContextValue;
    const [walletCreated, setWalletCreated] = useState(false);

    useEffect(async () => {
        if (!walletCreated) {
            await createWallet();
            setWalletCreated(true);
        }
    }, []);

    return null;
};

export default OnBoarding;