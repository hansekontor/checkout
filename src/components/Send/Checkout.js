import React, { useState, useEffect, useRef } from 'react';
import { 
    useLocation,
    useHistory
} from 'react-router-dom';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { WalletContext } from '@utils/context';
import {
    Form,
    Modal,
    Spin
} from 'antd';
import { CashLoadingIcon } from '@components/Common/CustomIcons';
import PrimaryButton from '@components/Common/PrimaryButton';
import useBCH from '@hooks/useBCH';
import {
    sendXecNotification,
    sendTokenNotification,
    selfMintTokenNotification,
    errorNotification,
} from '@components/Common/Notifications';
import {
    currency
} from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';
import { 
    getWalletState,
    fromSmallestDenomination
} from '@utils/cashMethods';
import ApiError from '@components/Common/ApiError';
import { formatFiatBalance } from '@utils/validation';
import cashaddr from 'ecashaddrjs';
import { 
    Output,
    Script,
    script
} from '@hansekontor/checkout-components';
const { SLP } = script;
import { U64 } from 'n64';
import CheckOutIcon from "@assets/checkout_icon.svg";
import {
    AuthCodeCtn, AuthCode,
    AuthCodeTextCtn, AuthCodeText, InfoIcon, 
    AuthCodeAmount, 
    AuthCodeDescription, 
    Offer, OfferHeader, OfferName, OfferDescription,
    Fee, FeeLabel, FeeAmount, 
    Total, TotalLabel, TotalAmount,
    TooltipLine, TooltipExpand, TooltipExpandText,
    Invoice, 
    Support,
    Overlay, WidgetContent, WidgetCtn
} from "../../assets/styles/checkout.styles";
import { AcceptHosted, HostedForm } from 'react-acceptjs';
import ProgressDots from '@components/Common/ProgressDots';
import styled, { css } from 'styled-components';
import MerchantSvg from '@assets/merchant_icon.svg';
import Footer from '@components/Common/Footer';
import Agree from '@components/Send/Agree';
import { 
    Header, HeaderTitle,
    Merchant, MerchantName, MerchantTag, MerchantIcon
} from '@components/Common/ContentHeader';
import { Enfold, RollupAnimation } from '@components/Common/Animations';
import InfoPng from '@assets/info_icon.png';
import PaymentForm  from '@components/zoid/payment-form';

