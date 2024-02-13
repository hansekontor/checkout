import * as React from 'react';
import { notification } from 'antd';
import {
    TokenReceivedNotificationIcon,
} from '@components/Common/CustomIcons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { currency } from '@components/Common/Ticker';

// Success Notifications:

const selfMintTokenNotification = () => {
    notification.success({
        message: 'Success',
        description: (
            <Paragraph>
                Tokens successfully minted!
            </Paragraph>
        ),
        duration: currency.notificationDurationLong,
        style: { borderRadius: '0px' },
    });
};

const sendTokenNotification = link => {
    notification.success({
        message: 'Success',
        description: (
            <a href={link} target="_blank" rel="noopener noreferrer">
                <Paragraph>
                    Transaction successful!
                </Paragraph>
            </a>
        ),
        duration: currency.notificationDurationLong,
        style: { borderRadius: '0px' },
    });
};

const eTokenReceivedNotification = (
    currency,
    receivedSlpTicker,
    receivedSlpQty,
    receivedSlpName,
) => {
    notification.success({
        message: `${currency.tokenTicker} transaction received: ${receivedSlpTicker}`,
        description: (
            <Paragraph>
                You received {receivedSlpQty.toString()} {receivedSlpName}
            </Paragraph>
        ),
        duration: currency.notificationDurationShort,
        style: { width: '100%', borderRadius: '0px' },
    });
};

// Error Notification:

const errorNotification = (error, message, stringDescribingCallEvent) => {
    console.log(error, message, stringDescribingCallEvent);
    notification.error({
        message: 'Error',
        description: message,
        duration: currency.notificationDurationLong,
        style: { borderRadius: '0px' },
    });
};


export {
    sendTokenNotification,
    selfMintTokenNotification,
    eTokenReceivedNotification,
    errorNotification,
};
