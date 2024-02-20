import * as zoid from 'zoid/dist/zoid.frameworks.min.js';

let PaymentForm = zoid.create({
    tag: 'payment-form-widget',
    url: 'http://localhost:8000/',
    dimensions: {
        width: "100%", 
        height: "100%",
    },
    autoResize: false,
});

export default PaymentForm;