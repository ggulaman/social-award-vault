import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const label = { inputProps: { "aria-label": "Switch demo" } };

const AdminPage = ({ userAccount, socialVaultFactorySC }) => {
  const [disableProtocolFeeSwitch, setDisableProtocolFeeSwitch] = useState(true);
  const [currentProtocolFee, setCurrentProtocolFee] = useState(null);
  const [currentNumberOfVaults, setNumberOfVaults] = useState(null);
  const [currentNumberOfActiveVaults, setCurrentNumberOfActiveVaults] = useState(null);
  const [newProtocolFee, setNewProtocolFee] = useState(null);
  const [sendUpdateFeeRequest, setSendUpdateFeeRequest] = useState(false);

  const checkCurrentProtocolFee = async() => {
    if (userAccount) {
      try {
        const fee = await socialVaultFactorySC.methods.socialAwardVaultProtolStakingFee().call();
        const numberOfVaults = await socialVaultFactorySC.methods.getNumberOfSocialAwardVaults().call();
        const numberOfActiveVaults = await socialVaultFactorySC.methods.getNumberOfActiveAwardVaults().call();
        console.log("fee: " + fee);
        console.log("numberOfVaults: " + numberOfVaults);
        console.log("numberOfActiveVaults: " + numberOfActiveVaults);
        setCurrentProtocolFee(fee);
        setNumberOfVaults(numberOfVaults);
        setCurrentNumberOfActiveVaults(numberOfActiveVaults);
      } catch (error) {
        console.error("error while loading admin data " + error);
      }
    }
  };

  checkCurrentProtocolFee();

  useEffect(async()=> {
    if (sendUpdateFeeRequest) {
      checkCurrentProtocolFee();
      setSendUpdateFeeRequest(false);
    }

  }, [sendUpdateFeeRequest]);

  const updateProtocolFee = async(newFee) => {
    console.log("useraccount is:", userAccount);
    await socialVaultFactorySC.methods.setAwardVaultProtolStakingFee(parseInt(newFee)).send({ from: userAccount })
      .then(function(receipt) {
        console.log("receipt: ", receipt);
        setSendUpdateFeeRequest(true);
      })
      .catch(error => {
        console.log("error: " + error);
      });
  };

  console.log("socialVaultFactoryFee: ", currentProtocolFee);

  const protocolFeeValidationRegex = /^(?:100(?:\.00?)?|\d?\d(?:\.\d\d?)?)$/;

  const onChangeSwitch = ({ target: { checked } }) => setDisableProtocolFeeSwitch(!checked);

  const onChangeProtocolFee = ({ target: { value } }) => {
    setNewProtocolFee(value);
  };

  const onChangeProtocolFeeErrorValidation = () => newProtocolFee && !protocolFeeValidationRegex.test(newProtocolFee);

  const protocolSettingsPaper =
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} >
          <FormControlLabel control={<Switch {...label} onChange={onChangeSwitch} />} label="Update Protocol Fee" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} >
          <TextField id="outlined-basic" defaultValue={currentProtocolFee} label="Protocol Fee Percentage" variant="outlined" disabled={disableProtocolFeeSwitch} onChange={onChangeProtocolFee} error={onChangeProtocolFeeErrorValidation()} helperText="Only accepts Int. values"/>
        </Grid>
        <Grid item xs={12} sm={6} md={8} >
          <Button variant="contained" onClick={() => updateProtocolFee(newProtocolFee)} color='primary' disabled={!newProtocolFee || disableProtocolFeeSwitch || onChangeProtocolFeeErrorValidation()} style={{ width: 200, marginTop: 12}}>
            <Typography
              component="h5"
              variant="h8"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
            Update Fee
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  ;

  const protocolStatistics =
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
      <Grid item xs={12} >
        <Box>
          <Box sx={{ display: "inline", color: "text.primary", fontWeight: "medium" }}>
            Protocol Fee:
          </Box>
          <Box sx={{ color: "text.secondary", display: "inline"}}>
            {currentProtocolFee ? ` ${currentProtocolFee}` : ""}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} >
        <Box>
          <Box sx={{ display: "inline", color: "text.primary", fontWeight: "medium" }}>
            Number of Vaults:
          </Box>
          <Box sx={{ color: "text.secondary", display: "inline"}}>
            {currentNumberOfVaults ? ` ${currentNumberOfVaults}` : ""}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} >
        <Box>
          <Box sx={{ color: "text.primary", fontWeight: "medium", display: "inline" }}>
            Number of Active Vaults:
          </Box>
          <Box sx={{ color: "text.secondary", display: "inline"}}>
            {currentNumberOfActiveVaults ? ` ${currentNumberOfActiveVaults}` : ""}
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Box>
  ;

  return (
    <Grid container spacing={1} >
      <Grid item xs={12} xl={5} sx={{ mt: 4, mb: 4, ml: 4, mr:4 }}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 300

          }}
        >
          <Box sx={{ color: "text.secondary", mb: 5, fontWeight: "bold"}}>Protocol Settings</Box>
          {protocolSettingsPaper}
        </Paper>
      </Grid>
      <Grid item xs={12} xl={5} sx={{ mt: 4, mb: 4, ml: 4, mr:4 }}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: 300
          }}
        >
          <Box sx={{ color: "text.secondary", mb: 5, fontWeight: "bold" }}>Statistics</Box>
          {protocolStatistics}
        </Paper>
      </Grid>
    </Grid>
  );};

export default AdminPage;