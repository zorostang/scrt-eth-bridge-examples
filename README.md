# scrt-eth-bridge-examples


Programmatic examples of interacting with smart contract of the bridge. 

In order to support the newest testnets of Secrer Network and Ethereum and to simpify deployment process a simple version of a bridge was also implemented.
Keep noted that the bridge itself is not of production value and is triggered by POST request instead of listening to events on blckchain.

[Public Akash Demo](http://ikge3m8fd9etv4stispqq2djg8.ingress.akh.isotechnics.com)

## Installation:

Rename .env.example to .env and fill the missing variables.


### Docker:

```
docker compose up --build
```


### Locally

Make sure that [Node](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/try/download/community) are both installed and running.

```
npm install
```

#### Development
```npm run dev```

#### Production
```
npm run buiild
node build
```
