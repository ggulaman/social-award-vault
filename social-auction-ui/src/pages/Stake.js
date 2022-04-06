import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import SocialVaultContract from "../artifacts/contracts/SocialAwardVault.sol/SocialAwardVault.json";
import Web3 from "web3";

const StakePage = ({ userAccount, socialVaultFactorySC }) => {
  const [activeVaultDetails, setActiveVaultDetails] = useState([]);
  const [stakedAmountTmp, setStakedAmountTmp] = useState({});
  const ABI = SocialVaultContract.abi;

  const stakeValueChange = (vaultId, value) => {
    const stakedAmountTmpTmp = { ...stakedAmountTmp };
    stakedAmountTmpTmp[vaultId] = value;
    setStakedAmountTmp(stakedAmountTmpTmp);
    console.log(stakedAmountTmpTmp);
  };

  const stake = async(vaultId) => {
    console.log("staking in vault ", vaultId);
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const contractAddress = activeVaultDetails.find(vaultDetails => vaultDetails.id === vaultId)[indexFields["Vault Address"]];
    const socialVaultSC = new web3.eth.Contract(ABI, contractAddress);
    console.log("about to stake in address ", contractAddress, " the following amount: ", stakedAmountTmp[vaultId]);
    await socialVaultSC.methods.stakeToSocialAwardVault().send({ from: userAccount, value: stakedAmountTmp[vaultId] })
      .then(function(receipt) {
        console.log("receipt: ", receipt);
      })
      .catch(error => {
        console.log("error: " + error);
      });

  };

  const getActiveVaultDetails = async() => {
    try {
      const activeVaultListTmp = await socialVaultFactorySC.methods.getActiveSocialAwardVaults().call();
      const activeVaultDetailsTmp = [];

      for (const vaultId of activeVaultListTmp) {
        const activeVaultDetailsItem = await socialVaultFactorySC.methods.getSocialAwardVaultDetailsById(vaultId).call();
        activeVaultDetailsItem["id"] = vaultId;
        console.log("details for id " + vaultId + " are: " + JSON.stringify(activeVaultDetailsItem));
        activeVaultDetailsTmp.push(activeVaultDetailsItem);
      }

      setActiveVaultDetails(activeVaultDetailsTmp);
      console.log("number of active vaults are " + activeVaultListTmp);
      console.log("active vaults list is " + activeVaultListTmp);
      console.log("active vaults list details are " + JSON.stringify(activeVaultDetailsTmp));

    } catch (error) {
      console.error("error while loading admin data " + error);
    }
  };

  useEffect(async() => {
    getActiveVaultDetails();

  }, []);

  const indexFields = {
    "Owner Address": "0",
    "Vault Name": "1",
    "Target Amount": "2",
    "Staked Amount": "3",
    "Max. Staking Amount": "4",
    "Min. Staking Amount": "5",
    "Fee": "6",
    "Vault Address": "7"
  };

  const vaultBoxDetailFields = vault =>
    Object.entries(indexFields).map(([key, value]) =>
      <Box style={{ marginTop: 12}} key={key} >
        <Box sx={{ display: "inline", color: "text.primary", fontWeight: "medium" }}>
          {key}:
        </Box>
        <Box sx={{ color: "text.secondary", display: "inline"}}>
          {` ${vault[value]}`}
        </Box>
      </Box>
    );

  const vaultBoxDetails = vault =>
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} >
          {vaultBoxDetailFields(vault)}
          <Grid item xs={12} sm={6} md={4} style={{ marginTop: 12}}>
            <TextField id="outlined-basic" defaultValue={0} label="Staking Amount" variant="outlined" disabled={false} onChange={({ target: { value } }) => stakeValueChange(vault.id, value)} /*error={onChangeProtocolFeeErrorValidation()}*/ helperText="Only accepts Int. values"/>
          </Grid>

          <Grid item xs={12} sm={6} md={8} >
            <Button variant="contained" onClick={() => stake(vault.id)} color='primary' disabled={false} style={{ width: 200, marginTop: 12}}>
              <Typography
                component="h5"
                variant="h8"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
              Stake
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

  const iterateVaults = activeVaultDetails.map(vaultTmps => {
    return vaultBox(vaultTmps);
  });

  return (
    <Grid container spacing={1}>
      {iterateVaults}
    </Grid>
  );};

export default StakePage;