// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IonButton, IonContent, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { CHAIN_NAMESPACES, Maybe, SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Keyring } from '@polkadot/keyring';

const styles = {
  card: 'mt-2 col-span-8 col-start-3'
};

function CreateAccountWeb3Auth (): React.ReactElement {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  const clientId = 'BHV75ODX9QpTBg3yxoQ0MNnTbQ4ksELPEDvkQN_KUAWdFkNdqgzmUZc2p48W1prowdNugWT91_4ydRFFBwap1dE';

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          chainConfig: {
            /*
              you can pass your own chain configs here
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

    const user = web3auth.getUserInfo();

    console.log(user);
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

    console.log(
      `
      ${pairName}: has address ${pair.address} with publicKey [${pairPublicKey}]
      polkadot address: ${keyring.encodeAddress(pair.publicKey, 0)}
      `
    );
  };

  const _getPrivateKey = useCallback(() => {
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
      privateKey = String(web3auth.provider.request({
        method: 'private_key'
      }));
      console.log(`private key is: ${privateKey}`);
    }

    // Do something with privateKey
    if (typeof privateKey === 'string') {
      const keyringName = 'testname';

      createKeyring(privateKey, keyringName);
    }
  }, [provider, web3auth?.provider]);

  const loggedInView = (
    <>
      <IonRow className='grid grid-cols-12'>
        <IonButton
          className={styles.card}
          onClick={_getUserInfo}
        >
          Get User Info
        </IonButton>
        <IonButton
          className={styles.card}
          onClick={_getPrivateKey}
        >
          Get Private Key
        </IonButton>
        <IonButton
          className={styles.card}
          onClick={logout}
        >
          Log Out
        </IonButton>
      </IonRow>
    </>
  );

  const unloggedInView = (
    <IonRow className='grid grid-cols-12'>
      <IonButton
        className='mt-10 col-span-8 col-start-3'
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={login}
      >
        Login
      </IonButton>
    </IonRow>
  );

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {provider ? loggedInView : unloggedInView}
        </IonContent>
      </IonPage>
    </>
  );
}

export default styled(CreateAccountWeb3Auth)`
  margin-bottom: 16px;

  label::after {
    right: 36px;
  }
`;
