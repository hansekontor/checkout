import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckSvg from '@assets/check_icon.svg';

// remove text when checked?

const Stages = styled.div`
    align-items: flex-start;
    display: flex;
    justify-content: center;
    position: relative;
    width: 270px;
    margin: 20px auto;
    padding:0;
    top: 0;
`;
const Stage = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 28px;
    white-space: nowrap;
    width; fit-content;
`;
const StageButton = styled.button`
    all: unset;
    box-sizing: border-box;
    height: 28px;
    border-radius: 14px;
    position: relative;
    width: 28px;
    background-color: ${ props => props.active ? '#000000' : '#ffffff'};
    
`;
const StageNumberCtn = styled.div`
    text-align: center;
    border-radius: 14px;
    height: 28px;
    position: relative;
    width: 28px;
    position: relative;
    text-align: center;
`;
const StageNumber = styled.div`
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    position: relative;
    font-family: "Inter-Medium", Helvetica;
    padding-top: 5px;
    color: ${ props => props.active ? '#ffffff' : '#a8a8a8'};
`;
const StageChecked = styled.img`
    position: relative; 
    padding-top: 4px;
    padding-left: 1px;
`;
const StageText = styled.div`
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0; 
    line-height: 14px;
    position: relative; 
    text-align: center;
    width: fit-content;
    color: #858585;
    top: 5px;
`;
const StageLine = styled.div`
    height: 1px;
    position: relative;
    width: 120px;
    background-color: #dedede;
    top: 14px;
`;
const StageLineActive = styled(StageLine)`
    background-color: #000000;
`;
const ProgressDots = ({progress}) => {
    return (
        <Stages>                
            {progress > 0 ? (
                <>
                    <Stage>
                        <StageButton active={true}>
                            <StageNumberCtn>
                                <StageChecked src={CheckSvg} />
                            </StageNumberCtn>
                        </StageButton>
                        {/* <StageText>Agree</StageText> */}
                    </Stage>       

                    <StageLineActive />

                    {progress > 1 ? (
                        <>
                            <Stage>
                                <StageButton active={true}>
                                    <StageNumberCtn>
                                        <StageChecked src={CheckSvg} />
                                    </StageNumberCtn>
                                </StageButton>
                                {/* <StageText>Pay</StageText>               */}
                            </Stage>  
                            
                            <StageLineActive />

                            <Stage>
                                <StageButton active={true}>
                                    <StageNumberCtn>
                                        <StageChecked src={CheckSvg}/>
                                    </StageNumberCtn>
                                </StageButton>
                                {/* <StageText>Receipt</StageText>             */}
                            </Stage>    
                        </>                              
                    ) : (
                        <>
                            <Stage>
                                <StageButton active={true}>
                                    <StageNumberCtn>
                                        <StageNumber active={true}>2</StageNumber>
                                    </StageNumberCtn>
                                </StageButton>
                                <StageText>Pay</StageText>              
                            </Stage> 

                            <StageLine />

                            <Stage>
                                <StageButton>
                                    <StageNumberCtn>
                                        <StageNumber>3</StageNumber>
                                    </StageNumberCtn>
                                </StageButton>
                                <StageText>Receipt</StageText>            
                            </Stage>  
                        </>
                    )}
                </>
            ) : (       
                <>
                    <Stage>
                        <StageButton active={true}>
                            <StageNumberCtn>
                                <StageNumber active={true}>1</StageNumber>
                            </StageNumberCtn>
                        </StageButton>
                        <StageText>Agree</StageText>
                    </Stage>  

                    <StageLine />                    
                    
                    <Stage>
                        <StageButton>
                            <StageNumberCtn>
                                <StageNumber>2</StageNumber>
                            </StageNumberCtn>
                        </StageButton>
                        <StageText>Pay</StageText>              
                    </Stage>    

                    <StageLine />          

                    <Stage>
                        <StageButton>
                            <StageNumberCtn>
                                <StageNumber>3</StageNumber>
                            </StageNumberCtn>
                        </StageButton>
                        <StageText>Receipt</StageText>            
                    </Stage>                     
                </>                 
            )}
        </Stages>
    )
};

export default ProgressDots;