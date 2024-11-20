import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Button } from 'react-native-paper';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../Conexion/firebaseConfig';
import * as Print from 'expo-print'; 
import * as Sharing from 'expo-sharing'; 
import { captureRef } from 'react-native-view-shot'; 

export default function Grafico() {
  const [dataPrecios, setDataPrecios] = useState({
    labels: [''],
    datasets: [{ data: [0] }], 
  });
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const recibirDatosPrecios = async () => {
      try {
        const q = query(collection(db, 'productos'));
        const querySnapshot = await getDocs(q);
        const nombres = [];
        const precios = [];

        querySnapshot.forEach((doc) => {
          const datosBD = doc.data();
          const { nombre, precio } = datosBD;
          nombres.push(nombre);
          precios.push(parseFloat(precio)); 
        });

        setDataPrecios({
          labels: nombres,
          datasets: [{ data: precios }], 
        });
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los productos y precios: ', error);
        setLoading(false);
      }
    };

    recibirDatosPrecios();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const generarReportePDF = async () => {
    const { labels, datasets } = dataPrecios;

    if (labels.length === 0 || datasets[0].data.length === 0) {
      Alert.alert('Advertencia', 'No hay datos disponibles para generar el reporte.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #ffffff; }
            h1 { text-align: center; color: #4CAF50; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #4CAF50; color: white; }
            td { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Reporte de Precios de Productos</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio ($)</th>
              </tr>
            </thead>
            <tbody>
              ${labels.map((label, index) => `
                <tr>
                  <td>${label}</td>
                  <td>${datasets[0].data[index]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const fileUri = await Print.printToFileAsync({ html: htmlContent });

    Sharing.shareAsync(fileUri.uri);
  };

  const generarYCompartirImagen = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: 'png',
        quality: 1,
      });

      const htmlContent = `
        <html>
          <body>
            <h1>Reporte de Precios de Productos</h1>
            <img src="data:image/png;base64,${uri}" style="width:100%;"/>
          </body>
        </html>
      `;

      const fileUri = await Print.printToFileAsync({ html: htmlContent });

      Sharing.shareAsync(fileUri.uri);
    } catch (error) {
      console.error('Error al generar la imagen y compartir el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al generar el reporte.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text>Cargando datos...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.titulo}>Gráfico de Precios de Productos</Text>
          <BarChart
            ref={chartRef}
            data={dataPrecios}
            width={screenWidth - 40}
            height={250}
            yAxisSuffix=" $"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.grafico}
          />

          <Button mode="contained" onPress={generarReportePDF} style={styles.button}>
            Generar Reporte en PDF
          </Button>

          <Button mode="contained" onPress={generarYCompartirImagen} style={styles.button}>
            Generar Reporte con Gráfico
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#C82A54',
  },
  grafico: {
    marginVertical: 10,
    borderRadius: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
  },
});
