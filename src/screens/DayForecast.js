import React, {useState, useEffect, useCallback} from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl} from 'react-native'
import axios from 'axios'
import { LinearGradient } from 'expo-linear-gradient';
import CachedImage from 'react-native-expo-cached-image';

const DayForecast = ({navigation, route}) => {
    const [timezone , setTimezone] = useState(0);
    const [daily, setDaily] = useState(null);
    const [error, setError] = useState(null)
    const [appIsReady, setAppIsReady] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false)

    const getDay = (value) => {
        const days = ["Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday"];
        return days[value];
    }
    
    const initFetch = () => {
        (async () => {
            axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${route.params.lat}&lon=${route.params.lon}&exclude=current,minutely,hourly,alerts&appid=affd0627e677b629d379eb014262f11c`)
            .then(response => {
                setTimezone(response.data.timezone_offset);
                setDaily(response.data.daily);
            }).catch(err => {
                setError(err);
            }).finally(()=>{
                setIsRefreshing(false)
            })
        })();
    }

    useEffect(() => {
        setDaily(route.params.data);
    }, []);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        initFetch()
      }, []);

    const onLayoutRootView = useCallback(() => {
        navigation.setOptions({
            title: route.params.name
        })
      }, []);

    return (
        <LinearGradient colors={['rgb(47, 99,147)', 'rgb(184, 210, 233)']}
        style={{backgroundColor: 'rgb(47, 99,147)'}}>
            <FlatList 
            onLayout={onLayoutRootView}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['rgb(47, 99,147)']}/>
              }
            contentContainerStyle={Styles.listContainer}
            data={daily}
            keyExtractor={item => item.dt}
            renderItem={({item}) => {
                return(
                    <>
                    <View style={Styles.dailyContainer}>
                        <View style={Styles.row}>
                            <View style={Styles.column}>
                                <Text style={{color: 'rgb(51, 51, 51)', fontSize: 18, fontWeight: '700'}}>{getDay(new Date(item.dt*1000).getDay())}</Text>
                                <Text style={{color: 'rgb(81, 81, 81)', fontSize: 22, fontWeight: 'bold'}}>{Math.round(item.temp.max - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(item.temp.min - 273.15)}&deg;</Text>
                            </View>
                            <View style={Styles.column, {marginLeft: 'auto'}}>
                                <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}} style = {{ width: 60, height: 60 }}/>
                            </View>
                        </View>
                        <View style={Styles.row}>
                            <View style={Styles.column}>
                                <Text style={{color: 'rgb(81, 81, 81)', fontSize: 18, fontWeight: '500'}}>{item.wind_speed.toFixed(1)} km/h</Text>
                            </View>
                            <View style={Styles.column, {marginLeft: 'auto'}}>
                                <Text style={{color: 'rgb(37, 81, 176)', fontSize: 18, fontWeight: '500'}}>{item.weather[0].main}</Text>
                            </View>
                        </View>
                    </View>
                    </>
                )
            }}
            />
        </LinearGradient>
    )
}

const Styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        margin: 20,
    },
    dailyContainer: {
        flex: 1,
        padding: 15,
        margin: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(226, 226, 226, 0.30)',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    column: {
        flex: 1,
    }
})

export default DayForecast
