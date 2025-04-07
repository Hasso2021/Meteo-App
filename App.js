import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = 'b25c65b4654bfcd1cf41d7fb71b7eb27'; 
export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission refusée pour la localisation");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      try {
        // Météo actuelle
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&lang=fr&appid=${API_KEY}`;
        const currentResponse = await fetch(currentUrl);
        const currentData = await currentResponse.json();
        setWeather(currentData);

        // Prévisions horaires
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&lang=fr&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
       // console.log(forecastData);
        // Filtrer les prévisions horaires pour les 6 prochaines 
        const nextSixHours = forecastData.list.slice(0, 6); // First 6 intervals (3-hour steps)
        setHourlyForecast(nextSixHours);
      } catch (error) {
        setErrorMsg("Erreur lors de la récupération des données météo");
        console.error(error);
      }
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { main, weather: weatherInfo } = weather;
  const icon = weatherInfo[0].icon;
  const description = weatherInfo[0].description;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌤️  Météo actuelle</Text>
      <Text style={styles.text}> 🌡  Température : {main.temp} °C</Text>
      <Text style={styles.text}> 🥵 Ressentie : {main.feels_like} °C</Text>
      <Text style={styles.text}> 💧 Humidité : {main.humidity} %</Text>
      <Text style={styles.text}> ☁️ {description}</Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/${icon}@4x.png` }}
        style={{ width: 100, height: 100 }}
      />

      <Text style={[styles.title, { marginTop: 30 }]}> Prévisions horaires</Text>
      {hourlyForecast.map((hour, index) => (
        <View key={index} style={styles.forecastItem}>
          <Text style={styles.hour}>{new Date(hour.dt * 1000).getHours()}h</Text>
          <Text style={styles.temp}>{hour.main.temp}°C</Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png` }}
            style={{ width: 40, height: 40 }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 100,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#eef',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  hour: {
    fontSize: 16,
    width: 60,
  },
  temp: {
    fontSize: 16,
    width: 80,
  },
});