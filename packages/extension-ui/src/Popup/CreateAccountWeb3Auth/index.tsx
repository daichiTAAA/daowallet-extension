// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CHAIN_NAMESPACES, Maybe, SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { AccountNamePasswordCreation } from '@polkadot/extension-ui/components';
import Loading from '@polkadot/extension-ui/components/Loading';
import useTranslation from '@polkadot/extension-ui/hooks/useTranslation';
import { jsonRestore } from '@polkadot/extension-ui/messaging';
import HeaderWithSteps from '@polkadot/extension-ui/partials/HeaderWithSteps';
import { ThemeProps } from '@polkadot/extension-ui/types';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { waitReady } from '@polkadot/wasm-crypto';

import { ActionContext } from '../../components';

interface Props extends ThemeProps {
  className?: string;
}

function CreateAccountWeb3Auth ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [step, setStep] = useState(1);
  const [pair, setPair] = useState<KeyringPair | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [, setName] = useState('');

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

  const _getPrivateKey = useCallback(async (): Promise<string | undefined | null> => {
    // Assuming user is already logged in.
    let privateKey: Maybe<string> | null;

    if (!provider) {
      console.log('getPrivateKey: provider not initialized yet');

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

  const createKeypairJson = useCallback(async (privateKey: string, name: string, password: string): Promise<KeyringPair$Json | null> => {
    await waitReady();

    // Create a keyring instance
    const keyring = new Keyring({ type: 'sr25519' });

    if (typeof privateKey === 'string') {
      const privateKeyWithHex = `0x${privateKey}`;
      const pair = keyring.addFromUri(privateKeyWithHex, { name });

      const keypairJson = pair.toJson(password);

      return keypairJson;
    }

    return null;
  }, []);

  const login = useCallback(async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');

      return;
    }

    const web3authProvider = await web3auth.connect();

    setProvider(web3authProvider);
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

  const _onNextStep = useCallback(
    () => setStep((step) => step + 1),
    []
  );

  const _onPreviousStep = useCallback(
    () => setStep((step) => step - 1),
    []
  );

  const _onCreate = useCallback(
    async (name: string, password: string): Promise<void> => {
      setIsBusy(true);
      const privateKey = await _getPrivateKey();

      if (privateKey && name && password) {
        try {
          const keyepairJson = await createKeypairJson(privateKey, name, password);

          if (keyepairJson) {
            try {
              await jsonRestore(keyepairJson, password);
            } catch (error) {
              console.error(error);
            }

            onAction('/');
          }
        } catch (error) {
          console.error(error);
        }
      }

      setPair(null);
      setIsBusy(false);
    },
    [_getPrivateKey, createKeypairJson, onAction]
  );

  const LoggedinView =
  (<>
    <button
      className = 'btn btn--orange text-3xl font-serif'
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={_onNextStep}
    >
      makeAccount
    </button>
    <button
      className = 'btn btn--orange text-3xl font-serif'
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={logout}
    >
      Logout
    </button>
  </>
  );

  const UnloggedinView = (
    <button
      className = 'btn btn--orange text-3xl font-serif'
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={login}
    >
      Login
    </button>
  )
  ;

  return (
    <>
      <HeaderWithSteps
        step={step}
        text={t<string>('Create an account')}
      />
      <Loading>
        <div>
          {`provider setting is: ${String(provider !== null)}`}
        </div>
        <div>
          pair is: {!!pair}
        </div>
        {step === 1 &&
        <>
          <div className={className}>
            <div className='page flex flex-col justify-center items-center'>
              {(provider === null)
                ? UnloggedinView
                : LoggedinView
              }
            </div>
          </div>
        </>}
        {step === 2 &&
                 (
                   <>
                     <AccountNamePasswordCreation
                       buttonLabel={t<string>('Add the account with the generated seed')}
                       isBusy={isBusy}
                       onBackClick={_onPreviousStep}
                       onCreate={_onCreate}
                       onNameChange={setName}
                     />
                   </>
                 )
        }
      </Loading>
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
    margin-left: 0px;
    margin-right: 0px;
  }

  .btn {
    text-align: center;
    height: 80px;
    width: 60%;
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
