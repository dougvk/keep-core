import React from "react"
import DelegateStakeForm from "../components/DelegateStakeForm"
import TokensOverview from "../components/TokensOverview"
import { useTokensPageContext } from "../contexts/TokensPageContext"
import PageWrapper from "../components/PageWrapper"
import Tile from "../components/Tile"
import TokensContextSwitcher from "../components/TokensContextSwitcher"
import DelegationOverview from "../components/DelegationOverview"
import { useModal } from "../hooks/useModal"
import { connect } from "react-redux"
import { ContractsLoaded } from "../contracts"
import { fromTokenUnit } from "../utils/token.utils"

const confirmationModalOptions = {
  modalOptions: { title: "Initiate Delegation" },
  title: "You’re about to delegate stake.",
  subtitle:
    "You’re delegating KEEP tokens. You will be able to cancel the delegation for up to 1 week. After that time, you can undelegate your stake.",
  btnText: "delegate",
  confirmationText: "DELEGATE",
}

const TokensPage = ({ delegateStake }) => {
  const { openConfirmationModal } = useModal()

  const {
    keepTokenBalance,
    minimumStake,
    selectedGrant,
    tokensContext,
  } = useTokensPageContext()

  const handleSubmit = async (values, meta) => {
    const { stakingContract } = await ContractsLoaded
    const amount = fromTokenUnit(values.stakeTokens)

    const stakingContractAddress = stakingContract.options.address
    const delegationData =
      "0x" +
      Buffer.concat([
        Buffer.from(values.beneficiaryAddress.substr(2), "hex"),
        Buffer.from(values.operatorAddress.substr(2), "hex"),
        Buffer.from(values.authorizerAddress.substr(2), "hex"),
      ]).toString("hex")

    await openConfirmationModal(confirmationModalOptions)
    delegateStake(
      {
        amount,
        stakingContractAddress,
        delegationData,
        grantId: selectedGrant.id,
        ...selectedGrant,
      },
      meta
    )
  }

  const getAvailableToStakeAmount = () => {
    if (tokensContext === "granted") {
      return selectedGrant.availableToStake
    }

    return keepTokenBalance
  }

  return (
    <PageWrapper title="Delegate Tokens From:">
      <TokensContextSwitcher />
      <div className="tokens-wrapper">
        <Tile
          title="Delegate Tokens"
          id="delegate-stake-section"
          withTooltip
          tooltipProps={{
            text: (
              <>
                <span className="text-bold">Delegation</span>&nbsp; sets aside
                an amount of KEEP to be staked by a trusted third party,
                referred to within the dApp as an operator.
              </>
            ),
          }}
        >
          <DelegateStakeForm
            onSubmit={handleSubmit}
            minStake={minimumStake}
            availableToStake={getAvailableToStakeAmount()}
          />
        </Tile>
        <TokensOverview />
      </div>
      <DelegationOverview />
    </PageWrapper>
  )
}

const mapDispatchToProps = (dispatch) => ({
  delegateStake: (values, meta) =>
    dispatch({
      type: "staking/delegate_request",
      payload: values,
      meta,
    }),
})

export default connect(null, mapDispatchToProps)(TokensPage)
