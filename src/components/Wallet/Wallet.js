import React, { useEffect, useState }  from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { WalletContext } from '@utils/context';
import { currency } from '@components/Common/Ticker.js';
import { getUrlFromQueryString } from '@utils/bip70';
import { getPaymentRequest } from '../../utils/bip70';
import Checkout from '@components/Send/Checkout';
import SendBip70 from '@components/Send/SendBip70';
import TokenDecision from '@components/OnBoarding/TokenDecision';
import Onboarding from '@components/OnBoarding/OnBoarding';
import { LoadingCtn } from '@components/Common/Atoms';
import { isValidStoredWallet } from '@utils/cashMethods';


const Wallet = ({    
    paymentUrl, 
    paymentRequest = {}, 
    onSuccess, 
    onCancel
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
    const [routeToCheckout, setRouteToCheckout] = useState(false);

    const hasPaymentUrl = paymentUrl.length === 31 && paymentUrl.startsWith("https://pay.badger.cash/i/");
    const hasPaymentRequest = 'customer_id' in paymentRequest // url trumps new request
                    && 'amount' in paymentRequest && !hasPaymentUrl;

    useEffect(async() => {
        const prInfo = {};
        if (
            !window.location ||
            !window.location.hash ||
            (window.location.search == '' && window.location.hash === '#/sendBip70') ||
            hasPaymentUrl ||
            hasPaymentRequest
        ) {
            console.log("useEffect first conditional hit");

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
                    "https://relay2.cmpct.org/template?" + new URLSearchParams(prQuery))
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
                // Forward to selfMint if auth code is specified
                if (param == 'mintauth') {
                    console.log('has mintauth')
                    return push('/selfMint');
                }

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

        if (prInfo.url && prInfo.type) {
            try {
                prInfo.paymentDetails = (await getPaymentRequest(
                    prInfo.url, 
                    prInfo.type
                )).paymentDetails;
                prInfo.paymentDetails.merchantDataJson = JSON.parse(prInfo.paymentDetails.merchantData.toString());
                prInfo.paymentDetails.type = prInfo.type;
                setPrInfoFromUrl(prInfo);
            } catch (err) {
                errorNotification(err, 
                    'Failed to fetch invoice. May be expired or invalid', 
                    `Fetching invoice: ${prInfo.url}`
                );
                onCancel();
                await sleep(3000);
                window.close();
            }
        } 
    }, []);

    return (
        <>  
            {loading || (wallet && !validWallet) ? (
                <LoadingCtn />
            ) : (
                <>
                    {(isFinalBalance && prInfoFromUrl) ? (
                        <>
                            {routeToCheckout ? (
                                <Checkout
                                    prInfoFromUrl={prInfoFromUrl} 
                                    onSuccess={onSuccess}
                                    onCancel={onCancel}
                                />
                            ) : (                
                                <SendBip70 
                                    prInfoFromUrl={prInfoFromUrl} 
                                    onSuccess={onSuccess}
                                    onCancel={onCancel}
                                    forwardToCheckout={setRouteToCheckout}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {(wallet && wallet.Path1899 ) ? (
                                <TokenDecision passDecisionStatus={setFinalBalance} />
                            ) : (
                                <Onboarding />
                            )}
                        </> 
                    )}  
                </>
            )}  
        </>
    )
};

Wallet.defaultProps = {
    paymentUrl: "",
    paymentRequest: {},
    passLoadingStatus: status => {
        console.log(status);
    },
    onSuccess: link => {
        console.log("onSuccess", link);
    },
    onCancel: status => {
        console.log("onCancel:", status);
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