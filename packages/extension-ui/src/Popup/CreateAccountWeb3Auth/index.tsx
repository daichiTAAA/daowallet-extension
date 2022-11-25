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
import { waitReady } from '@polkadot/wasm-crypto';

interface Props extends ThemeProps {
  className?: string;
}

function CreateAccountWeb3Auth ({ className }: Props): React.ReactElement {
  const [address, setAddress] = useState<null | string>(null);
  const [publicKey, setPublicKey] = useState<null | Uint8Array>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

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
            redirectUrl: 'chrome-extension://ahepkdolibafbhfmminlgjkaonpakmkf',
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

  const _getPrivateKey = useCallback(async (): Promise<string | undefined | null> => {
    // Assuming user is already logged in.
    let privateKey: Maybe<string> | null;

    if (!provider) {
      console.log('provider not initialized yet');

      return;
    }

    if (!web3auth?.provider) {
      console.log('web3auth not initialized yet');
    } else {
      privateKey = await web3auth.provider.request({
        method: 'private_key'
      });
    }

    return privateKey;
  }, [provider, web3auth?.provider]);

  const createKeyring = useCallback(async (privateKey: string) => {
    await waitReady();

    // Create a keyring instance
    const keyring = new Keyring({ type: 'sr25519' });

    if (typeof privateKey === 'string') {
      const privateKeyWithHex = `0x${privateKey}`;
      const pair = keyring.addFromUri(privateKeyWithHex);

      setPublicKey(pair.publicKey);

      setAddress(pair.address);
    }
  }, []);

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

  const login = useCallback(async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');

      return;
    }

    const web3authProvider = await web3auth.connect();

    setProvider(web3authProvider);

    const privateKey = await _getPrivateKey();

    if (typeof privateKey === 'string') {
      await createKeyring(privateKey);
    }

    // logout();
  }, [createKeyring, web3auth, _getPrivateKey]);

  return (
    <>
      <HeaderWithCancel
        step='1'
        text={t<string>('Web3Auth Login')}
      />
      <div className={className}>
        <div className='page'>
          <div>address: {address}</div>
          <div>publicKey: {publicKey}</div>
          <div className='h-4/5 flex justify-center'>
            <button
              className = 'btn btn--orange text-5xl font-serif'
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={login}
            >
              Login
            </button>
            <button
              className = 'btn btn--orange text-5xl font-serif'
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default styled(CreateAccountWeb3Auth)(() => [`
  margin-bottom: 21px;

  .header {
    display: flex;
  }

  .page {
    height: 400px;
  }

  .btn {
    text-align: center;
    height: 80px;
    width: 30%;
    color: #fff;
    padding: 10px;
    margin: 10px;
    border-radius: 5vh;
  }

  .btn--orange,
    a.btn--orange {
    background-color: #eb6100;
  }
  .btn--orange:hover,
    a.btn--orange:hover {
    background: #f56500;
  } 
`]);