const Checkout = ({ 
    prInfoFromUrl,
    onSuccess, 
    onCancel,
    passReceipt, 
    passLoadingStatus
}) => {

    const history = useHistory();
    const ContextValue = React.useContext(WalletContext);
    const location = useLocation();
    const { 
        wallet,
        fiatPrice, 
        apiError, 
        cashtabSettings 
    } = ContextValue;
    const walletState = getWalletState(wallet);
    const { 
        tokens,
        balances
    } = walletState;
    // Modal settings
    // production/sandbox ids must be in that order for isSandbox
    const purchaseTokenIds = [
        '52b12c03466936e7e3b2dcfcff847338c53c611ba8ab74dd8e4dadf7ded12cf6', // production
        '4075459e0ac841f234bc73fc4fe46fe5490be4ed98bc8ca3f9b898443a5a381a' // sandbox
    ];

    const paymentServers = [
        'https://pay.badger.cash/i/'
    ];

    const blankFormData = {
        dirty: true,
        value: '',
        address: '',
    };

    const [formData, setFormData] = useState(blankFormData);
    let tokenFormattedBalance;
    if (formData.token) {
        const token = tokens.find(token => 
            token.tokenId === formData.token.tokenId
        );
        if (token) {
            const tokenBalance = token.balance.toString();
            tokenFormattedBalance = (tokenBalance / (10 ** token.info.decimals))
                .toString();
        } else {
            tokenFormattedBalance = '0';
        }
    }

    const [sendBchAddressError, setSendBchAddressError] = useState(false);
    const [sendBchAmountError, setSendBchAmountError] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker);
    const [progressCount, setProgressCount] = useState(0);

    // Show a confirmation modal on transactions created by populating form from web page button
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [hasAgreed, setHasAgreed] = useState(false);
    const [showHowitworks, setShowHowitworks] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [tokenInfoModal, tokenInfoHolder] = Modal.useModal();
    const [isFirstRendering, setIsFirstRendering] = useState(true);
    const [pay, setPay] = useState(false);

    const [tokensSent, setTokensSent] = useState(null); // null or txid
    const [paymentId, setPaymentId] = useState(null); // paymentId as stored in the BUX db
    const [purchaseTokenAmount, setPurchaseTokenAmount] = useState(0);

    const calculateFiat = (purchaseTokenAmount) => {
        const exchangeAdditionalAmount = (purchaseTokenAmount * .01).toFixed(2); // Exchange rate
        const feeAmount = ((Number(purchaseTokenAmount) + Number(exchangeAdditionalAmount)) * .04).toFixed(2); // Add 4% fee
        const totalAmount = (Number(purchaseTokenAmount) + Number(exchangeAdditionalAmount) + Number(feeAmount)).toFixed(2);



        return {
            exchangeAdditionalAmount,
            feeAmount,
            totalAmount
        }
    };

    const {
        exchangeAdditionalAmount,
        feeAmount,
        totalAmount
    } = calculateFiat(purchaseTokenAmount);



    const isSandbox = purchaseTokenIds.slice(1).includes(formData.token?.tokenId);
    const tokenTypeVersion = 2

    // // Postage Protocol Check (for BURN)
    // const [postageData, setPostageData] = useState(null); // unused
    // const [usePostage, setUsePostage] = useState(false); // unused

    const [uuid, setUuid] = useState(null);

    const [formToken, setFormToken] = useState(null);

    const buildUuid = async (purchaseTokenAmount) => {
        console.log("buildUuid() address", wallet.Path1899.slpAddress);
        if (uuid) {
            // console.log('uuid', uuid);
            return uuid;
        }

        let uuidHex = '01';
        const prUrlArray = prInfoFromUrl.url.split('/');
        const prId = prUrlArray[prUrlArray.length - 1];
        const prUrlIndex = paymentServers.findIndex(server => server === prInfoFromUrl.url.replace(prId, ''));
        if (prUrlIndex < 0) {
            return errorNotification(new Error(), 
                'Invalid payment server', 
                `Fetching invoice: ${prInfoFromUrl.url}`
            );
        }
        uuidHex += `0${prUrlIndex}${Buffer.from(prId, 'utf8').toString('hex')}`;
        // Write amount as Big Endian buffer
        const buf = Buffer.allocUnsafe(4);
        // const buf = Buffer.allocUnsafe(formData.token.decimals);
        buf.writeUInt32BE(purchaseTokenAmount * (10 ** 4), 0); // hardcoded for BUX. fix this
        // buf.writeUInt32BE(purchaseTokenAmount * (10 ** formData.token.decimals), 0);
        // console.log('base token amount uuid hex', buf.toString('hex'))
        uuidHex += buf.toString('hex');
        // fetch address alias
        const aliasUrl = `https://${isSandbox ? 'dev-api.' : ''}bux.digital/v2/addressalias/${wallet.Path1899.slpAddress}`
        const response = await fetch(aliasUrl, {
            method: 'get',
        });

        const alias = (await response.json()).alias;
        uuidHex += alias;
        // add nonce
        const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        uuidHex += genRanHex(2);

        const formattedUuid = `${uuidHex.slice(0, 8)}-${uuidHex.slice(8, 12)}-${uuidHex.slice(12, 16)}-${uuidHex.slice(16, 20)}-${uuidHex.slice(20, 32)}`
        console.log('formattedUuid', formattedUuid);
        setUuid(formattedUuid);

        return formattedUuid;
    }

    const fetchFormToken = async (purchaseAmount) => {
        const tokenUrl = `https://${isSandbox ? 'dev-api.' : ''}bux.digital/v2/authpaymenttoken`;
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usdamount: Number(calculateFiat(purchaseAmount).totalAmount),
                buxamount: purchaseAmount,
                address: wallet.Path1899.slpAddress,
                prurl: prInfoFromUrl.url
            }),
        });
        const token = (await response.json()).token;
        // console.log('token', token)
        return setFormToken(token);
    }

    const handleOk = () => {
        console.log("handleOk() called")
        setIsSending(true);
        send();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const { 
        getBcashRestUrl, 
        sendBip70,
        sendSelfMintV2,
        getPostage, // unused ?
        readAuthCode
    } = useBCH();

    // If the balance has changed, unlock the UI
    // This is redundant, if backend has refreshed in 1.75s timeout below, UI will already be unlocked
    useEffect(() => {
        passLoadingStatus(false);
    }, [balances.totalBalance]);

    useEffect(() => {
        // Check to see if user has sufficient token balance and, if so, redirect to sendBip70
        if (formData.token) {
            const difference = (Number(tokenFormattedBalance) - Number(formData.value))
                .toFixed(formData.token.decimals);
            if (purchaseTokenIds.includes(formData.token?.tokenId)) {
                // Set amount to purchase
                let purchaseAmount = difference < 0 ? Number(formData.value) : 0;
                if (purchaseAmount > 0) {
                    const rounded = Math.ceil(purchaseAmount * 100) / 100;
                    purchaseAmount = rounded < 1 ? 1 : rounded;
                } else {
                    history.push('/wallet/sendbip70');
                }
                setPurchaseTokenAmount(purchaseAmount);
                buildUuid(purchaseAmount);
                fetchFormToken(purchaseAmount);
            }
        }
    }, [tokenFormattedBalance]);

    useEffect(async () => {
        await populateFormsFromPaymentDetails(prInfoFromUrl.paymentDetails);
    }, []);

    useEffect(() => {
        console.log("useEffect firstrender", isFirstRendering, hasAgreed);
        if (isFirstRendering && hasAgreed) {
            console.log("useEffect firstRendering clause")
            setIsFirstRendering(false);
        }
    }, []);

    async function populateFormsFromPaymentDetails(paymentDetails) {
        if (!paymentDetails)
            return;
        const txInfo = {};
        // Define postage object in case of BURN
        let postageObj;
        // Begin parsing BIP70 Payment Request
        if (paymentDetails.type === 'ecash') {
            const address = Script.fromRaw(
                Buffer.from(paymentDetails.outputs[0].script)
            ).getAddress().toString();
            const totalSats = paymentDetails.outputs.reduce((total, output) => {
                return total + output.value
            }, 0);
            txInfo.address = address;
            txInfo.value = fromSmallestDenomination(totalSats);

        } else if (paymentDetails.type === 'etoken') {
            const slpScript = SLP.fromRaw(Buffer.from(
                paymentDetails.outputs[0].script
            ));
            // Be sure it is valid SLP transaction
            if (slpScript.isValidSlp()) {
                const tokenIdBuf = slpScript.getData(4);
                // Handle SEND and BURN
                let tokenAddress;
                let sendRecords;
                if (slpScript.getType() === 'SEND') {
                    const cashAddress = Script.fromRaw(
                        Buffer.from(paymentDetails.outputs[1].script)
                    ).getAddress().toString();
                    const decodedAddress = cashaddr.decode(cashAddress);
                    tokenAddress = cashaddr.encode(
                        'etoken',
                        decodedAddress.type,
                        decodedAddress.hash
                    )
                    sendRecords = slpScript.getRecords(tokenIdBuf);
                } else if (slpScript.getType() === 'BURN') {
                    tokenAddress = '**BURN**'
                    sendRecords = [{
                        value: slpScript.getData(5)
                    }]
                    // Get postage info
                    postageObj = await getPostage(
                        tokenIdBuf.toString('hex')
                    );
                } else {
                    throw new Error(
                        `Unsupported SLP transaction type: ${slpScript.getType()}`
                    );
                }
                // Compute total amount to send
                const totalBase = sendRecords.reduce((total, record) => {
                    return total.add(U64.fromBE(Buffer.from(record.value)));
                }, U64.fromInt(0));
                // console.log('totalBase', totalBase);
                const tokenInfo = await fetch(
                    `${getBcashRestUrl()}/token/${tokenIdBuf.toString('hex')}`
                ).then(res => res.json());

                txInfo.address = tokenAddress;
                const tokenValue = totalBase.toInt() / (10 ** tokenInfo.decimals);
                txInfo.value = `${tokenValue}`;
                txInfo.token = tokenInfo;
            }
        }
        
        setFormData(txInfo);
        if (postageObj) {
            setPostageData(postageObj);
            setUsePostage(true);
        }
    }

    async function handleSendXecError(errorObj, ticker) {
        // Set loading to false here as well, as balance may not change depending on where error occured in try loop
        passLoadingStatus(false);
        let message;

        if (!errorObj.error && !errorObj.message) {
            message = `Transaction failed: no response from ${getBcashRestUrl()}.`;
        } else if (
            /Could not communicate with full node or other external service/.test(
                errorObj.error,
            )
        ) {
            message = 'Could not communicate with API. Please try again.';
        } else if (
            errorObj.error &&
            errorObj.error.includes(
                'too-long-mempool-chain, too many unconfirmed ancestors [limit: 50] (code 64)',
            )
        ) {
            message = `The ${currency.ticker} you are trying to send has too many unconfirmed ancestors to send (limit 50). Sending will be possible after a block confirmation. Try again in about 10 minutes.`;
        } else {
            message =
                errorObj.message || errorObj.error || JSON.stringify(errorObj);
        }

        errorNotification(errorObj, message, `Sending ${ticker}`);
        onCancel(message);
        // passLoadingStatus("An error ocurred. You will be redirected to the merchant.")
        passLoadingStatus("AN ERROR OCURRED. WINDOW CLOSING...");
        await sleep(3000);
        window.close()

    }

    async function send(rawChainTxs, authCodeB64, attempt = 1) {
        setFormData({
            ...formData,
            dirty: false,
        });

        const { paymentDetails, type } = prInfoFromUrl;

        // ensure prInfo exists
        if (!paymentDetails) {
            return;
        }

        // Event("Category", "Action", "Label")
        // Track number of XEC BIP70 transactions
        Event('SendBip70.js', 'SendBip70', type);

        passLoadingStatus("TRANSACTION PROCESSING");

        try {
            // Send transaction
            const { txidStr, link } = await sendBip70(
                wallet,
                paymentDetails,
                currency.defaultFee,
                false, // testOnly
                false, // isPreburn
                rawChainTxs
            );

            const linkParts = link.split('/')
            const sentTxid = linkParts[linkParts.length - 1]
            setTokensSent(sentTxid)
            onSuccess(txidStr, link)            
            passLoadingStatus("TRANSACTION COMPLETE");
            await sleep(3000);
            passLoadingStatus(false);
        } catch (e) {
            console.error(e)
            // Retry send if response is 402 or 404 (mitigates stamp/baton race conditions)
            if ((e.cause.code === 402 || e.cause.code === 404) && attempt < 3) {
                console.log("error", e.cause);
                const nextAttempt = attempt + 1;
                passLoadingStatus(`PAYMENT UNSUCCESSFUL. RETRYING... (${nextAttempt}/3)`);
                await sleep(5000);
                if (authCodeB64)
                    return doSelfMint(authCodeB64, nextAttempt);
                else
                    return send(null, null, nextAttempt)
            } else {
                const ticker = type == 'etoken' ?
                    currency.tokenTicker : currency.ticker;
                handleSendXecError(e, ticker);
            }
        }
        
        // Clear the address field
        setFormData(blankFormData);
        // Manually disable loading
        passLoadingStatus(false);
    }

    const doSelfMint = async (authCodeB64, attempt = 1, rawBurnTx) => {
        console.log("doSelfMint() called")
        setFormData({
            ...formData,
            dirty: false,
        });

        // ensure prInfo exists
        if (!authCodeB64) {
            return;
        }

        // TODO: Handle many different tokens
        const tokenId = Buffer.from(
            formData.token.tokenId,
            'hex'
        );

        // Event("Category", "Action", "Label")
        // Track number of XEC BIP70 transactions
        Event('SelfMint.js', 'SelfMint', authCodeB64);

        passLoadingStatus("MINTING TOKENS");

        // default to always doing a chained mint here, don't show SEND button
        const doChainedMint = true;

        try {
            const { 
                version
            } = readAuthCode(authCodeB64);
            // Send transaction
            let rawMintTx;
            if (version === 2) {
                rawMintTx = await sendSelfMintV2(
                    wallet,
                    authCodeB64,
                    false, // testOnly
                    doChainedMint,
                    rawBurnTx,
                    isSandbox
                );
            } else {
                errorNotification(`unsupported Self-Mint-Token version: ${version}`);
                onCancel(`unsupported Self-Mint-Token version: ${version}`);
                passLoadingStatus("INVALID VERSION. WINDOW CLOSING...")
                await sleep(3000);
                window.close();
            }

            if (doChainedMint)
                return send(
                    [
                        ...rawBurnTx ? [rawBurnTx] : [], 
                        rawMintTx
                    ],
                    authCodeB64,
                    attempt
                )

            // Manually disable loading
            return passLoadingStatus(true);
            // return window.location.reload();
        } catch (e) {
            handleSendXecError(e, authCodeB64);
        }
    }

    const checkSufficientFunds = () => {
        if (formData.token) {
            return Number(tokenFormattedBalance) >= Number(formData.value)
        } else if (formData) {
            return Number(balances.totalBalance) > Number(formData.value)
        }
        return false
    }

    // Display price in USD below input field for send amount, if it can be calculated
    let fiatPriceString = '';
    if (fiatPrice !== null && !isNaN(formData.value)) {
        if (selectedCurrency === currency.ticker) {
            // calculate conversion to fiatPrice
            fiatPriceString = `${(fiatPrice * Number(formData.value)).toFixed(
                2,
            )}`;

            // formats to fiat locale style
            fiatPriceString = formatFiatBalance(Number(fiatPriceString));

            // insert symbol and currency before/after the locale formatted fiat balance
            fiatPriceString = `${
                cashtabSettings
                    ? `${
                          currency.fiatCurrencies[cashtabSettings.fiatCurrency]
                              .symbol
                      } `
                    : '$ '
            } ${fiatPriceString} ${
                cashtabSettings && cashtabSettings.fiatCurrency
                    ? cashtabSettings.fiatCurrency.toUpperCase()
                    : 'USD'
            }`;
        }
    }

    const authorizenetSuccess = async (result) => {
        try {
            console.log('result', result);
            const resultCode = result.messages.resultCode
            console.log('resultCode', resultCode)

            if (resultCode !== 'Ok') {
                console.log(`authorize.net responseCode ${result.responseCode}`)
                passLoadingStatus(false);
                return;
            }

            passLoadingStatus("PROCESSING PAYMENT")
            const tokenUrl = `https://${isSandbox ? 'dev-api.' : ''}bux.digital/v2/authpaymenttransaction`;
            const transResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usdamount: Number(calculateFiat(purchaseTokenAmount).totalAmount),
                    buxamount: purchaseTokenAmount,
                    address: wallet.Path1899.slpAddress,
                    prurl: prInfoFromUrl.url,
                    opaquedata: result.opaqueData,
                    customerinformation: result.customerInformation
                }),
            });
            const transId = (await transResponse.json()).transId;
            // Call your server to save the transaction
            passLoadingStatus("FETCHING AUTHORIZATION CODE");
            let burnTx;
            const response = await fetch(`https://${isSandbox ? 'dev-api.' : ''}bux.digital/v${tokenTypeVersion}/success?paymentId=${result.transId || transId}`, {
                method: 'get',
                headers: {
                    'content-type': 'application/json',
                    // ...(burnTx) && ({'x-split-transaction': burnTx.toString('hex')})
                }
            });
            const data = await response.json();
            setPaymentId(result.transId || transId)
            doSelfMint(data.authcode, 1, burnTx);
        } catch (err) {
            console.log(err);
            const { type } = prInfoFromUrl;
            const ticker = type == 'etoken' ?
                currency.tokenTicker : currency.ticker;
            handleSendXecError(err, ticker);
        }
    }

    const priceApiError = fiatPrice === null && selectedCurrency !== 'XEC';

    const displayBalance = tokenFormattedBalance || balances.totalBalance; // unused
    const displayTicker = formData.token?.ticker || currency.ticker;

     const payButtonStyle = {
        all: 'unset',
        border: 'none',
        color: '#ffffff',
        backgroundColor: '#000000',
        width: '100%',
        padding: '12px 16px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
    };

    const payButtonText = 'Pay now';
    const payFormHeaderText = `Pay $${totalAmount} - Self-mint Authorization Code (${purchaseTokenAmount} ${displayTicker})` // used?   
    const tokenInfoText = `${displayTicker} is a dollar-backed digital currency with greater than 100% reserves in US dollars. One ${displayTicker} is always one USD.`;
    const tokenInfoConfig = {
        content: <p>{tokenInfoText}</p>
    };
    const { invoice, merchant_name, offer_description, offer_name } = prInfoFromUrl.paymentDetails?.merchantDataJson?.ipn_body || {};
    const isStage1 = !checkSufficientFunds() || apiError || sendBchAmountError || sendBchAddressError || !prInfoFromUrl;
    // For making SEND button available // unused
    if (!isStage1) {
        passLoadingStatus(false);
    }

    const CheckoutCtn = styled.div`
        background-color: #f6f6f6;
        display: flex;
        align-items: center;
        position: fixed;
        top: 0;
        flex-direction: column;
        justify-content: center;
        gap: 18px;
        width: inherit;
    `; 
    const Divider = styled.div`
        height: 1px;
        width: 85%;
        background-color: #000000;
    `;
    const AgreeButtonCtn = styled.div`
        height: 120px;
        bottom: 0;
        width: inherit;
        align-items: center;
        background-color: #ffffff !important;
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
        position: fixed;
        padding: 30px;
    `;
    const HostedFormCtn = styled.div`
        width: 85%;
    `;    
    const PaymentFormWidget = PaymentForm.driver('react', {
        React, 
        ReactDOM
    });

    const handleAgree = async () => {
        setProgressCount(1);
        setHasAgreed(true);
        await sleep(500);
        setIsFirstRendering(false);
    }

    const handleTooltipExpand = (type) => {
        setIsFirstRendering(false);
        if (type === "how") {
            if (showHowitworks)
                setShowHowitworks(false)
            else 
                setShowHowitworks(true)
        } else if (type === "help") {
            if (showHelp)
                setShowHelp(false)
            else 
                setShowHelp(true)
        }
    }


    const loadReceipt = (tx_id) => {
        const receiptDetails = {
            displayTicker,
            order_number: paymentId,
            totalAmount,
            tokenAmount: purchaseTokenAmount,
            offer_name,
            merchant_name,
            invoice,
            time_broadcasted: Date.now(),
            tx_id
        };
        passReceipt(receiptDetails);
    }

    useEffect(async () => {
        if (tokensSent) {
            loadReceipt(tokensSent);
            await sleep(1000);
            history.push('/wallet/receipt');
        }
    }, [tokensSent]);

    const PaymentOverlay = styled(Overlay)`
        width: inherit;
        max-width: 480px;
    `;
    const RollupContent = styled(WidgetCtn)`
        ${RollupAnimation}
        div {
            width: inherit;
            height: inherit;
        }
    `;

    const handlePaymentResult = async (result) => {
        try {
            console.log('result', result);
            const resultCode = result.responseCode;
            console.log('resultCode', resultCode)

            if (resultCode !== '1') {
                console.log(`payment widget responseCode ${result.responseCode}`)
                passLoadingStatus(false);
                return;
            }

            passLoadingStatus("PROCESSING PAYMENT")
            // const tokenUrl = `https://${isSandbox ? 'dev-api.' : ''}bux.digital/v2/authpaymenttransaction`;
            // const transResponse = await fetch(tokenUrl, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         usdamount: Number(calculateFiat(purchaseTokenAmount).totalAmount),
            //         buxamount: purchaseTokenAmount,
            //         address: wallet.Path1899.slpAddress,
            //         prurl: prInfoFromUrl.url,
            //         opaquedata: result.opaqueData,
            //         customerinformation: result.customerInformation
            //     }),
            // });
            // const transId = (await transResponse.json()).transId;
            // // Call your server to save the transaction
            // passLoadingStatus("FETCHING AUTHORIZATION CODE");
            // let burnTx;
            // const response = await fetch(`https://${isSandbox ? 'dev-api.' : ''}bux.digital/v${tokenTypeVersion}/success?paymentId=${result.data_order_id || transId}`, {
            //     method: 'get',
            //     headers: {
            //         'content-type': 'application/json',
            //         // ...(burnTx) && ({'x-split-transaction': burnTx.toString('hex')})
            //     }
            // });
            // const data = await response.json();
            // setPaymentId(result.data.order_id || transId)
            // doSelfMint(data.authcode, 1, burnTx);
        } catch (err) {
            console.log(err);
            const { type } = prInfoFromUrl;
            const ticker = type == 'etoken' ?
                currency.tokenTicker : currency.ticker;
            handleSendXecError(err, ticker);
        }
    }

    const handleDemoPayment = async () => {
        passLoadingStatus("PROCESSING PAYMENT");
        await sleep(1000);
        passLoadingStatus("FETCHING AUTHORIZATION CODE");
        await sleep(1000);
        passLoadingStatus("TRANSACTION PROCESSING");
        await sleep(1000);
        passLoadingStatus("TRANSACTION COMPLETE");
        setTokensSent("0".repeat(63));
        await sleep(3000);
        passLoadingStatus(false);
    }

    return (
        <>  
            {tokenInfoHolder}
            {/*add code below for payment widget */}
            {pay && ( 
                <PaymentOverlay>
                    <RollupContent animate={true}>
                        <PaymentFormWidget 
                            amount={totalAmount}
                            sandbox={isSandbox}
                            onResult={handlePaymentResult}
                        />
                    </RollupContent>
                </PaymentOverlay>
            )}
            <CheckoutCtn>            

                {/*<Modal
                    title="Confirm Send"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <p>
                        Are you sure you want to send {formData.value}{' '}
                        {displayTicker} to settle this payment request?
                    </p>
                </Modal>*/}                
                
                <ProgressDots progress={progressCount} />

                {!hasAgreed ? (
                    <>
                        <Agree 
                            offer_name={prInfoFromUrl.paymentDetails?.merchantDataJson?.ipn_body?.offer_name}
                            merchant_name={merchant_name}
                        />
                        <AgreeButtonCtn>
                            <PrimaryButton onClick={() => handleAgree()}>Agree and Continue</PrimaryButton>
                        </AgreeButtonCtn>    
                    </>      
                ) : (
                    <>
                        {!tokensSent && isStage1 && (
                            <>
                                <Enfold animate={isFirstRendering}>
                                    <AuthCodeCtn>
                                        <AuthCode>
                                            <AuthCodeTextCtn>
                                                <AuthCodeText>
                                                    Purchase Auth Code for {purchaseTokenAmount} {displayTicker}
                                                </AuthCodeText>
                                                <InfoIcon src={InfoPng} onClick={() => tokenInfoModal.info(tokenInfoConfig)} />
                                            </AuthCodeTextCtn>
                                            <AuthCodeAmount>${purchaseTokenAmount.toFixed(2)}</AuthCodeAmount>                        
                                        </AuthCode>
                                        <AuthCodeDescription>This will instantly settle this payment request</AuthCodeDescription>
                                    </AuthCodeCtn>
                                    <Offer>
                                        <OfferHeader>
                                            {offer_name &&                    
                                                <OfferName>{offer_name}</OfferName>
                                            }
                                            <Merchant>
                                                <MerchantIcon src={MerchantSvg} />
                                                <MerchantTag>Merchant</MerchantTag>
                                                <MerchantName>{merchant_name}</MerchantName>
                                            </Merchant>                            
                                        </OfferHeader>
                                        {(offer_description || prInfoFromUrl.paymentDetails) && 
                                            <OfferDescription>{offer_description ? offer_description : prInfoFromUrl.paymentDetails.memo}</OfferDescription>
                                        }
                                    </Offer>
                                    <Divider />
                                    <Fee>
                                        <FeeLabel>Processing Fee</FeeLabel>
                                        <FeeAmount>${(Number(exchangeAdditionalAmount) + Number(feeAmount)).toFixed(2)}</FeeAmount>
                                    </Fee>
                                    <Total>
                                        <TotalLabel>Total</TotalLabel>
                                        <TotalAmount>${totalAmount}</TotalAmount>
                                    </Total>
                                    {isStage1 ? (
                                        <>
                                            { hasAgreed && (
                                                <>
                                                    {uuid && formToken ? (
                                                            <>
                                                                <HostedFormCtn>
                                                                    <>
                                                                        {/* <HostedForm 
                                                                            authData={{
                                                                                apiLoginID: isSandbox ? '25W2mLe5' : '469zGVDrekmC',
                                                                                clientKey: isSandbox ? '8TEqfrHqLh4UWqUY8Sf3H8fq5PyczM9gqfV927Rq8Q5eFwVs2P8UYn7H8MK8Fy4T' : '74AUbX9mjmMFFBs38EG8q46dEaxNy9kC6p8rK4f33nw6yGhFn6g62vrX5d2KGAQ8'
                                                                            }} 
                                                                            onSubmit={authorizenetSuccess}
                                                                            environment={isSandbox ? 'SANDBOX' : 'PRODUCTION'}
                                                                            billingAddressOptions={{show: true, required: true}}
                                                                            buttonStyle={payButtonStyle}
                                                                            buttonText={payButtonText}
                                                                            formHeaderText={payFormHeaderText}
                                                                        /> */}
                                                                        {/*use button below for payment widget */}
                                                                        <PrimaryButton onClick={() => handleDemoPayment()}>{payButtonText}</PrimaryButton>
                                                                    </>
                                                                </HostedFormCtn>
                                                            </>
                                                    ) : (
                                                        <>
                                                            {isSending && !tokensSent ? <Spin spinning={true} indicator={CashLoadingIcon}></Spin> :
                                                            /* <PrimaryButton onClick={() => handleOk()}>Send</PrimaryButton>*/<></>}
                                                        </>
                                                        )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isSending && !tokensSent ? <Spin spinning={true} indicator={CashLoadingIcon}></Spin> :
                                            /* <PrimaryButton onClick={() => handleOk()}>Send</PrimaryButton>*/<></>}
                                        </>
                                    )}
                                    <Support>
                                        {showHowitworks ? (
                                            <>
                                                <TooltipLine>
                                                    <TooltipExpand onClick={() => handleTooltipExpand("how")}>- How it works</TooltipExpand>
                                                    {invoice && <Invoice>INVOICE {invoice}</Invoice>}    
                                                </TooltipLine>
                                                <TooltipLine>
                                                    <TooltipExpandText>
                                                        Get immediate access to the offer with our unique Authorization Code. 
                                                        Upon purchase, the wallet behind this checkout will receive this Code and use it to build and broadcast the transaction to the merchant. 
                                                        Each code is unique and can only be used once.
                                                    </TooltipExpandText>
                                                </TooltipLine>                                
                                            </>
                                        ) : (
                                            <>
                                                <TooltipLine>
                                                    <TooltipExpand onClick={() => handleTooltipExpand("how")}>+ How it works</TooltipExpand>
                                                    {invoice && <Invoice>INVOICE {invoice}</Invoice>}    
                                                </TooltipLine>
                                        </>
                                        )}
                                        {/*showHelp ? (
                                            <>
                                                <TooltipLine>
                                                    <TooltipExpand onClick={() => handleTooltipExpand("help")}>- Need help?</TooltipExpand>
                                                </TooltipLine>
                                                <TooltipLine>
                                                    <TooltipExpand>Help Text Placeholder.</TooltipExpand>
                                                </TooltipLine>           
                                            </>
                                        ) : (
                                            <>
                                                <TooltipLine>
                                                    <TooltipExpand onClick={() => handleTooltipExpand("help")}>+ Need help?</TooltipExpand>
                                                </TooltipLine>                               
                                            </>
                                        )*/}
                                    </Support>
                                </Enfold>      
                            </>              
                        )}                 
                    </>         
                )}

                {apiError && <ApiError />}

            </CheckoutCtn>
            {hasAgreed && <Footer />}
        </>
    );
};

Checkout.defaultProps = {
    passLoadingStatus: status => {
        console.log(status);
    },
    onSuccess: link => {
        console.log("onSuccess", id, link);
    },
    onCancel: status => {
        console.log("onCancel:", status);
    }
};

Checkout.propTypes = {
    prInfoFromUrl: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    passLoadingStatus: PropTypes.func
};

export default Checkout;
