import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import styled, { css } from 'styled-components';

export const Bip70AddressSingle = ({
    inputProps,
    ...otherProps
}) => {
    const AntdFormCss = css`
        input.ant-input,
        .ant-select-selection {
            background-color: #ffffff !important;
            box-shadow: none !important;
            border-radius: 4px;
            font-weight: bold;
            color: #000000;
            opacity: 1;
            height: 50px;
        }
        textarea.ant-input,
        .ant-select-selection {
            background-color: #ffffff !important;
            box-shadow: none !important;
            border-radius: 4px;
            font-weight: bold;
            color: #000000;
            opacity: 1;
            height: 50px;
            min-height: 100px;
        }
    `;

    const AntdFormWrapper = styled.div`
        ${AntdFormCss}
    `;  
    return (
        <AntdFormWrapper>
            <Form.Item {...otherProps}>
                <Input
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