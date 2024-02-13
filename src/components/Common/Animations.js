import styled, { css } from 'styled-components';

const EnfoldAnimation = css`
    @keyframes enfold {
        0% {
            transform: scaleY(.5);
            transform-origin: 50% 0;
        }
        100% {
            transform: scaleY(1);
            transform-origin: 50% 0;
        }
}`;
export const Enfold = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    width: inherit;
    position: relative;
    top: 270;
    animation: ${props => props.animate ? 'enfold .4s cubic-bezier(0.39, 0.5, 0.5, 1) both' : 'none'};
    ${EnfoldAnimation}
}`;

export const RollupAnimation = css`
        animation: ${props => props.animate ? 'rollup .3s cubic-bezier(0.39, 0.5, 0.5, 1) both' : 'none'};

        @keyframes rollup {
                0% {
                        transform: scaleY(0.4);
                        transform-origin: 0% 100%;
                }
                100% {
                        transform: scaleY(1);
                        transform-origin: 0% 100%;
                }
        }
`;