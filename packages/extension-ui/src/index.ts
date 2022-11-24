// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/types-augment';

import { install } from '@twind/core';

import config from './twind.config';

// activate twind - must be called at least once
install(config);

export { default as createView } from './createView';
export { default as Popup } from './Popup';
