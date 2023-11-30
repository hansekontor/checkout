require('dotenv').config();
import React, { useEffect, useState, lazy, Suspense }  from 'react';
import { useHistory, Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { WalletContext } from '@utils/context';
import { currency } from '@components/Common/Ticker.js';
import { getUrlFromQueryString } from '@utils/bip70';
import { getPaymentRequest } from '../../utils/bip70';
const Checkout = lazy(() => import('../Send/Checkout'));
const SendBip70 = lazy(() => import('../Send/SendBip70'));
const TokenDecision = lazy(() => import('../OnBoarding/TokenDecision'));
const Onboarding = lazy(() => import('../OnBoarding/OnBoarding'));
import { LoadingCtn } from '@components/Common/Atoms';
import { isValidStoredWallet } from '@utils/cashMethods';
import { errorNotification } from '@components/Common/Notifications';


const Wallet = ({    
    paymentUrl, 
    paymentRequest = {}, 
    onSuccess, 
    onCancel,
    onRequest, 
    passLoadingStatus
}) => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, loading } = ContextValue;
    const validWallet = isValidStoredWallet(wallet);

    const prefixesArray = [
        ...currency.prefixes,
        ...currency.tokenPrefixes
    ];

    const { push } = useHistory();

    const [isFinalBalance, setFinalBalance] = useState(false);
    const [prInfoFromUrl, setPrInfoFromUrl] = useState(false);

    const hasPaymentUrl = paymentUrl.length === 31 && paymentUrl.startsWith("https://pay.badger.cash/i/");
    const hasPaymentRequest = !hasPaymentUrl // url trumps new request
                    && 'cert_hash' in paymentRequest 
                    && 'amount' in paymentRequest;

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    } 

    useEffect(async() => {
        const prInfo = {};
        if (
            hasPaymentUrl ||
            hasPaymentRequest ||
            !prInfoFromUrl
        ) {
            if (hasPaymentRequest) {            
                const prQuery = paymentRequest;
                prQuery.return_json = true;    
                console.log("prQuery", prQuery);
                const data = await fetch(
                    "https://relay1.cmpct.org/template" + "?" + new URLSearchParams(prQuery))
                    .then(res => res.json());                
                prInfo.url = data.paymentUrl;
                prInfo.type = data.currency;
                onRequest(prInfo);
                // catch error
            } else if (hasPaymentUrl) {
                prInfo.url = paymentUrl;
                prInfo.type ="etoken"; // todo: verify this
            } else {
                const fullQueryString = window.location.search == '' ? 
                    window.location.hash : window.location.search;

                const delimiterIndex = fullQueryString.indexOf('?');
                const txInfoArr = fullQueryString
                    .slice(delimiterIndex+1)
                    .split('&');

                // Iterate over this to create object
                for (let i = 0; i < txInfoArr.length; i += 1) {
                    const delimiterIndex = txInfoArr[i].indexOf('=');
                    const param = txInfoArr[i]
                        .slice(0, delimiterIndex)
                        .toLowerCase();

                    const encodedValue = txInfoArr[i].slice(delimiterIndex+1);
                    const value = decodeURIComponent(encodedValue);
                    const prefix = value.split(':')[0];
                    if (param === 'uri' && prefixesArray.includes(prefix)) {
                        const queryString = value.split('?')[1];
                        const url = getUrlFromQueryString(queryString);
                        if (url) {
                            prInfo.url = url;
                            prInfo.type = "etoken";
                        }
                    }
                }

            }
            console.log("prInfo from props", prInfo);
        }

        if (!prInfo.url) {
            onCancel("Error: Invalid Properties");
            passLoadingStatus("Invalid Properties");
            await sleep(5000);
            window.close();
        }

        if (prInfo.url && prInfo.type && !prInfoFromUrl) {
            try {
                prInfo.paymentDetails = (await getPaymentRequest(
                    prInfo.url, 
                    prInfo.type
                )).paymentDetails;
                console.log("prinfo.paymentDetails", prInfo.paymentDetails)
                prInfo.paymentDetails.merchantDataJson = JSON.parse(prInfo.paymentDetails.merchantData.toString());
                prInfo.paymentDetails.type = prInfo.type;
                setPrInfoFromUrl(prInfo);
            } catch (err) {
                errorNotification(err, 
                    'Failed to fetch invoice. May be expired or invalid', 
                    `Fetching invoice: ${prInfo.url}`
                );
                onCancel(`Failed to fetch invoice: ${prInfo.url}. May be expired or invalid`);
                await sleep(3000);
                window.close();
            }
        } 
    }, []);
 

    return (
        <Suspense fallback={<LoadingCtn />}>
            <Switch>
                <Route path={"/wallet/onBoarding"}>
                    <>            
                        {(wallet && wallet.Path1899 && !loading && validWallet ) ? (
                            <TokenDecision />
                        ) : ( 
                            <Onboarding />
                        )} 
                    </>
                </Route>
                <Route path="/wallet/sendBip70">
                    <> 
                        {prInfoFromUrl && (
                            <SendBip70 
                                prInfoFromUrl={prInfoFromUrl} 
                                onSuccess={onSuccess}
                                onCancel={onCancel}
                                passLoadingStatus={passLoadingStatus}
                            />
                        )}
                    </>
                </Route>
                <Route path="/wallet/checkout">
                    <>
                        {prInfoFromUrl && (
                            <Checkout 
                                prInfoFromUrl={prInfoFromUrl} 
                                onSuccess={onSuccess}
                                onCancel={onCancel}
                                passLoadingStatus={passLoadingStatus}                
                            />                            
                        )}
                    </>
                </Route>
                <Redirect exact from="/wallet" to="/wallet/onBoarding" />
            </Switch>
        </Suspense>
    );

  
};

Wallet.defaultProps = {
    paymentUrl: "",
    paymentRequest: {},
    onSuccess: (hash, link) => {
        console.log("Payment successful:", link);
    },
    onCancel: status => {
        console.log("Payment cancelled:", status);
    },
    onRequest: pr => {
        console.log("Payment Request:", pr);
    }
};

Wallet.propTypes = {
    paymentUrl: PropTypes.string,
    paymentRequest: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    onRequest: PropTypes.func,
    passLoadingStatus: PropTypes.func
};

export default Wallet;