import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { getWeb3Provider, getSocialVaultSC } from "../ethereum/";

const DashboardUser = ({ userAccount, socialVaultFactorySC }) => {
  const [userActiveStakedVaults, setUserActiveStakedVaults] = useState([]);
  const [userFinsihedStakedVaults, setUserFinsihedStakedVaults] = useState([]);

  const getUserActiveVaultDetails = async() => {
    try {
      console.log("user account: ", userAccount);
      const numberOfUserVaultsTmp = await socialVaultFactorySC.methods.getNumberOfAwardVaultsOfUser().call({ from: userAccount });
      const userVaultListTmp = await socialVaultFactorySC.methods.getSocialAwardVaultsStakedByUser().call({ from: userAccount });

      const userActiveStakedVaultsTmp = [];
      const userFinsihedStakedVaultsTmp = [];

      const userVaultDetailsTmp = [];
      for (const vaultId of userVaultListTmp) {
        const activeVaultDetailsItem = await socialVaultFactorySC.methods.getSocialAwardVaultDetailsById(vaultId).call();
        activeVaultDetailsItem["id"] = vaultId;
        console.log("details for id " + vaultId + " are: " + JSON.stringify(activeVaultDetailsItem));

        const contractAddress = activeVaultDetailsItem[indexFields["Vault Address"]];
        const socialVaultSC = getSocialVaultSC(contractAddress);

        const userStakedAmount = await socialVaultSC.methods.getMyStakingAmount().call({ from: userAccount });
        const isUserWinner = await socialVaultSC.methods.isUserWinner().call({ from: userAccount });
        const web3 = getWeb3Provider();
        const scEthBalance = await web3.eth.getBalance(contractAddress);
        activeVaultDetailsItem["userStakedAmount"] = userStakedAmount;
        activeVaultDetailsItem["isUserWinner"] = isUserWinner;
        activeVaultDetailsItem["scEthBalance"] = scEthBalance;

        if (parseInt(activeVaultDetailsItem[indexFields["Target Amount"]]) > parseInt(activeVaultDetailsItem[indexFields["Staked Amount"]])) {
          userActiveStakedVaultsTmp.push(activeVaultDetailsItem);
        } else {
          userFinsihedStakedVaultsTmp.push(activeVaultDetailsItem);
        }
      }

      setUserActiveStakedVaults(userActiveStakedVaultsTmp);
      setUserFinsihedStakedVaults(userFinsihedStakedVaultsTmp);

      console.log("numberOfUserVaultsTmp " + numberOfUserVaultsTmp);
      console.log("number of active vaults are " + userVaultListTmp.length);
      console.log("user vaults are " + userVaultListTmp);
      console.log("user vaults details are " + JSON.stringify(userVaultDetailsTmp));
      console.log("userActiveStakedVaultsTmp details are " + JSON.stringify(userActiveStakedVaultsTmp));
      console.log("userFinsihedStakedVaultsTmp details are " + JSON.stringify(userFinsihedStakedVaultsTmp));

    } catch (error) {
      console.error("error while loading user data " + error);
    }
  };

  const claimVault = async(vaultId) => {
    console.log("claiming vault ", vaultId);
    const contractAddress = userFinsihedStakedVaults.find(vaultDetails => vaultDetails.id === vaultId)[indexFields["Vault Address"]];
    const socialVaultSC = getSocialVaultSC(contractAddress);
    await socialVaultSC.methods.claimSocialAwardVault().send({ from: userAccount })
      .then(function(receipt) {
        console.log("receipt: ", receipt);
      })
      .catch(error => {
        console.log("error: " + error);
      });
  };

  useEffect(async() => {
    console.log("wallet address changed");
    console.log(userAccount);
    userAccount && getUserActiveVaultDetails();
  }, [userAccount]);

  const indexFields = {
    "Owner Address": "0",
    "Vault Name": "1",
    "Target Amount": "2",
    "Staked Amount": "3",
    "User Staking Amount": "userStakedAmount",
    "Max. Staking Amount": "4",
    "Min. Staking Amount": "5",
    "Fee": "6",
    "Vault Address": "7",
    "Is the Winner": "isUserWinner",
    "Eth Balance": "scEthBalance"
  };

  const vaultBoxDetailFields = vault =>
    Object.entries(indexFields).map(([key, value]) =>
      key !== "Is the Winner" ?
        <Box style={{ marginTop: 12}}>
          <Box sx={{ display: "inline", color: "text.primary", fontWeight: "medium" }}>
            {key}:
          </Box>
          <Box sx={{ color: "text.secondary", display: "inline"}}>
            {` ${vault[value]}`}
          </Box>
        </Box> :
        <Box style={{ marginTop: 12}}>
          <Box sx={{ display: "inline", color: "text.primary", fontWeight: "medium" }}>
            {key}:
          </Box>
          <Box sx={{ color: "text.secondary", display: "inline"}}>
            { ` ${vault[value] === true ? "Yes" : vault[indexFields["Target Amount"]] > vault[indexFields["Staked Amount"]] ? "N/A" : "No"}`}
          </Box>
        </Box>
    );

  const vaultBoxDetails = vault =>
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} >
          {vaultBoxDetailFields(vault)}

          <Grid item xs={12} sm={6} md={8} >
            <Button variant="contained" onClick={() => claimVault(vault.id)} color='primary' disabled={!vault[indexFields["Is the Winner"]] || parseInt(vault[indexFields["Target Amount"]]) > parseInt(vault[indexFields["Eth Balance"]])} style={{ width: 200, marginTop: 12}}>
              <Typography
                component="h5"
                variant="h8"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
              Claim
              </Typography>
            </Button>
          </Grid>

        </Grid>
      </Grid>
    </Box>
  ;

  const vaultBox = vault =>
    <Grid item xs={12} xl={5} sx={{ mt: 4, mb: 4, ml: 4, mr:4 }}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Box sx={{ color: "text.secondary", mb: 5, fontWeight: "bold"}}> Vault Id {vault.id} </Box>
        {vaultBoxDetails(vault)}
      </Paper>
    </Grid>
  ;

  const iterateVaults = vaultList => vaultList.map(vaultTmps => {
    return vaultBox(vaultTmps);
  });

  return (
    <Grid container spacing={1}>
      <Grid item style={{ marginLeft: 32, marginTop: 20, marginBottom: 12}} xs={12} >
        <Typography variant="h5" component="h2" color='primary' style={{ mt: 12, mb:12, ml: 12}}>
          Active Vaults
        </Typography>
      </Grid>
      {iterateVaults(userActiveStakedVaults)}
      <Grid item style={{ marginLeft: 32, marginTop: 20, marginBottom: 12}} xs={12} >
        <Typography variant="h5" component="h2" color='primary' style={{ mt: 12, mb:12, ml: 12}}>
          Triggered Vaults
        </Typography>
      </Grid>
      {iterateVaults(userFinsihedStakedVaults)}
    </Grid>
  );};

export default DashboardUser;