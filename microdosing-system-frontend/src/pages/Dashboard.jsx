import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Package, ClipboardList, Activity, CheckCircle } from 'lucide-react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import ThemeDropdown from '../components/ThemeDropdown';
import { useTheme } from '../context/ThemeContext';
import { generateShades, getContrastColor } from '../utils/colorUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    materials: 0,
    recipes: 0,
    activeOrders: 0,
    completedBatches: 0
  });
  const [productChart, setProductChart] = useState({ labels: [], data: [] });
  const location = useLocation();
  const successMessage = location.state?.message;
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const historicalChartRef = useRef(null);
  const { themeColor } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialRes, recipesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/materials'),
          axios.get('http://localhost:5000/api/recipes')
        ]);
        const materials = materialRes.data;
        setStats(prev => ({
          ...prev,
          materials: materials.length,
          recipes: recipesRes.data.length
        }));
        const dynamicLabels = materials.map(m => m.title);
        const dynamicData = materials.map(m => m.current_quantity || 0);
        setProductChart({ labels: dynamicLabels, data: dynamicData });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const barColors = generateShades(themeColor, 5);
  const pieColors = generateShades(themeColor, 5);
  const kpiColors = generateShades(themeColor, 5);
  const cardTextColor = getContrastColor(themeColor);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: 'easeInOutBounce' },
    plugins: {
      legend: { position: 'bottom', labels: { color: '#374151' } }
    },
    scales: {
      y: { grid: { color: '#D1D5DB' }, ticks: { color: '#374151' } },
      x: { grid: { display: false }, ticks: { color: '#374151' } }
    }
  };

  const barChartData = {
    labels: productChart.labels,
    datasets: [
      { label: 'Product Usage', data: productChart.data, backgroundColor: barColors }
    ]
  };

  const pieChartData = {
    labels: productChart.labels,
    datasets: [
      { data: productChart.data, backgroundColor: pieColors }
    ]
  };

  const historicalKpiData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      { label: "Tolerance %", data: [96, 89, 94, 90, 92], backgroundColor: kpiColors }
    ]
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="text-gray-800 font-semibold">
          Welcome to the Dashboard!
        </Typography>
        <ThemeDropdown />
      </Box>

      {successMessage && (
        <Box className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          {successMessage}
        </Box>
      )}

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Materials', value: stats.materials, icon: <Package className="w-8 h-8" style={{ color: cardTextColor }} /> },
          { label: 'Recipes', value: stats.recipes, icon: <ClipboardList className="w-8 h-8" style={{ color: cardTextColor }} /> },
          { label: 'Active Orders', value: stats.activeOrders, icon: <Activity className="w-8 h-8" style={{ color: cardTextColor }} /> },
          { label: 'Completed Batches', value: stats.completedBatches, icon: <CheckCircle className="w-8 h-8" style={{ color: cardTextColor }} /> }
        ].map(({ label, value, icon }) => (
          <Card key={label} className="shadow-md" style={{ backgroundColor: themeColor, color: cardTextColor }}>
            <CardContent className="flex flex-col items-center text-center">
              <Box className="mb-2">{icon}</Box>
              <Typography variant="body2" style={{ color: cardTextColor }}>{label}</Typography>
              <Typography variant="h5" className="font-bold mt-1" style={{ color: cardTextColor }}>{value}</Typography>
              <Link
                to={
                  label === 'Materials' ? '/material'
                  : label === 'Active Orders' ? '/activeorders'
                  : `/${label.toLowerCase().replace(' ', '-')}`
                }
                className="mt-3 text-sm underline"
                style={{ color: cardTextColor }}
              >
                View All
              </Link>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Product Distribution</Typography>
            <Box className="h-80">
              <Bar ref={barChartRef} options={chartOptions} data={barChartData} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">By Product</Typography>
            <Box className="h-80">
              <Pie ref={pieChartRef} options={chartOptions} data={pieChartData} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card className="mt-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">Tolerance Historical KPI</Typography>
          <Box className="h-80">
            <Bar ref={historicalChartRef} options={chartOptions} data={historicalKpiData} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
