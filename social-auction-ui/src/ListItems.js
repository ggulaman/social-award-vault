import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export const MainListItems = ({ setPage, getPage }) => {
  return(
    <div>
      <React.Fragment>
        <ListItemButton onClick={() => setPage("dashboard")}>
          <ListItemIcon>
            {
              getPage === "dashboard" ?
                <DashboardIcon color='primary'/> :
                <DashboardIcon />
            }
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => setPage("createVault")}>
          <ListItemIcon>
            {
              getPage === "createVault" ?
                <ViewInArIcon color='primary'/> :
                <ViewInArIcon />
            }
          </ListItemIcon>
          <ListItemText primary="Create Vault" />
        </ListItemButton>
        <ListItemButton onClick={() => setPage("stake")}>
          <ListItemIcon>
            {
              getPage === "stake" ?
                <AttachMoneyIcon color='primary'/> :
                <AttachMoneyIcon />
            }
          </ListItemIcon>
          <ListItemText primary="Stake" />
        </ListItemButton>
        <ListItemButton onClick={() => setPage("admin")}>
          <ListItemIcon>
            {
              getPage === "admin" ?
                <AssuredWorkloadIcon color='primary'/> :
                <AssuredWorkloadIcon />
            }
          </ListItemIcon>
          <ListItemText primary="Admin" />
        </ListItemButton>
      </React.Fragment>
    </div>
  );
};