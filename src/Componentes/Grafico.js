import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; 
import { BarChart } from "react-native-chart-kit";
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../Conexion/firebaseConfig';

export default function Grafico({ dataSalarios }) {

  const [dataPrecios, setDataPrecios] = useState({
    labels: [''],
    datasets: [{ data: [0] }]
  });

 
  useEffect(() => {
    const recibirDatosPrecios = async () => {
      try {
        const q = query(collection(db, "productos"));
        const querySnapshot = await getDocs(q);
        const nombres = [];
        const precios = [];

        querySnapshot.forEach((doc) => {
          const datosBD = doc.data();
          const { nombre, precio } = datosBD;
          nombres.push(nombre); 
          precios.push(precio); 
        });

      
        setDataPrecios({
          labels: nombres,
          datasets: [{ data: precios }]
        });

        console.log({ labels: nombres, datasets: [{ data: precios }] });
      } catch (error) {
        console.error("Error al obtener los productos y precios: ", error);
      }
    };

    recibirDatosPrecios();
  }, []);

  const generarPDF = async () => {
    try {
      
      const doc = new jsPDF();

    
      doc.text("Reporte de Salarios", 10, 10);

    
      dataSalarios.labels.forEach((label, index) => {
        const salario = dataSalarios.datasets[0].data[index];
        doc.text(`${label}: C$${salario}`, 10, 20 + index * 10); 
      });

      
      const pdfBase64 = doc.output('datauristring').split(',')[1];

     
      const fileUri = `${FileSystem.documentDirectory}reporte_salarios.pdf`;

     
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      
      await Sharing.shareAsync(fileUri);
      
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  let screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <BarChart
        data={dataPrecios}
        width={screenWidth - (screenWidth * 0.1)}
        height={300}
        yAxisLabel="C$"
        chartConfig={{
          backgroundGradientFrom: "#FFFF00",
          backgroundGradientFromOpacity: 0.4,
          backgroundGradientTo: "#FFFF00", 
          backgroundGradientToOpacity: 1,
          color: (opacity = 1) => `rgba(2, 2, 2, ${opacity})`, 
          strokeWidth: 2,
          barPercentage: 0.5,
          useShadowColorFromDataset: false
        }}
        style={styles.chart}
        verticalLabelRotation={45}
        withHorizontalLabels={true}
        showValuesOnTopOfBars={true}
      />

      <View style={styles.button}>
        <Button title="Generar y Compartir PDF" onPress={generarPDF} color="#000000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFF00', 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chart: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#222222',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
