import styled from 'styled-components';

export const LoadingCtn = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-direction: column;

    svg {
        width: 50px;
        height: 50px;
        fill: ${props => props.theme.primary};
    }
`;

export const AlertMsg = styled.p`
    color: ${props => props.theme.forms.error} !important;
`;

export const ConvertAmount = styled.div`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: bold;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;
