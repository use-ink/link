/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { GasLimit, GasLimitAndRequiredValue } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/link';
import type BN from 'bn.js';
import type { ApiPromise } from '@polkadot/api';



export default class Methods {
	readonly __nativeContract : ContractPromise;
	readonly __apiPromise: ApiPromise;

	constructor(
		nativeContract : ContractPromise,
		apiPromise: ApiPromise,
	) {
		this.__nativeContract = nativeContract;
		this.__apiPromise = apiPromise;
	}
	/**
	 * shorten
	 *
	 * @param { ArgumentTypes.SlugCreationMode } slug,
	 * @param { Array<(number | string | BN)> } url,
	*/
	"shorten" (
		slug: ArgumentTypes.SlugCreationMode,
		url: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "shorten", [slug, url], __options);
	}

	/**
	 * resolve
	 *
	 * @param { Array<(number | string | BN)> } slug,
	*/
	"resolve" (
		slug: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "resolve", [slug], __options);
	}

	/**
	 * upgrade
	 *
	 * @param { ArgumentTypes.Hash } codeHash,
	*/
	"upgrade" (
		codeHash: ArgumentTypes.Hash,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "upgrade", [codeHash], __options);
	}

}