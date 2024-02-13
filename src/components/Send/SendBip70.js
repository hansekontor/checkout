import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { WalletContext } from '@utils/context';
import { Bip70AddressSingle } from '@components/Common/EnhancedInputs';
import {
    Form,
    Modal
} from 'antd';
import useBCH from '@hooks/useBCH';
import {
    sendTokenNotification,
    errorNotification,
} from '@components/Common/Notifications';
import {
    currency
} from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';
import {
    ConvertAmount,
    AlertMsg,
} from '@components/Common/Atoms'; // unused
import { 
    getWalletState,
    fromSmallestDenomination
} from '@utils/cashMethods';
import ApiError from '@components/Common/ApiError';
import { formatFiatBalance } from '@utils/validation';
import cashaddr from 'ecashaddrjs';
import { 
    Script,
    script
} from '@hansekontor/checkout-components';
const { SLP } = script;
import { U64 } from 'n64';
import {
    AuthCodeCtn, AuthCode,
    AuthCodeTextCtn, AuthCodeText, InfoIcon, 
    AuthCodeDescription, 
    Offer, OfferHeader, OfferName, OfferDescription,
    Fee, FeeLabel, FeeAmount, 
    TooltipLine, TooltipExpand, 
    Invoice, 
    Support
} from "../../assets/styles/checkout.styles";
import { InfoCircleOutlined } from '@ant-design/icons';
import { 
    Merchant, MerchantName, MerchantTag, MerchantIcon
} from '@components/Common/ContentHeader';
import styled from 'styled-components';
import ProgressDots from '@components/Common/ProgressDots';
import MerchantSvg from '@assets/merchant_icon.svg';
import PrimaryButton from '@components/Common/PrimaryButton';
const Balance = styled(Fee)``;
const BalanceLabel = styled(FeeLabel)``;
const BalanceAmount = styled(FeeAmount)``;
const Divider = styled.div`
    height: 1px;
    width: 85%;
    background-color: #000000;
`;

