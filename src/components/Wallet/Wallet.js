import React, { useEffect, useState }  from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import OnBoarding from '@components/OnBoarding/OnBoarding';
import { QRCode } from '@components/Common/QRCode';
import { currency } from '@components/Common/Ticker.js';
import { Link } from 'react-router-dom';
import TokenList from './TokenList';
import TxHistory from './TxHistory';
import ApiError from '@components/Common/ApiError';
import BalanceHeader from '@components/Common/BalanceHeader';
import BalanceHeaderFiat from '@components/Common/BalanceHeaderFiat';
import { LoadingCtn, ZeroBalanceHeader } from '@components/Common/Atoms';
import { getWalletState } from '@utils/cashMethods';
import { getUrlFromQueryString } from '@utils/bip70';
import { getPaymentRequest } from '../../utils/bip70';



const Wallet = ({    
    paymentUrl, 
    paymentRequest = {}, 
    passLoadingStatus, 
    onSuccess, 
    onCancel
}) => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, fiatPrice, apiError, cashtabSettings } = ContextValue;
    const walletState = getWalletState(wallet);
    const { balances, parsedTxHistory, tokens } = walletState;

    const hasHistory = parsedTxHistory && parsedTxHistory.length > 0;

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
                    && 'amount' in paymentRequest && !isPaymentUrl;

    useEffect(() => {
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
            } else {
                prInfo.url = paymentUrl;
                prInfo.type ="etoken";
            }
            console.log("prInfo from props", prInfo);
            return;
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
                        // push('/sendBip70');
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
            {isFinalBalance ? (
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
                            routeToCheckout={setRouteToCheckout}
                        />
                    )}
                </>
            ) : (
                <TokenDecision prInfoFromUrl={prInfoFromUrl} passDecisionStatus={setFinalBalance} />
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