import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/link';

export interface Shortened {
	slug: Array<number>;
	url: Array<number>;
}

export interface Deduplicated {
	slug: Array<number>;
	url: Array<number>;
}

