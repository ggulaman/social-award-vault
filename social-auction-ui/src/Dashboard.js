import React, { useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import makeBlockie from "ethereum-blockies-base64";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { networkList } from "./networks";
import { AdminPage, CreateVault, StakePage, DashboardUser } from "./pages/";
import { MainListItems } from "./ListItems";
import { getWeb3Provider, getSocialVaultFactorySC } from "./ethereum/";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    "& .MuiDrawer-paper": {
      position: "relative",
      whiteSpace: "nowrap",
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: "border-box",
      ...(!open && {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const identicon = (address) => {
  return(
    <div>
      <img src={makeBlockie(address)} height={15} alt=""/>
    </div>
  );};

const mdTheme = createTheme();

const DashboardContent = () => {
  const [open, setOpen] = useState(true);
  const [getPage, setPage] = useState("stake");
  const [currentAccount, setCurrentAccount] = useState(null);

  const [socialVaultFactorySC, setSocialVaultFactorySC] = useState();
  const [socialVaultFactoryFee, setSocialVaultFactoryFee] = useState();
  const [userAccount, setUserAccount] = useState();

  const [anchorConnectWallet, setAnchorConnectWallet] = useState(null);
  const openAnchorConnectWallet = Boolean(anchorConnectWallet);
  const handleClick = ({ currentTarget }) => {
    setAnchorConnectWallet(currentTarget);
  };
  const handleClose = async () => {
    setAnchorConnectWallet(null);
    setCurrentAccount(null);
  };

  const checkWalletIsConnected = () => {
    const {ethereum} = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }
  };

  checkWalletIsConnected();

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    checkWalletIsConnected();

    const chainId = async () => await ethereum.request({ method: "eth_chainId" });

    console.log(`chain id is ${chainId()}`);

    const connectedChain = parseInt(await chainId(), 16);
    if (networkList[connectedChain] && networkList[connectedChain].network === "Kovan"){
      console.log("connected to ", networkList[connectedChain].network);
    } else {
      alert(`Please, select Kovan network in your Wallet!. You are currently on ${networkList[connectedChain].network}`);
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("accounts: ", accounts);
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      if (accounts) {
        const web3 = getWeb3Provider();
        const accounts = await web3.eth.requestAccounts();
        setUserAccount(accounts[0]);

        const sc = getSocialVaultFactorySC();
        setSocialVaultFactorySC(sc);
        const fee = await sc.methods.socialAwardVaultProtolStakingFee().call();
        setSocialVaultFactoryFee(fee);
        console.log(fee);
      }
    } catch (err){
      console.error(err);
    }
  };

  useEffect(async() => {
    connectWalletHandler();
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const returnPage = () => {
    if (getPage === "admin") {
      console.log("admin fee", socialVaultFactoryFee);
      return (<AdminPage userAccount={userAccount} socialVaultFactorySC={socialVaultFactorySC} />);
    }
    else if (getPage === "createVault"){
      return (<CreateVault userAccount={userAccount} socialVaultFactorySC={socialVaultFactorySC}/>);
    }
    else if (getPage === "dashboard"){
      return (<DashboardUser userAccount={userAccount} socialVaultFactorySC={socialVaultFactorySC} />);
    }
    else if (getPage === "stake"){
      return (<StakePage userAccount={userAccount} socialVaultFactorySC={socialVaultFactorySC} />);
    }
    else {
      return null;
    }
  };
  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex", height: "1000"}} >
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Social Auction Vault
            </Typography>
            {!currentAccount ?
              <Button variant="contained" onClick={connectWalletHandler} color='primary' style={{ width: 200 }}>
                <Typography
                  component="h5"
                  variant="h8"
                  color="inherit"
                  noWrap
                  sx={{ flexGrow: 1 }}
                >
                  Connect Wallet
                </Typography>
              </Button> :
              <div>
                <Button
                  id="connect-wallet-button"
                  aria-controls={openAnchorConnectWallet ? "connect-wallet-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openAnchorConnectWallet ? "true" : undefined}
                  onClick={handleClick}
                  variant="contained"
                  style={{ width: 200 }}
                  color="primary" >
                  <Typography
                    component="h5"
                    variant="h8"
                    color="inherit"
                    noWrap
                    sx={{ flexGrow: 1 }}
                    style={{ marginRight: 20 }}
                  >
                    {currentAccount}
                  </Typography>
                  <span></span>
                  {identicon(currentAccount)}
                </Button>
                <Menu
                  id="connect-wallet-menu"
                  anchorEl={anchorConnectWallet}
                  open={openAnchorConnectWallet}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "connect-wallet-button",
                  }}
                >
                  <MenuItem onClick={handleClose}>Disconnect Wallet</MenuItem>
                </Menu>
              </div>

            }
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems setPage={setPage} getPage={getPage} />
            <Divider sx={{ my: 54 }} />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto"
          }}
        >
          <Toolbar />
          <Box >
            {returnPage()}
            <Copyright sx={{ pt: 4 }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;