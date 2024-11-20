import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../Conexion/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Productos = () => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenURL, setImagenURL] = useState(null);
  const [fechacaducidad, setFechacaducidad] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const guardarProducto = async () => {
    if (!nombre || !precio || !descripcion || !cantidad || !categoria || !imagenURL || !fechacaducidad) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      const productoRef = collection(db, "productos"); 
      await addDoc(productoRef, {
        nombre,
        precio,
        descripcion,
        cantidad,
        categoria,
        imagenURL,
        fechacaducidad,
      });

      Alert.alert("Producto guardado con éxito!");

      setNombre('');
      setPrecio('');
      setDescripcion('');
      setCantidad('');
      setCategoria('');
      setImagenURL(null);
      setFechacaducidad('');
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Alert.alert("Hubo un error al guardar el producto.");
    }
  };


  const handleFechaChange = (text) => {

    let newText = text.replace(/[^0-9/]/g, ''); 
   
    if (newText.length === 2 || newText.length === 5) {
      newText += '/'; 
    }
    
    setFechacaducidad(newText);
  };

  const seleccionarFoto = async (source) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Se necesita permiso para acceder a la cámara o galería.");
      return;
    }

    let result;
    if (source === 'camera') {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert("Se necesita permiso para acceder a la cámara.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImagenURL(result.assets[0].uri);
    }
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.fotoContainer}>
        {imagenURL && (
          <Image
            source={{ uri: imagenURL }}
            style={styles.fotoPerfil}
          />
        )}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectPhotoButton}>
          <Text style={styles.selectPhotoText}>Seleccionar Foto del Producto</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nombre del Producto:</Text>
      <TextInput 
        style={styles.input} 
        value={nombre} 
        onChangeText={setNombre} 
        placeholder="Nombre del producto" 
      />

      <Text style={styles.label}>Precio:</Text>
      <TextInput 
        style={styles.input} 
        value={precio} 
        onChangeText={setPrecio} 
        placeholder="Precio" 
        keyboardType="numeric" 
      />

      <Text style={styles.label}>Descripción:</Text>
      <TextInput 
        style={styles.input} 
        value={descripcion} 
        onChangeText={setDescripcion} 
        placeholder="Descripción del producto" 
        multiline 
      />

      <Text style={styles.label}>Cantidad:</Text>
      <TextInput 
        style={styles.input} 
        value={cantidad} 
        onChangeText={setCantidad} 
        placeholder="Cantidad disponible" 
        keyboardType="numeric" 
      />

      <Text style={styles.label}>Categoría:</Text>
      <TextInput 
        style={styles.input} 
        value={categoria} 
        onChangeText={setCategoria} 
        placeholder="Categoría del producto" 
      />
      
      <Text style={styles.label}>Fecha Caducidad:</Text>
      <TextInput 
        style={styles.input} 
        value={fechacaducidad} 
        onChangeText={handleFechaChange} 
        placeholder="Fecha Caducidad de Producto" 
      />
        
      <TouchableOpacity style={styles.button} onPress={guardarProducto}>
        <Text style={styles.buttonText}>Guardar Producto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Seleccionar foto del producto</Text>
            <TouchableOpacity onPress={() => seleccionarFoto('camera')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seleccionarFoto('gallery')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Seleccionar de la Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  selectPhotoButton: {
    backgroundColor: '#C82A54',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  selectPhotoText: {
    color: '#fff',
    fontSize: 16,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#C82A54',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#C82A54',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#FF6347',
  },
});

export default Productos;
