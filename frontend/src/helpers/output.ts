// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// import type { ContractExecResult } from "@polkadot/types/interfaces";
// import type { Registry, TypeDef } from "@polkadot/types/types";
// import type { AbiMessage } from "@polkadot/api-contract/types";
// import { MintingResult } from "../types";

// export function getReturnTypeName(type: TypeDef | null | undefined) {
//   return type?.lookupName || type?.type || "";
// }

// export function getDecodedOutput(
//   result: ContractExecResult["result"],
//   returnType: AbiMessage["returnType"],
//   registry: Registry
// ): MintingResult | undefined {
//   if (result.isOk) {
//     const returnTypeName = getReturnTypeName(returnType);
//     const r = (
//       returnType
//         ? registry
//             .createTypeUnsafe(returnTypeName, [result.asOk.data])
//             .toHuman()
//         : "()"
//     ) as MintingResult;

//     return r;
//   }
//   return undefined;
// }

// export function getDecodedPrice(
//   result: ContractExecResult["result"],
//   returnType: AbiMessage["returnType"],
//   registry: Registry
// ): string {
//   if (result.isOk) {
//     const returnTypeName = getReturnTypeName(returnType);
//     const r = (
//       returnType
//         ? registry
//             .createTypeUnsafe(returnTypeName, [result.asOk.data])
//             .toHuman()
//         : "()"
//     ) as string;

//     type ObjectKey = keyof typeof r;
//     const okKey = 'Ok' as ObjectKey;
//     const p = r[okKey].toString().replace(/,/g, '')
//     return p;
//   }
//   return '0';
// }

// export function getDecodedTokenId(
//   result: ContractExecResult["result"],
//   returnType: AbiMessage["returnType"],
//   registry: Registry
// ): number {
//   if (result.isOk) {
//     const returnTypeName = getReturnTypeName(returnType);
//     const r = (
//       returnType
//         ? registry
//             .createTypeUnsafe(returnTypeName, [result.asOk.data])
//             .toHuman()
//         : 0
//     ) as string;
    
//     type ObjectKey = keyof typeof r;
//     const okKey = 'Ok' as ObjectKey;
//     const p = r[okKey]

//     type ObjectKey2 = keyof typeof p;
//     const okKey2 = 'Ok' as ObjectKey2;
//     const q = p[okKey2] as number
//     return Number(q);
//   }
//   return 0;
// }

// export function checkDecodedOk(
//   result: ContractExecResult["result"],
//   returnType: AbiMessage["returnType"],
//   registry: Registry
// ): string {
//   if (result.isOk) {
//     const returnTypeName = getReturnTypeName(returnType);
//     const r = (
//       returnType
//         ? registry
//             .createTypeUnsafe(returnTypeName, [result.asOk.data])
//             .toHuman()
//         : "()"
//     ) as string;

//     type ObjectKey = keyof typeof r;
//     const okKey = 'Ok' as ObjectKey;
//     const e = r[okKey];
//     type ObjectKeyError = keyof typeof e;
//     const errKey = 'Err' as ObjectKeyError;
//     const f = e[errKey];
//     return f;
//   }
//   return "";
// }