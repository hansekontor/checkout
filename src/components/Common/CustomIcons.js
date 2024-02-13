import * as React from 'react';
import styled from 'styled-components';
import {
    LoadingOutlined
} from '@ant-design/icons';
import { Image } from 'antd';
import { currency } from '@components/Common/Ticker';

export const CashLoadingIcon = <LoadingOutlined className="cashLoadingIcon" />;

export const CashReceivedNotificationIcon = () => (
    <Image height={'33px'} width={'30px'} src={currency.logo} preview={false} />
);
export const TokenReceivedNotificationIcon = () => (
    <Image
        src={currency.tokenLogo}
        height={'33px'}
        width={'30px'}
        preview={false}
    />
);

export const LoadingBlock = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    flex-direction: column;
    svg {
        width: 50px;
        height: 50px;
        fill: #000000;
    }
`;

export const CashLoader = () => (
    <LoadingBlock>
        <LoadingOutlined />
    </LoadingBlock>
);
