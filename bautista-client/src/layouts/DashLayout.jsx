import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Box,
  Typography,
  IconButton,
  Button,
  InputBase,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RateReviewIcon from '@mui/icons-material/RateReview';

import logo from "../assets/img/nubdexchange_logo.png";

const links = [
  {
    label: "Products",
    to: "/dashboard/products",
    icon: InventoryIcon,
  },
  {
    label: "Orders",
    to: "/dashboard/orders",
    icon: ShoppingBagIcon,
  },
  {
    label: "Reviews",
    to: "/dashboard/reviews",
    icon: RateReviewIcon,
  },
  {
    label: "Users",
    to: "/dashboard/users",
    icon: PeopleIcon,
    adminOnly: true,
  },
];

export default function DashLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;
  const visibleLinks = links.filter((link) => !(link.adminOnly && userRole !== 'admin'));


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffd41d" }}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: "2px solid #000000",
          bgcolor: "#35408f",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                border: "2px solid transparent",
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#ffd41d",
                  bgcolor: "transparent",
                },
              }}
            >
              {sidebarOpen ? <MenuOpenIcon sx={{ color: "#ffd41d" }} /> : <MenuIcon sx={{ color: "#ffd41d" }} />}
            </IconButton>

            <NavLink
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
              }}
            >
              <img src={logo} alt="BulldogEx" className="h-9 w-9 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain" />

              <p className="font-bungee text-xl font-bold text-[#ffd41d]">BulldogEx Dashboard</p>
            </NavLink>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button>
              <PersonIcon sx={{ color: "#ffd41d" }} />

              <span className="flex flex-col items-start leading-tight">
                <span className="font-poppins text-[8px] font-medium uppercase tracking-[0.16em] text-[#ffd41d]/75">
                  {user.role}
                </span>

                <span className="font-poppins text-xs font-semibold tracking-normal text-[#ffd41d]">
                  {user.firstName}
                </span>
              </span>
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outlined"
              sx={{
                borderRadius: "999px",
                borderWidth: "2px",
                px: 1.8,
                py: 0.9,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#ffd41d",
                borderColor: "#ffd41d",
                "&:hover": {
                  borderColor: "#18181b",
                  bgcolor: "#ffd41d",
                  color: "#18181b",
                },
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", pt: "76px" }}>
        <Box
          sx={{
            position: "sticky",
            top: "76px",
            height: "calc(100vh - 76px)",
            borderRight: "2px solid #000000",
            bgcolor: "#35408f",
            transition: "all 0.3s ease",
            width: sidebarOpen ? 256 : 80,
            px: sidebarOpen ? 2 : 1.5,
            py: 3,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {visibleLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/dashboard"}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: sidebarOpen
                          ? "flex-start"
                          : "center",
                        gap: sidebarOpen ? 1.5 : 0,
                        borderRadius: "999px",
                        border: "2px solid",
                        borderColor: isActive
                          ? "#18181b"
                          : "transparent",
                        bgcolor: isActive ? "#ffd41d" : "transparent",
                        color: isActive ? "#35408f" : "#ffd41d",
                        px: 2,
                        py: 1.5,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        transition: "0.2s",
                        "&:hover": {
                          borderColor: "#18181b",
                          bgcolor: isActive ? "#ffd41d" : "#ffd41d",
                          color: "#35408f",
                        },
                      }}
                    >
                      <Icon fontSize="small" />

                      {sidebarOpen && <span>{link.label}</span>}
                    </Box>
                  )}
                </NavLink>
              );
            })}
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: "hidden",
            py: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}