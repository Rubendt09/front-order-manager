/* eslint-disable */
import { useEffect, useState } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import AppWebsiteVisits from '../app-website-visits';
import OrderStats from '../order-stats';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AppView() {
  const [chartData, setChartData] = useState(null);
  const [orderStats, setOrderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}order-stats`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las estadísticas de órdenes');
        }

        const data = await response.json();
        setOrderStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}chart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        console.log(response);

        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

    fetchOrderStats();
  }, []);

  if (loading) {
    return <Typography variant="h6">Cargando estadísticas...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{`Error: ${error}`}</Typography>;
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hola, Bienvenido a Order Manager 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Clientes vs Ordenes"
            subheader="Ideal para comparar el número de clientes y órdenes, a lo largo del tiempo"
            chart={{
              labels: chartData.labels,
              series: chartData.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <OrderStats
            title="Estados de las órdenes"
            chart={{
              series: orderStats,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
