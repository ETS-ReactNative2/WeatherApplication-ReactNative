import axios from 'axios'
import React, {useEffect, useState, useCallback, useLayoutEffect} from 'react'
import { View, ScrollView, StyleSheet, ImageBackground, Image, TouchableOpacity , FlatList, Platform} from 'react-native'
import { Button, Text } from 'react-native-elements';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';


const Main = ({navigation}) => {
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)
    const [current, setCurrent] = useState(null)
    const [hourly, setHourly] = useState(null)
    const [alert, setAlert] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [appIsReady, setAppIsReady] = useState(false);
    const image = "/assets/image.png"

    const refresh = () => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setError('Permission to access location was denied');
              return;
            }
      
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            if(error == null){
                await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=affd0627e677b629d379eb014262f11c`)
                .then(res => {
                    setCurrent(res.data);
                }).catch(err => {
                    setError(err);
                })
                await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.latitude}&lon=${location.coords.longitude}&exclude=current,minutely,daily&appid=affd0627e677b629d379eb014262f11c`)
                .then(res => {
                    setHourly(res.data.hourly);
                    setAlert(res.data.alerts)
                }).catch(err => {
                    setError(err);
                })
                setIsLoading(false);
                setAppIsReady(true)
            }
        })();
    }
      
    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
                refresh();
            } catch (e) {
              console.warn(e);
            }
          }
          prepare();
    }, [])

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            navigation.setOptions({
                title: current.name,
              });
            await SplashScreen.hideAsync();
        }
      }, [appIsReady]);
    
      if (!appIsReady) {
        return null;
      }

    return (
        <LinearGradient colors={['rgb(47, 99,147)', 'white']}
        style={{backgroundColor: 'rgb(47, 99,147)'}}>
        <ScrollView onLayout={onLayoutRootView}>
            <View style={Styles.container, {marginTop: 60}}>
                <View style={Styles.tempText}>
                    <Text style={{fontSize: 100, lineHeight: 100, color: 'white'}}>{Math.round(current.main.temp - 273.15)}</Text>
                    <Text style={{fontSize: 25, fontWeight: 'bold', lineHeight: 25, textAlignVertical: 'top', color: 'white'}}>&deg;C</Text>
                </View>
                <Text h3 style={[Styles.headText, {color: 'white', marginTop: 10}]}>{current.weather[0].main}</Text>
                <View style={Styles.todayContainer}>
                    <Image source = {{uri : `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}} style = {{ width: 40, height: 40 }}/>
                    <Text style={{lineHeight: 40,color: 'white', fontSize: 18}}>Today - {current.weather[0].main}</Text>
                    <Text style={{marginLeft: 'auto', lineHeight: 40, color: 'white', fontSize: 18}}>{Math.round(current.main.temp_min - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(current.main.temp_max - 273.15)}&deg;</Text>
                </View>
                <FlatList
                    contentContainerStyle={Styles.horizontalContainer}
                    horizontal
                    data={hourly}
                    keyExtractor={item => item.dt}
                    renderItem={({item}) => {
                        return (
                            <>
                            <View style = {Styles.hourlyContainer}>
                                <Text style={{color: 'rgb(221, 236, 247)'}}>{new Date(item.dt*1000).getHours()}:00</Text>
                                <Text style={{fontSize: 18, color: 'white', paddingTop: 5}}>{Math.round(item.temp - 273.15)}&deg;</Text>
                                <Image source = {{uri : `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}} style = {{ width: 50, height: 50 }}/>
                                <Text style={{color: 'rgb(221, 236, 247)'}}>{Math.round(item.wind_speed)} km/h</Text>
                            </View>
                            </>
                        )
                    }}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    legacyImplementation={false}
                />
                <TouchableOpacity style={Styles.daysButton} onPress={() => navigation.navigate('DailyForecast', {lat: location.coords.latitude, lon: location.coords.longitude})}>
                    <Text h4 style={{textAlign: 'center', color: 'white'}}>7-day forecast</Text>
                </TouchableOpacity>
                <View style={Styles.todayDetailsContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{color: 'rgb(196, 222, 241)'}}>Sunrise {new Date(current.sys.sunrise*1000).getHours()}:{new Date(current.sys.sunrise*1000).getMinutes()}</Text>
                        <Text style={{marginLeft: 'auto', color: 'rgb(196, 222, 241)'}}>Sunset {new Date(current.sys.sunset*1000).getHours()}:{new Date(current.sys.sunset*1000).getMinutes()}</Text>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Real Feel</Text>
                            <Text style={Styles.value}>{(current.main.feels_like - 273.15).toFixed(1)}&deg;C</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Humidity</Text>
                            <Text style={Styles.value}>{current.main.humidity}%</Text>
                        </View>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Wind Speed</Text>
                            <Text style={Styles.value}>{Math.round(current.wind.speed)} km/h</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Pressure</Text>
                            <Text style={Styles.value}>{current.main.pressure} mbar</Text>
                        </View>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Wind Gusts</Text>
                            <Text style={Styles.value}>{Math.round(current.wind.gust)} km/h</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Cloud Cover</Text>
                            <Text style={Styles.value}>{current.clouds.all}%</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
        </LinearGradient>
    )
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    imgBackground: {
        width: '100%',
        height: '100%',
        flex: 1 
    },
    headText:{
        textAlign: 'center',
        color: '#F5FFFA',
        fontWeight: 'normal'
    },
    tempText: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignSelf: 'center',
        marginTop: 60,
        color: '#ffffff',
    },
    todayContainer: {
        flex: 1,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        padding: 10,
        flexDirection: 'row'
    },
    daysButton: {
        marginLeft: 40,
        marginRight: 40,
        padding: 12,
        backgroundColor: '#4287f5',
        borderRadius: 50,
    },
    todayDetailsContainer: {
        flex: 1,
        margin: 20,
        padding: 20,
        backgroundColor: 'rgba(130, 130, 130, 0.65)',
        borderRadius: 15,
    },
    horizontalContainer: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
    },
    hourlyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    rowStyle: {
        flex: 1, 
        alignSelf: 'stretch', 
        flexDirection: 'row',
        marginTop: 20,
    },
    columnStyle: { 
        flex: 1, 
        alignSelf: 'stretch'
    },
    value: {
        marginTop: 5,
        fontSize: 20,
        color: 'white'
    },
    question: {
        color: 'rgb(221, 236, 247)'
    }
})

export default Main
