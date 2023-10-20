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
import OnBoarding from '../OnBoarding/OnBoarding';


const Wallet = ({    
    paymentUrl, 
    paymentRequest = {}, 
    onSuccess, 
    onCancel, 
    passLoadingStatus,
}) => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, loading } = ContextValue;
    const validWallet = isValidStoredWallet(wallet);

    const prefixesArray = [
        ...currency.prefixes,
        ...currency.tokenPrefixes
    ];

    const relayUrl = process.env.RELAY_URL;
    
    const { push } = useHistory();

    const [isFinalBalance, setFinalBalance] = useState(false);
    const [prInfoFromUrl, setPrInfoFromUrl] = useState(false);

    const hasPaymentUrl = paymentUrl.length === 31 && paymentUrl.startsWith("https://pay.badger.cash/i/");
    const hasPaymentRequest = 'customer_id' in paymentRequest // url trumps new request
                    && 'amount' in paymentRequest && !hasPaymentUrl;

    if (!hasPaymentUrl && !hasPaymentRequest) {
        onCancel("Error: Invalid Properties");
    }

    useEffect(async() => {
        const prInfo = {};
        if (
            hasPaymentUrl ||
            hasPaymentRequest ||
            !prInfoFromUrl
        ) {
            if (hasPaymentRequest) {            
                const allowedParameters = [ 
                    "invoice", 
                    "order_key", 
                    "amount", 
                    "offer_name", 
                    "offer_description", 
                    "success_url",
                    "cancel_url", 
                    "ipn_url",
                    "customer_id",
                    "cert_hash", 
                    "merchant_name"
                ];
                const prQuery = Object.keys(paymentRequest)
                    .filter(key => allowedParameters.includes(key))
                    .reduce((obj, key) => {
                    obj[key] = paymentRequest[key];
                    return obj;
                }, {});
                if (paymentRequest.customer_id) // api currently only takes certificates
                    prQuery.cert_hash = prQuery.customer_id;
                prQuery.return_json = true;    
                console.log("prQuery", prQuery);
                const data = await fetch(
                    relayUrl + "?" + new URLSearchParams(prQuery))
                    .then(res => res.json());
                console.log("fetch data", data);
                prInfo.url = data.paymentUrl;
                prInfo.type = data.currency;
                // catch error
            } else {
                prInfo.url = paymentUrl;
                prInfo.type ="etoken";
            }
            console.log("prInfo from props", prInfo);
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
                // // Forward to selfMint if auth code is specified
                // if (param == 'mintauth') {
                //     console.log('has mintauth')
                //     return push('/selfMint');
                // }

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

        if (prInfo.url && prInfo.type && !prInfoFromUrl) {
            try {
                prInfo.paymentDetails = (await getPaymentRequest(
                    prInfo.url, 
                    prInfo.type
                )).paymentDetails;
                prInfo.paymentDetails.merchantDataJson = JSON.parse(prInfo.paymentDetails.merchantData.toString());
                prInfo.paymentDetails.type = prInfo.type;
                setPrInfoFromUrl(prInfo);
                console.log("Wallet.js prInfo set");
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
    onSuccess: link => {
        console.log("Payment successful:", link);
    },
    onCancel: status => {
        console.log("Payment cancelled:", status);
    },
    passLoadingStatus: status => {
        console.log("loadingStatus:", status);
    }
};

Wallet.propTypes = {
    paymentUrl: PropTypes.string,
    paymentRequest: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    passLoadingStatus: PropTypes.func
};

export default Wallet;