import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import {
    ThemedWalletOutlined,
} from '@components/Common/CustomIcons';
import styled, { css } from 'styled-components';

export const AntdFormCss = css`
    .ant-input-group-addon {
        background-color: ${props =>
            props.theme.forms.addonBackground} !important;
        border: 1px solid ${props => props.theme.forms.border};
        color: ${props => props.theme.forms.addonForeground} !important;
    }
    input.ant-input,
    .ant-select-selection {
        background-color: ${props =>
            props.theme.forms.selectionBackground} !important;
        box-shadow: none !important;
        border-radius: 4px;
        font-weight: bold;
        color: ${props => props.theme.forms.text};
        opacity: 1;
        height: 50px;
    }
    textarea.ant-input,
    .ant-select-selection {
        background-color: ${props =>
            props.theme.forms.selectionBackground} !important;
        box-shadow: none !important;
        border-radius: 4px;
        font-weight: bold;
        color: ${props => props.theme.forms.text};
        opacity: 1;
        height: 50px;
        min-height: 100px;
    }
    .ant-input-affix-wrapper {
        background-color: ${props => props.theme.forms.selectionBackground};
        border: 1px solid ${props => props.theme.wallet.borders.color} !important;
    }
    .ant-select-selector {
        height: 60px !important;
        border: 1px solid ${props => props.theme.wallet.borders.color} !important;
    }
    .ant-form-item-has-error
        > div
        > div.ant-form-item-control-input
        > div
        > span
        > span
        > span.ant-input-affix-wrapper {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-input-affix-wrapper,
    .ant-form-item-has-error .ant-input:hover,
    .ant-form-item-has-error .ant-input-affix-wrapper:hover {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }

    .ant-form-item-has-error
        .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
        .ant-select-selector {
        background-color: ${props => props.theme.forms.selectionBackground};
        border-color: ${props => props.theme.forms.error} !important;
    }
    .ant-select-single .ant-select-selector .ant-select-selection-item,
    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
        line-height: 60px;
        text-align: left;
        color: ${props => props.theme.forms.text};
        font-weight: bold;
    }
    .ant-form-item-has-error .ant-input-group-addon {
        color: ${props => props.theme.forms.error} !important;
        border-color: ${props => props.theme.forms.error} !important;
    }
    .ant-form-item-explain.ant-form-item-explain-error {
        color: ${props => props.theme.forms.error} !important;
    }
`;

export const AntdFormWrapper = styled.div`
    ${AntdFormCss}
`;

export const Bip70AddressSingle = ({
    inputProps,
    ...otherProps
}) => {
    return (
        <AntdFormWrapper>
            <Form.Item {...otherProps}>
                <Input
                    prefix={<ThemedWalletOutlined />}
                    autoComplete="off"
                    readOnly={true}
                    {...inputProps}
                />
            </Form.Item>
        </AntdFormWrapper>
    );
};

Bip70AddressSingle.propTypes = {
    onScan: PropTypes.func,
    loadWithCameraOpen: PropTypes.bool,
    inputProps: PropTypes.object,
};