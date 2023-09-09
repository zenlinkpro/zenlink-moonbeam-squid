import { Big as BigDecimal } from 'big.js'

export const knownContracts: ReadonlyArray<string> = []

export const CHAIN_NODE = process.env.CHAIN_NODE || 'https://moonbeam.api.onfinality.io/public';

// need to be lowercase
export const FACTORY_ADDRESS = '0x079710316b06BBB2c0FF4bEFb7D2DaC206c716A0'.toLowerCase()
export const FOUR_POOL = '0x68bed2c54Fd0e6Eeb70cFA05723EAE7c06805EC5'.toLowerCase()
export const FOUR_POOL_LP = '0xF3821FD2d235eC6C9DB633947A89A16e11a9c1A9'.toLowerCase()
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FARMING_ADDRESS = '0xD6708344553cd975189cf45AAe2AB3cd749661f4'.toLowerCase()

export const ZERO_BI = 0n
export const ONE_BI = 1n
export const ZERO_BD = BigDecimal(0)
export const ONE_BD = BigDecimal(1)
export const BI_18 = 1000000000000000000n
