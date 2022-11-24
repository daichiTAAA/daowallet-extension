// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CHAIN_NAMESPACES, Maybe, SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { t } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import HeaderWithCancel from '@polkadot/extension-ui/partials/HeaderWithCancel';
import { ThemeProps } from '@polkadot/extension-ui/types';
import { Keyring } from '@polkadot/keyring';

interface Props extends ThemeProps {
  className?: string;
}

function CreateAccountWeb3Auth ({ className }: Props): React.ReactElement {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [userInfo, setUserInfo] = useState<unknown | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const clientId = 'BHV75ODX9QpTBg3yxoQ0MNnTbQ4ksELPEDvkQN_KUAWdFkNdqgzmUZc2p48W1prowdNugWT91_4ydRFFBwap1dE';

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          chainConfig: {
            /*
              you can pass your own  chain configs here
              */
            chainNamespace: CHAIN_NAMESPACES.OTHER,
            displayName: 'Astar',
            ticker: 'ASTR',
            tickerName: 'astar'
          },
          clientId // get it from https://dashboard.web3auth.io
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            clientId, // get it from https://dashboard.web3auth.io
            network: 'testnet',
            uxMode: 'popup'
          }
        });

        web3auth.configureAdapter(openloginAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();

        setProvider(web3auth.provider);
      } catch (error) {
        console.error(error);
      }
    };

    init().then(() => {
      console.log('finish initialize Web3Auth');
    }).catch((error) => {
      console.log(error);
    });
  }, [setProvider, setWeb3auth]);

  const login = useCallback(async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');

      return;
    }

    const web3authProvider = await web3auth.connect();

    setProvider(web3authProvider);
  }, [web3auth]);

  const _getUserInfo = useCallback(() => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');

      return;
    }

    const userInfo = web3auth.getUserInfo();

    setUserInfo(userInfo);

    console.log(userInfo);
  }, [web3auth]);

  const logout = useCallback(() => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      setProvider(null);

      return;
    }

    web3auth.logout().catch((error) => {
      console.log(error);
    });
    setProvider(null);
  }, [web3auth]);

  const createKeyring = (privateKey: string, keyringName: string) => {
    // Create a keyring instance
    const keyring = new Keyring({ type: 'sr25519' });
    const privateKeyWithHex = `0x${privateKey}`;
    const pair = keyring.addFromUri(privateKeyWithHex, { name: keyringName });
    const pairName = String(pair.meta.name);
    const pairPublicKey = String(pair.publicKey);

    const keyringInfo =
      `
      ${pairName}: has address ${pair.address} with publicKey [${pairPublicKey}]
      polkadot address: ${keyring.encodeAddress(pair.publicKey, 0)}
      `
    ;

    console.log(keyringInfo);
  };

  const _getPrivateKey = useCallback(async () => {
    // Assuming user is already logged in.
    let privateKey: Maybe<string> | null;

    if (!provider) {
      console.log('provider not initialized yet');

      return;
    }

    if (!web3auth?.provider) {
      console.log('web3auth not initialized yet');

      return;
    } else {
      privateKey = String(await web3auth.provider.request({
        method: 'private_key'
      }));
      console.log(`private key is: ${privateKey}`);
      setPrivateKey(privateKey);
    }

    // Do something with privateKey
    if (typeof privateKey === 'string') {
      const keyringName = 'testname';

      createKeyring(privateKey, keyringName);
    }
  }, [provider, web3auth?.provider]);

  const loggedInView = (
    <>
      <div className ='content'>
        <button
          className ='btn--orange'
          onClick={_getUserInfo}
        >
          Get User Info
        </button>
        <button
          className = 'btn--orange'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={_getPrivateKey}
        >
          Get Private Key
        </button>
        <button
          className ='btn--orange'
          onClick={logout}
        >
          Log Out
        </button>
      </div>
      {userInfo && userInfo}
      {privateKey && privateKey}
    </>
  );

  const unloggedInView = (
    <>
      <div className='h-4/5'>
        <button
          className = 'btn--orange'
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={login}
        >
        Login
        </button>
      </div>
    </>
  );

  return (
    <>
      <HeaderWithCancel
        step='1'
        text={t<string>('Web3Auth Login')}
      />
      <div className={className}>
        <h1 className='text-3xl font-bold'>
          Hello world!
        </h1>
        <div className='page'>
          {provider ? loggedInView : unloggedInView}
        </div>
      </div>
    </>
  );
}

export default styled(CreateAccountWeb3Auth)(({ theme }: ThemeProps) => [`
  margin-bottom: 21px;

  .header {
    display: flex;
  }

  .page {
    background-color: green;
    height: 500px;
  }

  .btn--orange,
    a.btn--orange {
    text-align: center;
    width: 30%;
    color: #fff;
    background-color: #eb6100;
    z-index: 10000;
    padding: 10px;
    margin: 10px;
    border-radius: 5vh;
  }
  .btn--orange:hover,
    a.btn--orange:hover {
    text-align: center;
    width: 30%;
    color: #fff;
    background: #f56500;
    z-index: 10000;
    padding: 10px;
    margin: 10px;
    border-radius: 5vh;
  } 
`]);
