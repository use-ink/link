export type ShorteningOutcome =
  | "Shortened"
  | { Deduplicated: { slug: string } };

export enum LinkContractError {
  SlugTooShort = 'SlugTooShort', 
  SlugUnavailable = 'SlugUnavailable', 
  UpgradeDenied = 'UpgradeDenied',
  UpgradeFailed = 'UpgradeFailed',
  UrlNotFound = 'UrlNotFound', 
}
export type ShorteningResult = ShorteningOutcome | LinkContractError;

export type ResolvedUrl = string;