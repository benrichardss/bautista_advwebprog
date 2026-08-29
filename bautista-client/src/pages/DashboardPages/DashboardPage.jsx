import React from "react";
import { Box, Typography, Paper } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Gauge } from "@mui/x-charts/Gauge";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const columns = [
  { field: "id", headerName: "ID", width: 90 },

  {
    field: "firstName",
    headerName: "First name",
    width: 150,
    editable: true,
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    editable: true,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

export default function DashboardPage() {
  const avgAge =
    rows.reduce((sum, r) => sum + (r.age || 0), 0) /
    rows.filter((r) => r.age !== null).length;

  const section = {
    borderTop: "2px solid #18181b",
    borderBottom: "2px solid #18181b",
    backgroundColor: "#fafafa",
    px: { xs: 2, sm: 3, md: 4 },
    py: 3,
  };

  const container = {
    maxWidth: 1100,
    mx: "auto",
    width: "100%",
  };

  const title = {
    fontSize: { xs: "1.35rem", md: "1.5rem" },
    fontWeight: 600,
    color: "#18181b",
    mb: 2.5,
  };

  const card = {
    border: "2px solid #18181b",
    borderRadius: "24px",
    bgcolor: "#f4f4f5",
    p: 2,
    minHeight: 150,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  };

  const chartCard = {
    border: "2px solid #18181b",
    borderRadius: "24px",
    bgcolor: "#f4f4f5",
    p: 2,
  };

  const label = {
    mt: 1.2,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: "#71717a",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 3,
      }}
    >

      <Box sx={section}>
        <Box sx={container}>
          <Typography
            sx={{
              fontSize: { xs: "1.75rem", md: "1.9rem" },
              fontWeight: 700,
              color: "#18181b",
              lineHeight: 1.1,
            }}
          >
            Dashboard Overview
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              fontSize: "0.85rem",
              color: "#71717a",
              lineHeight: 1.6,
            }}
          >
            A clean snapshot of your users, analytics, and system activity.
          </Typography>
        </Box>
      </Box>

      <Box sx={section}>
        <Box sx={container}>
          <Typography sx={title}>Key Metrics</Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
            }}
          >
            <Paper elevation={0} sx={card}>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700 }}>
                {rows.length}
              </Typography>
              <Typography sx={label}>Total Users</Typography>
            </Paper>

            <Paper elevation={0} sx={card}>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700 }}>
                {avgAge.toFixed(1)}
              </Typography>
              <Typography sx={label}>Average Age</Typography>
            </Paper>

            <Paper elevation={0} sx={card}>
              <Gauge width={110} height={70} value={65} />
              <Typography sx={label}>System Load</Typography>
            </Paper>

            <Paper elevation={0} sx={card}>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700 }}>
                98%
              </Typography>
              <Typography sx={label}>Uptime</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Box sx={section}>
        <Box sx={container}>
          <Typography sx={title}>Analytics Overview</Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 2.5,
            }}
          >
            <Paper elevation={0} sx={chartCard}>
              <Box
                sx={{
                  height: 290,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <BarChart
                  height={260}
                  series={[
                    { data: [35, 44, 24, 34], label: "Series 1" },
                    { data: [51, 6, 49, 30], label: "Series 2" },
                  ]}
                  xAxis={[
                    {
                      data: ["Q1", "Q2", "Q3", "Q4"],
                      scaleType: "band",
                      label: "Quarters",
                    },
                  ]}
                />
              </Box>
            </Paper>

            <Paper elevation={0} sx={chartCard}>
              <Box
                sx={{
                  height: 290,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <PieChart
                  height={220}
                  series={[
                    {
                      data: [
                        { id: 0, value: 10, label: "series A" },
                        { id: 1, value: 15, label: "series B" },
                        { id: 2, value: 20, label: "series C" },
                      ],
                    },
                  ]}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Box sx={section}>
        <Box sx={container}>
          <Typography sx={title}>User Directory</Typography>

          <Paper
            elevation={0}
            sx={{
              border: "2px solid #18181b",
              borderRadius: "24px",
              bgcolor: "#f4f4f5",
              p: 2,
            }}
          >
            <Box>
              <DataGrid
                autoHeight
                  rows={rows}
                  columns={columns}
                  experimentalFeatures={{ newEditingApi: true }}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                  sx={{
                    border: "none",
                    borderRadius: "18px",
                    overflow: "hidden",
                    fontSize: "0.78rem",

                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#e4e4e7",
                    },

                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid #e4e4e7",
                    },

                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                      outline: "none",
                    },
                  }}
                />
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box sx={section}>
        <Box sx={container}>
          <Typography sx={title}>Location Insight</Typography>

          <Paper
            elevation={0}
            sx={{
              border: "2px solid #18181b",
              borderRadius: "24px",
              overflow: "hidden",
              bgcolor: "#f4f4f5",
            }}
          >
            <Box sx={{ height: 340 }}>
              <MapContainer
                center={[14.604523, 120.994314]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <Marker position={[14.604523, 120.994314]}>
                  <Popup>
                    National University-Manila <br />
                    <p>J. Sison St, Sampaloc, Manila, 1008 Metro Manila</p>
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
          </Paper>
        </Box>
      </Box>

    </Box>
  );
}