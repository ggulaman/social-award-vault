import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const CreateVault = ( { userAccount, socialVaultFactorySC }) => {
  const [socialVaultName, setSocialVaultName] = useState(null);
  const [socialVaultTargetAmount, setSocialVaultTargetAmount] = useState(null);
  const [socialVaultMaxStakingAmount, setSocialVaultMaxStakingAmount] = useState(null);
  const [socialVaultMinStakingAmount, setSocialVaultMinStakingAmount] = useState(null);

  const integerValidWeiAmount = /^[0-9][0-9]{0,17}$|^1000000000000000000$|^0$/;
  const max25CharactersRegex = /^.{1,25}$/;

  const createVault = async() => {
    if (!userAccount) {
      alert("Connect your wallet");
      return;
    }
    console.log("Creating the new Vault {$newProtocolFee}");
    console.log("useraccount is:", userAccount);
    await socialVaultFactorySC.methods.createSocialAwardVault(
      parseInt(socialVaultTargetAmount).toString(),
      socialVaultName,
      parseInt(socialVaultMaxStakingAmount).toString(),
      parseInt(socialVaultMinStakingAmount).toString()
    ).send({ from: userAccount })
      .then(function(receipt) {
        console.log("receipt of new SV: ", receipt);
        alert("New vault created: ");
      })
      .catch(error => {
        console.log("error creating new SV: " + error);
      });
  };

  const invalidTargetAmout = socialVaultTargetAmount && !integerValidWeiAmount.test(socialVaultTargetAmount);
  const invalidMaxStakingAmout = socialVaultMaxStakingAmount && !integerValidWeiAmount.test(socialVaultMaxStakingAmount); //|| socialVaultTargetAmountBN < socialVaultMaxStakingAmountBN;
  const invalidMinStakingAmout = socialVaultMinStakingAmount && !integerValidWeiAmount.test(socialVaultMinStakingAmount); //|| socialVaultMaxStakingAmountBN < socialVaultMinStakingAmountBN);

  const disableButton = socialVaultName && !max25CharactersRegex.test(socialVaultName) ||
    invalidTargetAmout ||
    invalidMaxStakingAmout ||
    invalidMinStakingAmout
  ;

  const createVaultPaper =
  <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
    <Grid item xs={12}>
      <TextField id="outlined-basic" label="Social Vault Name" variant="outlined" disabled={false} onChange={e => setSocialVaultName(e.target.value)} error={socialVaultName && !max25CharactersRegex.test(socialVaultName)} helperText="Max. 25 Characters"/>
    </Grid>
    <Grid item xs={12} >
      <TextField id="outlined-basic" label="Target Amount" variant="outlined" disabled={!socialVaultName} onChange={e => setSocialVaultTargetAmount(e.target.value)} error={invalidTargetAmout} helperText="In Wei"/>
    </Grid>
    <Grid item xs={12} >
      <TextField id="outlined-basic" label="Max Staking Amount" variant="outlined" disabled={!socialVaultName || !socialVaultTargetAmount} onChange={e => setSocialVaultMaxStakingAmount(e.target.value)} error={invalidMaxStakingAmout} helperText="In Wei"/>
    </Grid>
    <Grid item xs={12} >
      <TextField id="outlined-basic" label="Min Staking Amount" variant="outlined" disabled={!socialVaultName || !socialVaultTargetAmount || !socialVaultMaxStakingAmount} onChange={e => setSocialVaultMinStakingAmount(e.target.value)} error={invalidMinStakingAmout} helperText="In Wei"/>
    </Grid>
    <Grid item xs={12} sm={4} md={4} >
      <Button variant="contained" onClick={createVault} color='primary' disabled={disableButton} style={{ width: 200, marginTop: 12}}>
        <Typography
          component="h5"
          variant="h8"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
            Create Vault
        </Typography>
      </Button>
    </Grid>
  </Grid>;

  return (
    <Grid container spacing={1} >
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{ mt: 4, mb: 4, ml: 4, mr:4 }}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",

            height: 600
          }}
        >
          <Box sx={{ color: "text.secondary", mb: 5, fontWeight: "bold"}}>Social Vault Creation</Box>
          {createVaultPaper}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CreateVault;