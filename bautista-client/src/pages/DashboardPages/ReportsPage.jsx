import React, { useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
} from "@mui/material";

import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Gauge } from "@mui/x-charts/Gauge";
import { DataGrid } from "@mui/x-data-grid";

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
};

const label = {
  mt: 1.5,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "#71717a",
};

const columns = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "report", headerName: "Report", width: 180 },
  { field: "status", headerName: "Status", width: 140 },
  { field: "date", headerName: "Date", width: 140 },
];

const rows = [
  { id: 1, report: "Sales Overview", status: "Completed", date: "2026-05-01" },
  { id: 2, report: "User Analytics", status: "Pending", date: "2026-05-02" },
  { id: 3, report: "Inventory Report", status: "Completed", date: "2026-05-03" },
  { id: 4, report: "Finance Summary", status: "In Progress", date: "2026-05-04" },
  { id: 5, report: "Traffic Analysis", status: "Completed", date: "2026-05-05" },
];

export default function ReportsPage() {
  const printRef = useRef(null);

  const handlePrint = ( ) => {
    const printContent = printRef.current;

    if(!printContent) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=900');

    if(!printWindow) {
      return;
    }

    const headMarkup = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((node) => node.outerHTML)
      .join('');

    const exportedAt = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date());

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Print Report</title>
          ${headMarkup}
          <style>
          @page {
            size: A4;
            margin: 16mm;
          }

          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: #fff;
            color: #1f2937;
          }

          .report-shell {
            padding: 28px;
          }

          .report-header {
            padding-bottom: 14px;
          }

          .report-header h1 {
            margin: 0 0 6px;
            font-size: 28px;
            font-weight: 700;
          }

          .report-header p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }

          .report-content .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #e5e7eb;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .report-content .MuiCardContent-root {
            padding: 20px;
          }

          .report-content svg {
            max-width: 100%
          }
          </style>
        </head>
        <body>
          <main class="report-shell">
            <header class="report-header">
              <h1>Reports Summary</h1>
              <p>Analytics overview for generated reports, catergory breakdown, and completion performance.</p>
              <p>Prepared on ${exportedAt}</p>
            </header>
            <section class="report-content">
              ${printContent.outerHTML}
            </section>
          </main>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* HEADER */}
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
            Reports
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              fontSize: "0.85rem",
              color: "#71717a",
              lineHeight: 1.6,
            }}
          >
            Report analytics overview showing generated reports and completion
            insights.
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap">
            <Button variant="contained" sx={{ backgroundColor: "#18181b" }}>Generate</Button>
            <Button variant="outlined" sx={{ color: "#18181b", borderColor: "#18181b" }} onClick={handlePrint}>
              Export
            </Button>
            <Button variant="outlined" sx={{ color: "#18181b", borderColor: "#18181b" }}>Filter</Button>
          </Stack>
        </Box>
      </Box>

      <Box ref={printRef} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* METRICS */}
        <Box sx={section}>
          <Box sx={container}>
            <Typography sx={title}>Performance Metrics</Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  sm: "repeat(3,1fr)",
                },
                gap: 2.5,
              }}
            >
              <Paper elevation={0} sx={card}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Gauge width={120} height={80} value={78} />
                </Box>
                <Typography sx={label}>Completion Rate</Typography>
              </Paper>

              <Paper elevation={0} sx={card}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Gauge width={120} height={80} value={64} />
                </Box>
                <Typography sx={label}>Pending Reports</Typography>
              </Paper>

              <Paper elevation={0} sx={card}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Gauge width={120} height={80} value={91} />
                </Box>
                <Typography sx={label}>On-Time Delivery</Typography>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* CHARTS */}
        <Box sx={section}>
          <Box sx={container}>
            <Typography sx={title}>Quarterly Analytics</Typography>

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

              <Paper elevation={0} sx={card}>
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <BarChart
                    height={260}
                    series={[
                      { data: [18, 24, 20, 27], label: "Generated" },
                      { data: [12, 19, 17, 23], label: "Completed" },
                    ]}
                    xAxis={[
                      {
                        data: ["January", "February", "March", "April"],
                        scaleType: "band",
                        label: "Months",
                      },
                    ]}
                  />
                </Box>
              </Paper>

              <Paper elevation={0} sx={card}>
                <Box
                  sx={{
                    height: 300,
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
                          { id: 0, value: 14, label: "Sales"},
                          { id: 1, value: 10, label: "Users"},
                          { id: 2, value: 8, label: "Inventory"},
                          { id: 3, value: 6, label: "Finance"},
                        ],
                      },
                    ]}
                  />
                </Box>
              </Paper>

            </Box>
          </Box>
        </Box>

        {/* TABLE */}
        <Box sx={section}>
          <Box sx={container}>
            <Typography sx={title}>Recent Reports</Typography>

            <Paper elevation={0} sx={card}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5 },
                  },
                }}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
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
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}