import axios from 'axios'
import React, {useEffect, useState, useCallback} from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity , FlatList, Platform} from 'react-native'
import { Text } from 'react-native-elements';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import CachedImage from 'react-native-expo-cached-image';


const Main = ({navigation}) => {
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)
    const [timezone, setTimezone] = useState(0)
    const [city, setCity] = useState("City")
    const [current, setCurrent] = useState(null)
    const [hourly, setHourly] = useState(null)
    const [daily, setDaily] = useState(null)
    const [alert, setAlert] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [appIsReady, setAppIsReady] = useState(false);
      

    const getDay = (value) => {
        const days = ["Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday"];
        return days[value];
    }
    useEffect(() => {
        let isMounted = true;
        const initialFetch = async() => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if(isMounted) setError('Permission to access location was denied');
                return;
            }
        
            let location = await Location.getCurrentPositionAsync({})
            if(isMounted) setLocation(location);
    
            await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=1&appid=affd0627e677b629d379eb014262f11c`)
            .then(res => {
                if(isMounted) setCity(res.data[0]);
            }).catch(err => {
                if(isMounted) setError(err);
            })
            await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.latitude}&lon=${location.coords.longitude}&exclude=minutely&appid=affd0627e677b629d379eb014262f11c`)
            .then(res => {
                if(isMounted){
                    setTimezone(res.data.timezone_offset);
                    setCurrent(res.data.current);
                    setHourly(res.data.hourly);
                    setDaily(res.data.daily);
                    setAlert(res.data.alerts);
                }
            }).catch(err => {
                if(isMounted) setError(err);
            })
            setAppIsReady(true)
        }
    
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
            } catch (e) {
              console.warn(e);
            }
        }
        prepare();
        initialFetch();
        return () => { isMounted = false };
    }, [])

    const onRefresh = useCallback(() => {
        const refresh = async() => { 
            let location = await Location.getCurrentPositionAsync({})
            setLocation(location);
            
            await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.latitude}&lon=${location.coords.longitude}&exclude=minutely&appid=affd0627e677b629d379eb014262f11c`)
            .then(res => {
                setTimezone(res.data.timezone_offset);
                setCurrent(res.data.current)
                setHourly(res.data.hourly);
                setDaily(res.data.daily);
                setAlert(res.data.alerts)
            }).catch(err => {
                setError(err);
            }).finally(()=>{
                setIsRefreshing(false)
            })
        }
        setIsRefreshing(true);
        refresh();
      }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
            navigation.setOptions({
                title: city.name
            })
        }
      }, [appIsReady]);
    
      if (!appIsReady) {
        return null;
      }

    return (
        <LinearGradient colors={['rgb(47, 99,147)', 'rgb(184, 210, 233)']}
        style={{backgroundColor: 'rgb(47, 99,147)'}}>
        <ScrollView onLayout={onLayoutRootView} refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['rgb(47, 99,147)']}/>
          }>
            <View style={Styles.container}>
                <View style={Styles.tempText}>
                    <Text style={{fontSize: 100, lineHeight: 100, color: 'white'}}>{Math.round(current.temp - 273.15)}</Text>
                    <Text style={{fontSize: 25, fontWeight: 'bold', lineHeight: 25, textAlignVertical: 'top', color: 'white'}}>&deg;C</Text>
                </View>
                <Text h3 style={[Styles.headText, {color: 'white', marginTop: 10}]}>{current.weather[0].main}</Text>
                {daily && (
                    <View style={Styles.dayContainer}>
                        <View style={Styles.todayContainer}>
                            <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${daily[0].weather[0].icon}@2x.png`}} style = {{ width: 40, height: 40 }}/>
                            <Text style={Styles.dayText}>Tomorrow - {daily[0].weather[0].main}</Text>
                            <Text style={[Styles.dayText,{marginLeft: 'auto'}]}>{Math.round(daily[0].temp.max - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(daily[0].temp.min - 273.15)}&deg;</Text>
                        </View>
                        <View style={Styles.todayContainer}>
                            <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${daily[1].weather[0].icon}@2x.png`}} style = {{ width: 40, height: 40 }}/>
                            <Text style={Styles.dayText}>{getDay(new Date(daily[1].dt*1000).getDay())} - {daily[1].weather[0].main}</Text>
                            <Text style={[Styles.dayText,{marginLeft: 'auto'}]}>{Math.round(daily[1].temp.max - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(daily[1].temp.min - 273.15)}&deg;</Text>
                        </View>
                        <View style={Styles.todayContainer}>
                            <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${daily[2].weather[0].icon}@2x.png`}} style = {{ width: 40, height: 40 }}/>
                            <Text style={Styles.dayText}>{getDay(new Date(daily[2].dt*1000).getDay())} - {daily[2].weather[0].main}</Text>
                            <Text style={[Styles.dayText,{marginLeft: 'auto'}]}>{Math.round(daily[2].temp.max - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(daily[2].temp.min - 273.15)}&deg;</Text>
                        </View>
                    </View>
                )}
                
                <TouchableOpacity style={Styles.daysButton} onPress={() => navigation.navigate('DayForecast', {lat: location.coords.latitude, lon: location.coords.longitude, name: city.name, data: daily})}>
                    <Text h4 style={{textAlign: 'center', color: 'white'}}>8-day forecast</Text>
                </TouchableOpacity>
                {hourly && (
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
                                    <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}} style = {{ width: 50, height: 50 }}/>
                                    <Text style={{color: 'rgb(221, 236, 247)'}}>{item.wind_speed.toFixed(1) } km/h</Text>
                                </View>
                                </>
                            )
                        }}
                        pagingEnabled={true}
                        showsHorizontalScrollIndicator={true}
                        legacyImplementation={false}
                    />
                )}
                <View style={Styles.todayDetailsContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{color: 'rgb(196, 222, 241)'}}>Sunrise {new Date(current.sunrise*1000).getHours()}:{new Date(current.sunrise*1000).getMinutes()}</Text>
                        <Text style={{marginLeft: 'auto', color: 'rgb(196, 222, 241)'}}>Sunset {new Date(current.sunset*1000).getHours()}:{new Date(current.sunset*1000).getMinutes()}</Text>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Real Feel</Text>
                            <Text style={Styles.value}>{(current.feels_like - 273.15).toFixed(1)}&deg;C</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Humidity</Text>
                            <Text style={Styles.value}>{current.humidity}%</Text>
                        </View>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Wind Speed</Text>
                            <Text style={Styles.value}>{Math.round(current.wind_speed)} km/h</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Pressure</Text>
                            <Text style={Styles.value}>{current.pressure} mbar</Text>
                        </View>
                    </View>
                    <View style={Styles.rowStyle}>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Wind Gusts</Text>
                            <Text style={Styles.value}>{Math.round(current.wind_gust)} km/h</Text>
                        </View>
                        <View style={Styles.columnStyle}>
                            <Text style={Styles.question}>Cloud Cover</Text>
                            <Text style={Styles.value}>{current.clouds}%</Text>
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
        marginTop: 60
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
    dayContainer: {
        flex: 1,
        marginLeft: 30,
        marginRight: 40,
        marginTop: 15,
        marginBottom: 15,
    },
    todayContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    dayText: {
        lineHeight: 40,
        color: 'white',
        fontSize: 16,
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
        backgroundColor: 'rgb(142, 159, 173)',
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
