# Cashtab

## Self Mint Checkout

![CashAppHome](./screenshots/ss-readme.png)

## Features

-   [BIP70](https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki) and [Simple Ledger Payment Protocol](https://github.com/simpleledger/slp-specifications/blob/master/slp-payment-protocol.md) Support
-   [Simple Ledger Postage Protocol](https://github.com/simpleledger/slp-specifications/blob/master/slp-postage-protocol.md) Support
-   [Simple Ledger Self Mint Token](https://github.com/badger-cash/slp-self-mint-protocol/blob/master/selfmint-specification.md) Support
-   [SLP Token Type 1 Burn](https://github.com/badger-cash/slp-self-mint-protocol/blob/master/token-type1-burn.md) Support

## Development

```
yarn install
yarn start
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Production

In the project directory, run:

```
yarn run build
```

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Implementation
Include the following script:
```html
<script type="text/javascript" src="https://domain/checkout-v0.1.js"></script>
```

To render the checkout popup, run the following script with a valid paymentUrl. Modify the callback functions to your needs. Success callback has the final transaction id as input.

```html
<script>
    Checkout({ 
        paymentUrl: "https://pay.badger.cash/i/KP4E9",
        onSuccess: function(link) {
            console.log("Success, link:", link);
        },
        onCancel: function() {
            console.log("payment canceled");
        }
    }).render();
</script>
```