import React, { useEffect } from 'react';
import { CashLoader } from '@components/Common/CustomIcons';
import { AlertMsg } from '@components/Common/Atoms';

const PropsError = ({msg, onCancel}) => {

    // const [errorTimeout, setErrorTimeout] = useState(true);
    useEffect(() => {
        setTimeout(() => onCancel(true), 3000);
    }, []);

    return (
        <>
            <AlertMsg>
                <b>{msg}</b>
                <br /> Returning to Merchant Site...
            </AlertMsg>
            <CashLoader />
        </>
    );
};

export default PropsError;