const SendBip70 = ({                                     
    prInfoFromUrl,
    onSuccess, 
    onCancel, 
    passReceipt, 
    passLoadingStatus
 }) => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, fiatPrice, apiError, cashtabSettings } = ContextValue;
    const walletState = getWalletState(wallet);
    const { 
        tokens,
        balances
    } = walletState;
    // Modal settings
    const purchaseTokenIds = [
        '4075459e0ac841f234bc73fc4fe46fe5490be4ed98bc8ca3f9b898443a5a381a'
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
    const [sendBchAddressError, setSendBchAddressError] = useState(false); // unused
    const [sendBchAmountError, setSendBchAmountError] = useState(false); // unused
    const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker); // unused

    // Show a confirmation modal on transactions created by populating form from web page button
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Show a purchase modal when BUX is requested and insufficient balance
    const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
    const [purchaseTokenAmount, setPurchaseTokenAmount] = useState(0);

    const [showHowitworks, setShowHowitworks] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Postage Protocol Check (for BURN)
    const [postageData, setPostageData] = useState(null); // unused
    const [usePostage, setUsePostage] = useState(false); // unused

    const history = useHistory();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        send();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handlePurchaseOk = () => {
        setIsPurchaseModalVisible(false);
        history.push('/wallet/checkout');
    };

    const handlePurchaseCancel = () => {
        setIsPurchaseModalVisible(false);
        onCancel("user canceled payment");
        sleep(1000);
        window.close();
    };

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const { 
        getBcashRestUrl, 
        sendBip70,
        getPostage 
    } = useBCH();

    // If the balance has changed, unlock the UI
    // This is redundant, if backend has refreshed in 1.75s timeout below, UI will already be unlocked
    useEffect(() => {
        passLoadingStatus(false);
    }, [balances.totalBalance]);

    useEffect(() => {
        // Check to see if purchase modal should be shown
        if (formData.token) {
            const difference = (Number(tokenFormattedBalance) - Number(formData.value))
                .toFixed(formData.token.decimals);
            if (purchaseTokenIds.includes(formData.token?.tokenId)) {
                if (difference < 0 && formData.address != '**BURN**') 
                    history.push("/wallet/checkout");
                    return;
            }
        }
    }, [tokenFormattedBalance]);

    useEffect(async () => {
        await populateFormsFromPaymentDetails(prInfoFromUrl.paymentDetails);
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
                    // Check to see if should be forwarded to checkout/purchase
                    if (formData.token) {
                        const difference = (Number(tokenFormattedBalance) - Number(formData.value))
                            .toFixed(formData.token.decimals);
                        if (purchaseTokenIds.includes(formData.token?.tokenId)) {
                            if (difference < 0) 
                                history.push("/wallet/checkout");
                                return;
                        }
                    }
                    // Fill in values
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
                console.log('totalBase', totalBase);
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
        await sleep(5000)
        window.close()
    }

    async function send() {
        setFormData({
            ...formData,
            dirty: false,
        });

        const { paymentDetails, type } = prInfoFromUrl;

        // ensure prInfo exists
        if (!paymentDetails) {
            return;
        }

        // Track number of XEC BIP70 transactions
        Event('SendBip70.js', 'SendBip70', type);

        passLoadingStatus("SENDING TRANSACTION");

        try {
            // Send transaction
            const { txidStr, link } = await sendBip70(
                wallet,
                paymentDetails,
                currency.defaultFee,
                false // testOnly
            );
            sendTokenNotification(link);
            
            onSuccess(txidStr, link);
            passLoadingStatus("SENDING COMPLETE");
            loadReceipt(txidStr);
            await sleep(1000);
            passLoadingStatus(false);

            history.push("/wallet/receipt");
        } catch (e) {
            const ticker = type == 'etoken' ?
                currency.tokenTicker : currency.ticker;
            handleSendXecError(e, ticker);
        }
        
        // Clear the address field
        setFormData(blankFormData);
        // Manually disable loading
        passLoadingStatus(false);
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
        } else {
            fiatPriceString = `${
                formData.value
                    ? formatFiatBalance(
                          Number(fiatToCrypto(formData.value, fiatPrice)),
                      )
                    : formatFiatBalance(0)
            } ${currency.ticker}`;
        }
    }

    const priceApiError = fiatPrice === null && selectedCurrency !== 'XEC';
    console.log("priceApiError", priceApiError);

    const displayBalance = tokenFormattedBalance || balances.totalBalance;
    const displayTicker = formData.token?.ticker || currency.ticker;

	const { invoice, merchant_name, offer_description, offer_name } =
		prInfoFromUrl.paymentDetails?.merchantDataJson?.ipn_body || {};

    const handleTooltipExpand = (type) => {
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
        console.log("formData.value", formData.value);
        const receiptDetails = {
            displayTicker,
            tokenAmount: formData.value,
            offer_name,
            merchant_name, 
            invoice, 
            time_broadcasted: Date.now(),
            tx_id
        };
        passReceipt(receiptDetails)
    }
    const SendBip70Ctn = styled.div`
        background-color: #f6f6f6;
        display: flex;
        align-items: center;
        min-height: 475px;
        position: fixed;
        top: 0;
        width: inherit;
        flex-direction: column;
        justify-content: center;
        gap: 18px;
    `; 
    const CustomForm = styled(Form)`
        width: 85%;
    `;

    return (
        <SendBip70Ctn>
            <>
                {checkSufficientFunds() && ( 
                    <>
                        <Modal
                            title="Confirm Send"
                            visible={isModalVisible}
                            onOk={handleOk}
                            onCancel={handleCancel}
                        >
                            <p>
                                Are you sure you want to send {formData.value}{' '}
                                {displayTicker} to settle this payment request?
                            </p>
                        </Modal>
                        <Modal
                            title={`Purchase ${displayTicker}`}
                            visible={isPurchaseModalVisible}
                            onOk={handlePurchaseOk}
                            onCancel={handlePurchaseCancel}
                        >
                            <p>
                                You have insufficient funds. Do you want to purchase {' '}
                                <strong>{purchaseTokenAmount}{' '}{displayTicker}{' '}</strong>
                                in order to be able to settle this payment request?
                            </p>
                        </Modal>            
                        
                        <ProgressDots progress={1} />
                        <Balance>
                            <BalanceLabel>Current Balance</BalanceLabel>
                            <BalanceAmount>{displayBalance} {displayTicker}</BalanceAmount>
                        </Balance>            
                        <AuthCodeCtn>
                            <AuthCode>
                                <AuthCodeTextCtn>
                                    <AuthCodeText>
                                        Ready to send {formData.value}{' '}{displayTicker}
                                    </AuthCodeText>
                                    <InfoIcon src={InfoCircleOutlined} />
                                </AuthCodeTextCtn>
                            </AuthCode>
                            <AuthCodeDescription>to fulfill this Payment Request</AuthCodeDescription>
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
                            {(offer_description || prInfoFromUrl?.paymentDetails) && 
                                <OfferDescription>{offer_description ? offer_description : prInfoFromUrl.paymentDetails.memo}</OfferDescription>
                            }
                        </Offer> 
                        <Divider />   

                        <CustomForm>
                            {prInfoFromUrl && prInfoFromUrl.paymentDetails && (
                                <>
                                    <Bip70AddressSingle
                                        validateStatus={sendBchAddressError ? "error" : ""}
                                        help={sendBchAddressError ? sendBchAddressError : ""}
                                        inputProps={{
                                            placeholder: `${currency.ticker} Address`,
                                            name: "address",
                                            required: true,
                                            value: formData.address,
                                        }}
                                    ></Bip70AddressSingle>

                                    {!formData.token && priceApiError && (
                                        <AlertMsg>
                                            Error fetching fiat price. Setting send by{" "}
                                            {currency.fiatCurrencies[cashtabSettings.fiatCurrency].slug.toUpperCase()} disabled
                                        </AlertMsg>
                                    )}
                                    {!formData.token && (
                                        <ConvertAmount>
                                            {fiatPriceString !== "" && "="} {fiatPriceString}
                                        </ConvertAmount> 
                                    )}
                                </>
                            )}


                            <div>
                                {!checkSufficientFunds() ||
                                apiError ||
                                sendBchAmountError ||
                                sendBchAddressError ||
                                !prInfoFromUrl ? (
                                    <PrimaryButton>Awaiting Details...</PrimaryButton>
                                ) : (
                                    <PrimaryButton onClick={() => showModal()}>Send</PrimaryButton>
                                )}
                            </div> 
                            {apiError && <ApiError />}
                        </CustomForm> 
                        <Support>
                        {showHowitworks ? (
                            <>
                                <TooltipLine>
                                    <TooltipExpand onClick={() => handleTooltipExpand("how")}>- How it works</TooltipExpand>
                                    {invoice && <Invoice>INVOICE {invoice}</Invoice>}    
                                </TooltipLine>
                                <TooltipLine>
                                    <TooltipExpand>
                                        You already have enough tokens and do not need an Authorization Code. 
                                        Upon sending, the wallet behind this checkout will build and broadcast the transaction to the merchant. 
                                    </TooltipExpand>
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
                    </>               
                )}
            </>
        </SendBip70Ctn>
    
    );
};

SendBip70.defaultProps = {
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

SendBip70.propTypes = {
    prInfoFromUrl: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    passReceipt: PropTypes.func,
    passLoadingStatus: PropTypes.func,
};

export default SendBip70;
