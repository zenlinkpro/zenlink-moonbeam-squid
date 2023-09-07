import { Big as BigDecimal } from 'big.js'
import { ONE_BD, ZERO_BD } from "../consts"
import { getPair } from "../entities/pair"
import { getOrCreateToken } from "../entities/token"
import { Pair, StableSwap } from "../model"
import { Context, Log } from "../processor"

export const WNATIVE = '0xAcc15dC74880C9944775448304B263D191c6077F'.toLowerCase()
export const USDC = '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b'.toLowerCase()
export const FRAX = '0x322E86852e492a7Ee17f28a78c663da38FB33bfb'.toLowerCase()
export const WNATIVE_USDC = '0x43182F87401cc95904117eB0188E3D0d8ACCA430'.toLowerCase()
export const WNATIVE_FRAX = '0x79c5b0A746fC7B08461BF007281C5f0A313DA692'.toLowerCase()

export const WHITELIST: string[] = [
  '0xAcc15dC74880C9944775448304B263D191c6077F'.toLowerCase(), // wnative
  '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b'.toLowerCase(), // usdc
  '0x322E86852e492a7Ee17f28a78c663da38FB33bfb'.toLowerCase(), // frax
  '0x3Fd9b6C9A24E09F67b7b706d72864aEbb439100C'.toLowerCase(), // zlk
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = new BigDecimal(50)

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = new BigDecimal(5)

export async function getEthPriceInUSD(ctx: Context): Promise<BigDecimal> {
  const usdcPair = await getPair(ctx, WNATIVE_USDC)
  const fraxPair = await getPair(ctx, WNATIVE_FRAX)

  if (fraxPair) {
    return fraxPair.token0.id === FRAX
      ? BigDecimal(fraxPair.token0Price)
      : BigDecimal(fraxPair.token1Price)
  } 
  if (usdcPair) {
    return usdcPair.token0.id === USDC
      ? BigDecimal(usdcPair.token0Price)
      : BigDecimal(usdcPair.token1Price)
  }
  return BigDecimal(0)
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (plus stablecoin estimates)
 * */
export async function findEthPerToken(
  ctx: Context,
  log: Log,
  tokenId: string
): Promise<BigDecimal> {
  if (tokenId === WNATIVE) {
    return ONE_BD
  }

  const whitelistPairs = await ctx.store.find(Pair, {
    where: WHITELIST.map((address) => [
      { token0: { id: address }, token1: { id: tokenId } },
      { token1: { id: address }, token0: { id: tokenId } },
    ]).flat(),
    relations: {
      token0: true,
      token1: true,
    },
  })

  // loop through whitelist and check if paired with any
  for (const pair of whitelistPairs) {
    if (BigDecimal(pair.reserveETH).gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
      if (pair.token0.id === tokenId) {
        const token1 = await getOrCreateToken(ctx, log, pair.token1.id)
        return BigDecimal(pair.token1Price).mul(token1.derivedETH) // return token1 per our token * Eth per token 1
      }
      if (pair.token1.id === tokenId) {
        const token0 = await getOrCreateToken(ctx, log, pair.token0.id)
        return BigDecimal(pair.token0Price).mul(token0.derivedETH) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

export async function findUSDPerToken(
  ctx: Context,
  log: Log,
  tokenId: string
): Promise<BigDecimal> {
  const tokenUSDPrice = (await getEthPriceInUSD(ctx)).mul(await findEthPerToken(ctx, log, tokenId))
  if (tokenUSDPrice.eq(ZERO_BD)) {
    // check for stableSwap lpToken
    const stableSwap = await ctx.store.findOneBy(StableSwap, {
      lpToken: tokenId
    })
    if (stableSwap) {
      const { tokens } = stableSwap
      let USDPrice = BigDecimal('0')
      for (const token of tokens) {
        if (USDPrice.gt(ZERO_BD)) break
        USDPrice = await findUSDPerToken(ctx, log, token)
      }
      return USDPrice
    }
  }
  return tokenUSDPrice
}
