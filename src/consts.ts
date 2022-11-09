import { Big as BigDecimal } from 'big.js'

export const knownContracts: ReadonlyArray<string> = []

export const CHAIN_NODE = 'wss://moonbeam.api.onfinality.io/public-ws'

// need to be lowercase
export const FACTORY_ADDRESS = '0x079710316b06BBB2c0FF4bEFb7D2DaC206c716A0'.toLowerCase()
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const ZERO_BI = 0n
export const ONE_BI = 1n
export const ZERO_BD = BigDecimal(0)
export const ONE_BD = BigDecimal(1)
export const BI_18 = 1000000000000000000n
