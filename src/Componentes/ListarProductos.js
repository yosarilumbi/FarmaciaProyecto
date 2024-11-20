import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Button, RefreshControl } from 'react-native';
import { db } from '../../Conexion/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    obtenerProductos();
  }, []);

  
  const obtenerProductos = async () => {
    try {
      const productosRef = collection(db, "productos");
      const snapshot = await getDocs(productosRef);
      const productosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosData);
      setRefreshing(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      Alert.alert("Error", "Hubo un problema al cargar los productos. Intenta nuevamente.");
      setRefreshing(false); 
    }
  };

  
  const onRefresh = () => {
    setRefreshing(true);  
    obtenerProductos();   
  };

  
  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      Alert.alert("Producto eliminado con éxito.");
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      Alert.alert("Error", "Hubo un problema al eliminar el producto.");
    }
  };

 
  const abrirEditarProducto = (producto) => {
    setProductoEdit(producto);
    setModalVisible(true);
  };

  
  const guardarEdicion = async () => {
    if (!productoEdit.nombre || !productoEdit.categoria || !productoEdit.descripcion || !productoEdit.precio) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos.");
      return;
    }

    const precio = parseFloat(productoEdit.precio);
    if (isNaN(precio)) {
      Alert.alert("Error", "El precio debe ser un número válido.");
      return;
    }

    try {
      const productoRef = doc(db, "productos", productoEdit.id);
      await updateDoc(productoRef, {
        nombre: productoEdit.nombre,
        categoria: productoEdit.categoria,
        descripcion: productoEdit.descripcion,
        imagenURL: productoEdit.imagenURL,
        precio: precio,
      });
      Alert.alert("Producto actualizado con éxito.");
      setModalVisible(false);
      obtenerProductos();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      Alert.alert("Error", "Hubo un problema al actualizar el producto.");
    }
  };

 
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imagenURL ? (
        <Image source={{ uri: item.imagenURL }} style={styles.imagen} />
      ) : (
        <Text style={styles.noImagen}>Sin Imagen</Text>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.categoria}>{item.categoria}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.precio}>
          {item.precio ? `${item.precio}` : 'Precio no disponible'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => abrirEditarProducto(item)} style={styles.editButton}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => eliminarProducto(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}  
            onRefresh={onRefresh}    
          />
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Producto</Text>
            <TextInput
              style={styles.input}
              value={productoEdit?.nombre}
              onChangeText={(text) => setProductoEdit({ ...productoEdit, nombre: text })}
              placeholder="Nombre del Producto"
            />
            <TextInput
              style={styles.input}
              value={productoEdit?.categoria}
              onChangeText={(text) => setProductoEdit({ ...productoEdit, categoria: text })}
              placeholder="Categoría"
            />
            <TextInput
              style={styles.input}
              value={productoEdit?.descripcion}
              onChangeText={(text) => setProductoEdit({ ...productoEdit, descripcion: text })}
              placeholder="Descripción"
              multiline
            />
            <TextInput
              style={styles.input}
              value={productoEdit?.precio?.toString()} 
              onChangeText={(text) => setProductoEdit({ ...productoEdit, precio: text })}
              placeholder="Precio"
              keyboardType="numeric"
            />
            <Button title="Guardar Cambios" onPress={guardarEdicion} />
            <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  lista: { paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  noImagen: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#ccc',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 80,
  },
  infoContainer: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  categoria: { fontSize: 14, color: '#777', marginVertical: 4 },
  descripcion: { fontSize: 14, color: '#555' },
  precio: { fontSize: 16, color: '#333', fontWeight: 'bold' }, 
  actions: { flexDirection: 'row' },
  editButton: { backgroundColor: '#4CAF50', padding: 5, borderRadius: 5, marginRight: 5 },
  editText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#f44336', padding: 5, borderRadius: 5 },
  deleteText: { color: '#fff', fontWeight: 'bold' },
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
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default ListaProductos;
