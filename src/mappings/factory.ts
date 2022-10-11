import { EvmLogHandlerContext } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { Bundle, Factory, Pair } from "../model";
import * as factoryAbi from '../abis/factory'
import { ZERO_BD } from "../consts";
import { getOrCreateToken } from "../entities/token";

export async function handleNewPair(ctx: EvmLogHandlerContext<Store>) {
  const evmLogArgs = ctx.event.args.log || ctx.event.args;
  const contractAddress = evmLogArgs.address.toLowerCase()

  const data = factoryAbi.events['PairCreated(address,address,address,uint256)']
    .decode(evmLogArgs)

  // load factory (create if first exchange)
  let factory = await ctx.store.get(Factory, contractAddress)
  if (!factory) {
    factory = new Factory({
      id: contractAddress,
      pairCount: 0,
      totalVolumeETH: ZERO_BD.toFixed(6),
      totalLiquidityETH: ZERO_BD.toFixed(6),
      totalVolumeUSD: ZERO_BD.toFixed(6),
      untrackedVolumeUSD: ZERO_BD.toFixed(6),
      totalLiquidityUSD: ZERO_BD.toFixed(6),
      txCount: 0,
    })

    // create new bundle
    const bundle = new Bundle({
      id: '1',
      ethPrice: ZERO_BD.toFixed(6),
    })
    await ctx.store.save(bundle)
  }
  factory.pairCount += 1
  await ctx.store.save(factory)

  // create the tokens
  const token0 = await getOrCreateToken(ctx, data.token0.toLowerCase())
  const token1 = await getOrCreateToken(ctx, data.token1.toLowerCase())

  const pair = new Pair({
    id: data.pair.toLowerCase(),
    token0,
    token1,
    liquidityProviderCount: 0,
    createdAtTimestamp: new Date(ctx.block.timestamp),
    createdAtBlockNumber: BigInt(ctx.block.height),
    txCount: 0,
    reserve0: ZERO_BD.toFixed(6),
    reserve1: ZERO_BD.toFixed(6),
    trackedReserveETH: ZERO_BD.toFixed(6),
    reserveETH: ZERO_BD.toFixed(6),
    reserveUSD: ZERO_BD.toFixed(6),
    totalSupply: ZERO_BD.toFixed(6),
    volumeToken0: ZERO_BD.toFixed(6),
    volumeToken1: ZERO_BD.toFixed(6),
    volumeUSD: ZERO_BD.toFixed(6),
    untrackedVolumeUSD: ZERO_BD.toFixed(6),
    token0Price: ZERO_BD.toFixed(6),
    token1Price: ZERO_BD.toFixed(6),
  })

  await ctx.store.save(pair)
}
