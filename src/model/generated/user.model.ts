import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {LiquidityPosition} from "./liquidityPosition.model"

@Entity_()
export class User {
  constructor(props?: Partial<User>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @OneToMany_(() => LiquidityPosition, e => e.user)
  liquidityPositions!: LiquidityPosition[]

  /**
   * BigDecimal
   */
  @Column_("text", {nullable: false})
  usdSwapped!: string
}
