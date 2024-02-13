import styled from 'styled-components';
import { Collapse } from 'antd';

export const StyledCollapse = styled(Collapse)`
    background: #ffffff !important;
    border: 1px solid #eaedf3 !important;

    .ant-collapse-content {
        border: 1px solid #eaedf3;
        border-top: none;
    }

    .ant-collapse-item {
        border-bottom: none !important;
    }

    *:not(button) {
        color: #3e3f42 !important;
    }
`;
