import type BN from 'bn.js';

export type Mapping = {
	
}

export type Mapping = {
	
}

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export interface SlugCreationMode {
	new ? : Array<(number | string | BN)>,
	deduplicateOrNew ? : Array<(number | string | BN)>,
	deduplicate ? : null
}

export class SlugCreationModeBuilder {
	static New(value: Array<(number | string | BN)>): SlugCreationMode {
		return {
			new: value,
		};
	}
	static DeduplicateOrNew(value: Array<(number | string | BN)>): SlugCreationMode {
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
	deduplicated ? : Array<(number | string | BN)>
}

export class ShorteningOutcomeBuilder {
	static Shortened(): ShorteningOutcome {
		return {
			shortened: null,
		};
	}
	static Deduplicated(value: Array<(number | string | BN)>): ShorteningOutcome {
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

