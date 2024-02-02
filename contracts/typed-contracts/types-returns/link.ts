import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

export type Mapping = {
	
}

export type Mapping = {
	
}

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export interface SlugCreationMode {
	new ? : Array<number>,
	deduplicateOrNew ? : Array<number>,
	deduplicate ? : null
}

export class SlugCreationModeBuilder {
	static New(value: Array<number>): SlugCreationMode {
		return {
			new: value,
		};
	}
	static DeduplicateOrNew(value: Array<number>): SlugCreationMode {
		return {
			deduplicateOrNew: value,
		};
	}
	static Deduplicate(): SlugCreationMode {
		return {
			deduplicate: null,
		};
	}
}

export interface ShorteningOutcome {
	shortened ? : null,
	deduplicated ? : Array<number>
}

export class ShorteningOutcomeBuilder {
	static Shortened(): ShorteningOutcome {
		return {
			shortened: null,
		};
	}
	static Deduplicated(value: Array<number>): ShorteningOutcome {
		return {
			deduplicated: value,
		};
	}
}

export enum Error {
	slugUnavailable = 'SlugUnavailable',
	slugTooShort = 'SlugTooShort',
	urlNotFound = 'UrlNotFound',
	upgradeDenied = 'UpgradeDenied',
	upgradeFailed = 'UpgradeFailed'
}

export type Hash = string | number[]

