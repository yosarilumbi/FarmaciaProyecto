import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Productos from './src/Componentes/Productos';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import ListaProductos from './src/Componentes/ListarProductos';
import Grafico from './src/Componentes/Grafico';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Productos" 
        component={Productos} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="production-quantity-limits" size={size} color={color} />
          ),
        }}
      />

        <Tab.Screen 
        name="ListarProducto" 
        component={ListaProductos} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="clipboard-list" size={24} color="black" />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Grafico" 
        component={Grafico} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="bar-graph" size={24} color="black" />
          ),
        }}
      />


    </Tab.Navigator>
  );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
